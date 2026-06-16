/**
 * Tests for withRetries logic (inlined from src/lib/api/retries.ts)
 * Deno-compatible: no external src/ imports needed.
 */
import { assertEquals, assertRejects } from "jsr:@std/assert";

// ── Inlined ApiError + withRetries ────────────────────────────────────────────

class ApiError extends Error {
  retryAfter?: number;
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function withRetries<T>(
  fn: () => Promise<T>,
  retries = 3,
  baseDelay = 500,
): Promise<T> {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      if (error instanceof ApiError && error.status === 404) throw error;
      if (error instanceof ApiError && error.status >= 500) throw error;
      if (error instanceof ApiError && error.status === 429) {
        const retryAfterSec = Number(error.retryAfter) || 0;
        if (retryAfterSec > 10) throw error;
        const waitMs = retryAfterSec > 0
          ? retryAfterSec * 1000 + 200
          : baseDelay * Math.pow(2, attempt) + Math.random() * 500;
        if (attempt >= retries) throw error;
        await delay(waitMs);
        continue;
      }
      if (attempt >= retries) throw error;
      const jitter = Math.random() * 200;
      await delay(baseDelay * Math.pow(2, attempt - 1) + jitter);
    }
  }
  throw new Error("Max retries reached");
}

// ── Tests ─────────────────────────────────────────────────────────────────────

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
  await assertRejects(() =>
    withRetries(() => {
      calls++;
      return Promise.reject(new Error("always fails"));
    }, 3, 0)
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
  assertEquals(calls, 1);
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
  assertEquals(calls, 1);
});

Deno.test("withRetries - throws immediately on 429 with large Retry-After", async () => {
  let calls = 0;
  const err = Object.assign(new ApiError(429, "Too Many Requests"), {
    retryAfter: 120,
  });
  await assertRejects(
    () =>
      withRetries(() => {
        calls++;
        return Promise.reject(err);
      }, 3, 0),
    ApiError,
  );
  assertEquals(calls, 1);
});

Deno.test("withRetries - retries on 429 with small Retry-After", async () => {
  let calls = 0;
  const err = Object.assign(new ApiError(429, "Too Many Requests"), {
    retryAfter: 0,
  });
  await assertRejects(() =>
    withRetries(() => {
      calls++;
      return Promise.reject(err);
    }, 3, 0)
  );
  assertEquals(calls > 1, true);
});
