// In-memory sliding window rate limiter, burst protection & quota manager
const rateLimitMap = new Map<string, number[]>();
const dailyQuotaMap = new Map<string, { count: number; resetTime: number }>();

const MAX_REQUESTS_PER_MIN = Number(process.env.MAX_REQUESTS_PER_MINUTE) || 30;
const MAX_BURST_REQUESTS_10S = 10; // Max 10 requests per 10 seconds (prevents bot sandbox spam while allowing natural chat)
const DAILY_LIMIT = Number(process.env.DAILY_LIMIT_PER_USER) || 50;

const WINDOW_MS = 60 * 1000; // 1 minute
const BURST_WINDOW_MS = 10 * 1000; // 10 seconds

export const MAX_PROMPT_CHARS_FREE = 10000; // ~2,500 tokens (prevents bot sandbox dumps)
export const MAX_PROMPT_CHARS_BYOK = 40000; // ~10,000 tokens for custom API keys

/**
 * Validates prompt character/token length to prevent sandbox context exhaustion.
 */
export function validatePromptLength(
  content: string,
  isCustomKeyUsed: boolean = false
): { allowed: boolean; reason?: string } {
  if (!content || typeof content !== "string") {
    return { allowed: true };
  }

  const maxAllowed = isCustomKeyUsed ? MAX_PROMPT_CHARS_BYOK : MAX_PROMPT_CHARS_FREE;

  if (content.length > maxAllowed) {
    const formattedMax = maxAllowed.toLocaleString();
    const formattedLength = content.length.toLocaleString();
    return {
      allowed: false,
      reason: `Prompt terlalu panjang (${formattedLength} karakter, batas: ${formattedMax} karakter). Silakan ringkas prompt Anda atau gunakan API Key pribadi (BYOK) di menu Settings untuk batas yang lebih longgar.`,
    };
  }

  return { allowed: true };
}

/**
 * Rate limit check supporting both user ID and client IP with burst and sliding-window protection.
 */
export async function checkRateLimit(
  identifier: string
): Promise<{ allowed: boolean; reason?: string }> {
  const now = Date.now();
  const timestamps = rateLimitMap.get(identifier) || [];

  // Filter timestamps within the current 1-minute window
  const validTimestamps = timestamps.filter((ts) => now - ts < WINDOW_MS);

  // 1. Anti-bot burst check (max 6 requests within 10 seconds)
  const recentBurstCount = validTimestamps.filter((ts) => now - ts < BURST_WINDOW_MS).length;
  if (recentBurstCount >= MAX_BURST_REQUESTS_10S) {
    return {
      allowed: false,
      reason: "Terlalu banyak permintaan dalam waktu singkat (Burst limit terdeteksi). Harap tunggu 10 detik sebelum mengirim pesan kembali.",
    };
  }

  // 2. Sliding window check (max 20 requests per minute)
  if (validTimestamps.length >= MAX_REQUESTS_PER_MIN) {
    return {
      allowed: false,
      reason: "Batas frekuensi permintaan tercapai (Maksimal 20 pesan per menit). Harap tunggu 1 menit.",
    };
  }

  validTimestamps.push(now);
  rateLimitMap.set(identifier, validTimestamps);
  return { allowed: true };
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
