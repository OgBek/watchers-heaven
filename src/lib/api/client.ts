export class ApiError extends Error {
  retryAfter?: number;
  constructor(public status: number, public message: string, public data?: unknown) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Fetch wrapper with timeout and proper error handling.
 * Default timeout: 10 seconds.
 */
export const fetchClient = async (
  url: string,
  options?: RequestInit & { timeoutMs?: number }
) => {
  const timeoutMs = options?.timeoutMs ?? 10_000;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    if (!response.ok) {
      const err = new ApiError(response.status, `API Error: ${response.statusText}`);
      // Capture Retry-After header for 429 responses
      if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after') || response.headers.get('x-ratelimit-reset');
        if (retryAfter) err.retryAfter = Number(retryAfter);
      }
      throw err;
    }

    // Read as text first to handle oversized / malformed JSON gracefully
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      throw new ApiError(
        response.status,
        `Invalid JSON response (${text.length} bytes)`
      );
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new ApiError(408, `Request timed out after ${timeoutMs}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
};
