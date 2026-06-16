import { ApiError } from './client';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const withRetries = async <T>(
  fn: () => Promise<T>,
  retries = 3,
  baseDelay = 500
): Promise<T> => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (error) {
      attempt++;

      // Never retry 404 Not Found — it will never succeed
      if (error instanceof ApiError && error.status === 404) {
        throw error;
      }

      // Don't retry server errors (5xx) — our proxy already tried the upstream,
      // retrying the proxy won't help. Only network/timeout errors benefit from retries.
      if (error instanceof ApiError && error.status >= 500) {
        throw error;
      }

      // Special handling for 429 Too Many Requests:
      // Respect the Retry-After header and don't burn through retries pointlessly
      if (error instanceof ApiError && error.status === 429) {
        const retryAfterSec = Number((error as any).retryAfter) || 0;
        if (retryAfterSec > 10) {
          // Server says wait too long — just throw immediately
          throw error;
        }
        const waitMs = retryAfterSec > 0
          ? retryAfterSec * 1000 + 200 // add small buffer
          : baseDelay * Math.pow(2, attempt) + Math.random() * 500;
        if (attempt >= retries) throw error;
        await delay(waitMs);
        continue;
      }

      if (attempt >= retries) throw error;
      // Exponential backoff with jitter
      const jitter = Math.random() * 200;
      await delay(baseDelay * Math.pow(2, attempt - 1) + jitter);
    }
  }
  throw new Error("Max retries reached");
};
