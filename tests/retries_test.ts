/**
 * Tests for withRetries (src/lib/api/retries.ts)
 * Covers: success on first try, retry on failure, no-retry on 404/5xx, 429 handling
 */
import { assertEquals, assertRejects } from "jsr:@std/assert";
import { withRetries } from "../src/lib/api/retries.ts";
import { ApiError } from "../src/lib/api/client.ts";

Deno.test("withRetries - returns value on first successful call", async () => {
  let calls = 0;
  const result = await withRetries(() => {
    calls++;
    return Promise.resolve("ok");
  }, 3, 0);
  assertEquals(result, "ok");
  assertEquals(calls, 1);
});

Deno.test("withRetries - retries on generic error and eventually succeeds", async () => {
  let calls = 0;
  const result = await withRetries(() => {
    calls++;
    if (calls < 3) return Promise.reject(new Error("transient"));
    return Promise.resolve("success");
  }, 3, 0);
  assertEquals(result, "success");
  assertEquals(calls, 3);
});

Deno.test("withRetries - throws after exhausting all retries", async () => {
  let calls = 0;
  await assertRejects(
    () =>
      withRetries(() => {
        calls++;
        return Promise.reject(new Error("always fails"));
      }, 3, 0),
    Error,
  );
  assertEquals(calls, 3);
});

Deno.test("withRetries - does NOT retry on 404 ApiError", async () => {
  let calls = 0;
  await assertRejects(
    () =>
      withRetries(() => {
        calls++;
        return Promise.reject(new ApiError(404, "Not Found"));
      }, 3, 0),
    ApiError,
  );
  assertEquals(calls, 1); // no retry
});

Deno.test("withRetries - does NOT retry on 5xx ApiError", async () => {
  let calls = 0;
  await assertRejects(
    () =>
      withRetries(() => {
        calls++;
        return Promise.reject(new ApiError(500, "Internal Server Error"));
      }, 3, 0),
    ApiError,
  );
  assertEquals(calls, 1); // no retry
});

Deno.test("withRetries - throws immediately on 429 with large Retry-After", async () => {
  let calls = 0;
  const err = Object.assign(new ApiError(429, "Too Many Requests"), {
    retryAfter: 120, // 120s — above the 10s threshold
  });
  await assertRejects(
    () =>
      withRetries(() => {
        calls++;
        return Promise.reject(err);
      }, 3, 0),
    ApiError,
  );
  assertEquals(calls, 1); // should not retry when wait > 10s
});

Deno.test("withRetries - retries on 429 with small Retry-After", async () => {
  let calls = 0;
  const err = Object.assign(new ApiError(429, "Too Many Requests"), {
    retryAfter: 0, // 0s — will use exponential backoff
  });
  await assertRejects(
    () =>
      withRetries(() => {
        calls++;
        return Promise.reject(err);
      }, 3, 0), // baseDelay=0 so tests stay fast
    ApiError,
  );
  // Should have tried more than once (up to retries limit)
  assertEquals(calls > 1, true);
});
