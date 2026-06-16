/**
 * Tests for CircuitBreaker logic (inlined from src/lib/api/circuit-breaker.ts)
 * Deno-compatible: no external src/ imports needed.
 */
import { assertEquals, assertRejects } from "jsr:@std/assert";

// ── Inlined ApiError + CircuitBreaker ─────────────────────────────────────────

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

enum CircuitState { CLOSED, OPEN, HALF_OPEN }

class CircuitBreaker {
  private state = CircuitState.CLOSED;
  private failureCount = 0;
  private nextAttemptTime = 0;

  constructor(
    private failureThreshold = 10,
    private resetTimeoutMs = 15_000,
  ) {}

  async execute<T>(action: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() > this.nextAttemptTime) {
        this.state = CircuitState.HALF_OPEN;
      } else {
        throw new Error("Circuit breaker is OPEN. Failing fast.");
      }
    }
    try {
      const result = await action();
      this.failureCount = 0;
      this.state = CircuitState.CLOSED;
      return result;
    } catch (error) {
      if (error instanceof ApiError && error.status >= 400 && error.status < 600) {
        throw error;
      }
      this.failureCount++;
      if (this.failureCount >= this.failureThreshold) {
        this.state = CircuitState.OPEN;
        this.nextAttemptTime = Date.now() + this.resetTimeoutMs;
      }
      throw error;
    }
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const ok = <T>(val: T) => () => Promise.resolve(val);
const fail = (msg = "Network error") => () => Promise.reject(new Error(msg));
const apiErr = (status: number) => () =>
  Promise.reject(new ApiError(status, `HTTP ${status}`));

// ── Tests ─────────────────────────────────────────────────────────────────────

Deno.test("CircuitBreaker - passes through successful calls", async () => {
  const cb = new CircuitBreaker(3, 10_000);
  const result = await cb.execute(ok(42));
  assertEquals(result, 42);
});

Deno.test("CircuitBreaker - success resets failure count", async () => {
  const cb = new CircuitBreaker(3, 10_000);
  await assertRejects(() => cb.execute(fail()));
  await assertRejects(() => cb.execute(fail()));
  await cb.execute(ok("reset"));
  // After reset, two more failures should not open (threshold is 3)
  await assertRejects(() => cb.execute(fail()));
  await assertRejects(() => cb.execute(fail()));
  const result = await cb.execute(ok("still closed")).catch(() => "open");
  assertEquals(result, "still closed");
});

Deno.test("CircuitBreaker - opens after reaching failure threshold", async () => {
  const cb = new CircuitBreaker(3, 5_000);
  await assertRejects(() => cb.execute(fail()));
  await assertRejects(() => cb.execute(fail()));
  await assertRejects(() => cb.execute(fail()));
  await assertRejects(
    () => cb.execute(ok("blocked")),
    Error,
    "Circuit breaker is OPEN",
  );
});

Deno.test("CircuitBreaker - ApiError 4xx/5xx does not trip the breaker", async () => {
  const cb = new CircuitBreaker(2, 5_000);
  await assertRejects(() => cb.execute(apiErr(404)));
  await assertRejects(() => cb.execute(apiErr(404)));
  const result = await cb.execute(ok("still works"));
  assertEquals(result, "still works");
});

Deno.test("CircuitBreaker - transitions to HALF_OPEN after reset timeout", async () => {
  const cb = new CircuitBreaker(2, 80);
  await assertRejects(() => cb.execute(fail()));
  await assertRejects(() => cb.execute(fail()));
  await assertRejects(() => cb.execute(ok("blocked")), Error, "OPEN");
  await new Promise((r) => setTimeout(r, 100));
  const result = await cb.execute(ok("probe ok"));
  assertEquals(result, "probe ok");
});

Deno.test("CircuitBreaker - re-opens if probe fails in HALF_OPEN state", async () => {
  const cb = new CircuitBreaker(2, 80);
  await assertRejects(() => cb.execute(fail()));
  await assertRejects(() => cb.execute(fail()));
  await new Promise((r) => setTimeout(r, 100));
  await assertRejects(() => cb.execute(fail("still down")));
  await assertRejects(
    () => cb.execute(ok("no")),
    Error,
    "Circuit breaker is OPEN",
  );
});

Deno.test("CircuitBreaker - CircuitState enum values are correct", () => {
  assertEquals(CircuitState.CLOSED, 0);
  assertEquals(CircuitState.OPEN, 1);
  assertEquals(CircuitState.HALF_OPEN, 2);
});
