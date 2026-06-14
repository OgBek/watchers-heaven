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
    private failureThreshold = 5,
    private resetTimeoutMs = 10000
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
      this.failureCount++;
      if (this.failureCount >= this.failureThreshold) {
        this.state = CircuitState.OPEN;
        this.nextAttemptTime = Date.now() + this.resetTimeoutMs;
      }
      throw error;
    }
  }
}

export const tmdbCircuitBreaker = new CircuitBreaker(3, 15000);
