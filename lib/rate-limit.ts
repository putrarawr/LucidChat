// In-memory sliding window rate limiter
const rateLimitMap = new Map<string, number[]>();

const MAX_REQUESTS = Number(process.env.MAX_REQUESTS_PER_MINUTE) || 30;
const WINDOW_MS = 60 * 1000; // 1 minute

export async function checkRateLimit(userId: string): Promise<boolean> {
  const now = Date.now();
  const userTimestamps = rateLimitMap.get(userId) || [];

  // Filter timestamps within the current window
  const validTimestamps = userTimestamps.filter((ts) => now - ts < WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS) {
    return false;
  }

  validTimestamps.push(now);
  rateLimitMap.set(userId, validTimestamps);
  return true;
}
