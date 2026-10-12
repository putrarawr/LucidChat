/**
 * Intelligent Multi-Key Pool & Auto-Failover Engine for Groq Cloud
 * Rotates multiple Groq API keys, auto-detects quota exhaustion (429/503/TPM/RPM),
 * puts exhausted keys into temporary cooldown, and transparently retries
 * with next available keys or lightweight fallback models.
 */

import OpenAI from "openai";

// Key cooldown tracker: maps apiKey -> timestamp (epoch ms) until which key is in cooldown
const groqCooldownMap = new Map<string, number>();

// Round-robin counter
let groqKeyIndex = 0;

/**
 * Returns all configured Groq API keys dynamically parsed from environment variables.
 * Supports comma-separated GROQ_API_KEYS or single GROQ_API_KEY.
 */
export function getAllGroqKeys(): string[] {
  const envKeysRaw = [
    ...(process.env.GROQ_API_KEYS ? process.env.GROQ_API_KEYS.split(",") : []),
    ...(process.env.GROQ_API_KEY ? [process.env.GROQ_API_KEY] : []),
  ];

  const sanitized = envKeysRaw
    .map((k) => k.trim())
    .filter((k) => k && k.length > 10 && k !== "dummy-groq-key");

  return Array.from(new Set(sanitized));
}

/**
 * Checks if a Groq key is currently in cooldown.
 */
export function isGroqKeyInCooldown(key: string): boolean {
  const cooldownUntil = groqCooldownMap.get(key);
  if (!cooldownUntil) return false;
  if (Date.now() > cooldownUntil) {
    groqCooldownMap.delete(key);
    return false;
  }
  return true;
}

/**
 * Marks a Groq key as in cooldown.
 * @param durationMs Default 60 seconds (Groq RPM/TPM rate limits typically reset every 60s)
 */
export function markGroqKeyCooldown(key: string, durationMs: number = 60 * 1000): void {
  groqCooldownMap.set(key, Date.now() + durationMs);
  const keyIdentifier = key.length > 8 ? `...${key.slice(-8)}` : "key";
  console.warn(`[Groq Pool] API Key ${keyIdentifier} placed in cooldown for ${Math.round(durationMs / 1000)}s`);
}

/**
 * Gets a sorted list of candidate keys, prioritizing keys not in cooldown.
 */
export function getCandidateGroqKeys(): string[] {
  const allKeys = getAllGroqKeys();
  if (allKeys.length === 0) {
    return [process.env.GROQ_API_KEY || "dummy-groq-key"];
  }

  const now = Date.now();
  const available: string[] = [];
  const cooling: string[] = [];

  for (const k of allKeys) {
    const cooldownUntil = groqCooldownMap.get(k);
    if (!cooldownUntil || now > cooldownUntil) {
      if (cooldownUntil) groqCooldownMap.delete(k);
      available.push(k);
    } else {
      cooling.push(k);
    }
  }

  // Rotate starting point for load balancing across available keys
  if (available.length > 0) {
    groqKeyIndex = (groqKeyIndex + 1) % available.length;
    const rotated = [...available.slice(groqKeyIndex), ...available.slice(0, groqKeyIndex)];
    return [...rotated, ...cooling];
  }

  return [...allKeys];
}

/**
 * Returns an OpenAI client instance targeting Groq with the best available key.
 */
export function getGroqClient(customKey?: string): OpenAI {
  if (customKey && customKey.trim()) {
    return new OpenAI({
      apiKey: customKey.trim(),
      baseURL: "https://api.groq.com/openai/v1",
    });
  }

  const candidates = getCandidateGroqKeys();
  const selectedKey = candidates[0] || process.env.GROQ_API_KEY || "dummy-groq-key";

  return new OpenAI({
    apiKey: selectedKey,
    baseURL: "https://api.groq.com/openai/v1",
  });
}

/**
 * Executes a Groq API operation with automatic key rotation and retry on 429 / 503.
 */
export async function executeWithGroqPool<T>(
  operation: (client: OpenAI, key: string) => Promise<T>,
  customKey?: string
): Promise<T> {
  // If user provided custom key (BYOK), run directly without pool rotation
  if (customKey && customKey.trim()) {
    const client = new OpenAI({
      apiKey: customKey.trim(),
      baseURL: "https://api.groq.com/openai/v1",
    });
    return await operation(client, customKey.trim());
  }

  const candidateKeys = getCandidateGroqKeys();
  let lastError: unknown = null;

  for (const key of candidateKeys) {
    // Skip cooled-down keys if at least one available key exists
    if (isGroqKeyInCooldown(key) && candidateKeys.some((k) => !isGroqKeyInCooldown(k))) {
      continue;
    }

    try {
      const client = new OpenAI({
        apiKey: key,
        baseURL: "https://api.groq.com/openai/v1",
      });
      return await operation(client, key);
    } catch (err: unknown) {
      lastError = err;
      const errMsg = err instanceof Error ? err.message : String(err);
      const isRateLimit =
        errMsg.includes("429") ||
        errMsg.includes("rate_limit_exceeded") ||
        errMsg.includes("tokens per minute") ||
        errMsg.includes("requests per minute") ||
        errMsg.includes("Rate limit reached") ||
        errMsg.includes("503");

      if (isRateLimit) {
        // Cooldown for 60 seconds
        markGroqKeyCooldown(key, 60 * 1000);
      } else {
        const keyId = key.length > 8 ? `...${key.slice(-8)}` : "key";
        console.warn(`[Groq Pool] Error with key ${keyId}:`, errMsg);
        // If it's 401 (invalid key), cooldown for 1 hour
        if (errMsg.includes("401") || errMsg.includes("invalid_api_key")) {
          markGroqKeyCooldown(key, 60 * 60 * 1000);
        }
      }
    }
  }

  throw lastError || new Error("All Groq API keys in pool failed.");
}
