/**
 * Tests for CircuitBreaker (src/lib/api/circuit-breaker.ts)
 * Covers: success flow, failure threshold, OPEN state, HALF_OPEN recovery
 */
import { assertEquals, assertRejects } from "jsr:@std/assert";
import { CircuitBreaker, CircuitState } from "../src/lib/api/circuit-breaker.ts";
import { ApiError } from "../src/lib/api/client.ts";

// Helper: an action that always succeeds
const ok = <T>(val: T) => () => Promise.resolve(val);

// Helper: an action that always throws a plain network error (not ApiError)
const fail = (msg = "Network error") => () => Promise.reject(new Error(msg));

// Helper: an action that throws an ApiError with a given status
const apiErr = (status: number) => () =>
  Promise.reject(new ApiError(status, `HTTP ${status}`));

Deno.test("CircuitBreaker - passes through successful calls", async () => {
  const cb = new CircuitBreaker(3, 10_000);
  const result = await cb.execute(ok(42));
  assertEquals(result, 42);
});

Deno.test("CircuitBreaker - stays CLOSED after a success resets failure count", async () => {
  const cb = new CircuitBreaker(3, 10_000);
  // Two failures
  await assertRejects(() => cb.execute(fail()));
  await assertRejects(() => cb.execute(fail()));
  // Then one success — resets the counter
  await cb.execute(ok("recovered"));
  // Now two more failures shouldn't open the breaker yet (threshold is 3)
  await assertRejects(() => cb.execute(fail()));
  await assertRejects(() => cb.execute(fail()));
  // Still CLOSED — 3rd failure to trip it
  const result = await cb.execute(ok("still works")).catch(() => "open");
  assertEquals(result, "still works");
});

Deno.test("CircuitBreaker - opens after reaching failure threshold", async () => {
  const cb = new CircuitBreaker(3, 5_000);
  await assertRejects(() => cb.execute(fail()));
  await assertRejects(() => cb.execute(fail()));
  await assertRejects(() => cb.execute(fail())); // threshold hit

  // Next call should fail fast with circuit OPEN message
  await assertRejects(
    () => cb.execute(ok("should not run")),
    Error,
    "Circuit breaker is OPEN",
  );
});

Deno.test("CircuitBreaker - does NOT count ApiError 4xx/5xx toward threshold", async () => {
  const cb = new CircuitBreaker(2, 5_000);
  // Two 404 ApiErrors — should NOT trip the breaker
  await assertRejects(() => cb.execute(apiErr(404)));
  await assertRejects(() => cb.execute(apiErr(404)));
  // Circuit should still be CLOSED — a success call works normally
  const result = await cb.execute(ok("ok"));
  assertEquals(result, "ok");
});
Deno.test("CircuitBreaker - transitions to HALF_OPEN after resetTimeout", async () => {
  const cb = new CircuitBreaker(2, 80); // 80ms reset window
  await assertRejects(() => cb.execute(fail()));
  await assertRejects(() => cb.execute(fail())); // opens breaker

  // Should be OPEN immediately
  await assertRejects(
    () => cb.execute(ok("blocked")),
    Error,
    "Circuit breaker is OPEN",
  );

  // Wait for reset timeout
  await new Promise((r) => setTimeout(r, 100));

  // Should now allow a probe request (HALF_OPEN → CLOSED on success)
  const result = await cb.execute(ok("probe succeeded"));
  assertEquals(result, "probe succeeded");
});

Deno.test("CircuitBreaker - re-opens if probe fails in HALF_OPEN", async () => {
  const cb = new CircuitBreaker(2, 80);
  await assertRejects(() => cb.execute(fail()));
  await assertRejects(() => cb.execute(fail())); // opens

  await new Promise((r) => setTimeout(r, 100)); // wait for HALF_OPEN

  // Probe fails — should re-open
  await assertRejects(() => cb.execute(fail("still down")));

  // Breaker is OPEN again — next call fast-fails
  await assertRejects(
    () => cb.execute(ok("no")),
    Error,
    "Circuit breaker is OPEN",
  );
});

// Expose CircuitState for the export check
Deno.test("CircuitBreaker - CircuitState enum values are exported", () => {
  assertEquals(CircuitState.CLOSED, 0);
  assertEquals(CircuitState.OPEN, 1);
  assertEquals(CircuitState.HALF_OPEN, 2);
});
