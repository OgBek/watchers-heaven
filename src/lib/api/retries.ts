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
      if (attempt >= retries) throw error;
      // Exponential backoff with jitter
      const jitter = Math.random() * 200;
      await delay(baseDelay * Math.pow(2, attempt - 1) + jitter);
    }
  }
  throw new Error("Max retries reached");
};
