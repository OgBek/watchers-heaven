import { ApiError } from './client.ts';

export enum CircuitState {
  CLOSED, // Requests pass normally
  OPEN,   // Requests block immediately
  HALF_OPEN // Testing if the provider is back
}

export class CircuitBreaker {
  private state = CircuitState.CLOSED;
  private failureCount = 0;
  private nextAttemptTime = 0;

  constructor(
    private failureThreshold = 10,
    private resetTimeoutMs = 15_000
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
      // Success resets the breaker
      this.failureCount = 0;
      this.state = CircuitState.CLOSED;
      return result;
    } catch (error) {
      // Only count genuine connectivity failures toward the threshold.
      // 429 (rate limiting) and 5xx (server overload) are transient —
      // they don't mean the upstream is down, so skip them.
      if (error instanceof ApiError && error.status >= 400 && error.status < 600) {
        throw error; // Propagate the error but don't trip the breaker
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

export const tmdbCircuitBreaker = new CircuitBreaker(10, 15_000);
