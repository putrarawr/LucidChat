// In-memory sliding window rate limiter & daily quota manager
const rateLimitMap = new Map<string, number[]>();
const dailyQuotaMap = new Map<string, { count: number; resetTime: number }>();

const MAX_REQUESTS_PER_MIN = Number(process.env.MAX_REQUESTS_PER_MINUTE) || 30;
const DAILY_LIMIT = Number(process.env.DAILY_LIMIT_PER_USER) || 50;
const WINDOW_MS = 60 * 1000; // 1 minute

export async function checkRateLimit(userId: string): Promise<boolean> {
  const now = Date.now();
  const userTimestamps = rateLimitMap.get(userId) || [];

  // Filter timestamps within the current window
  const validTimestamps = userTimestamps.filter((ts) => now - ts < WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS_PER_MIN) {
    return false;
  }

  validTimestamps.push(now);
  rateLimitMap.set(userId, validTimestamps);
  return true;
}

export async function checkDailyQuota(
  userId: string,
  isCustomKeyUsed: boolean = false
): Promise<{ allowed: boolean; used: number; max: number; resetInMs: number }> {
  // If user uses their own custom API key or endpoint, bypass daily server quota!
  if (isCustomKeyUsed) {
    return { allowed: true, used: 0, max: DAILY_LIMIT, resetInMs: 0 };
  }

  const now = Date.now();
  let userQuota = dailyQuotaMap.get(userId);

  // If no record or 24 hours passed since reset time, reset quota
  if (!userQuota || now >= userQuota.resetTime) {
    const tomorrow = new Date();
    tomorrow.setUTCHours(24, 0, 0, 0);
    userQuota = { count: 0, resetTime: tomorrow.getTime() };
  }

  if (userQuota.count >= DAILY_LIMIT) {
    return {
      allowed: false,
      used: userQuota.count,
      max: DAILY_LIMIT,
      resetInMs: Math.max(0, userQuota.resetTime - now),
    };
  }

  userQuota.count += 1;
  dailyQuotaMap.set(userId, userQuota);

  return {
    allowed: true,
    used: userQuota.count,
    max: DAILY_LIMIT,
    resetInMs: Math.max(0, userQuota.resetTime - now),
  };
}

export function getUserQuotaStatus(userId: string): {
  used: number;
  max: number;
  resetInMs: number;
} {
  const now = Date.now();
  const userQuota = dailyQuotaMap.get(userId);

  if (!userQuota || now >= userQuota.resetTime) {
    const tomorrow = new Date();
    tomorrow.setUTCHours(24, 0, 0, 0);
    return { used: 0, max: DAILY_LIMIT, resetInMs: tomorrow.getTime() - now };
  }

  return {
    used: userQuota.count,
    max: DAILY_LIMIT,
    resetInMs: Math.max(0, userQuota.resetTime - now),
  };
}
