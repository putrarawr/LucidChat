/**
 * Intelligent Multi-Key Pool & Auto-Failover Engine for Google Gemini
 * Rotates multiple API keys, auto-detects quota exhaustion (429/503),
 * puts exhausted keys into temporary cooldown, and transparently retries
 * with next available keys or lightweight fallback models.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

// Key cooldown tracker: maps apiKey -> timestamp (epoch ms) until which key is in cooldown
const keyCooldownMap = new Map<string, number>();

// Round-robin counter
let keyIndex = 0;

/**
 * Returns all configured Gemini API keys dynamically parsed from environment variables.
 * Supports comma-separated GEMINI_API_KEYS or single GOOGLE_GEMINI_API_KEY.
 */
export function getAllGeminiKeys(): string[] {
  const envKeysRaw = [
    ...(process.env.GEMINI_API_KEYS ? process.env.GEMINI_API_KEYS.split(",") : []),
    ...(process.env.GOOGLE_GEMINI_API_KEY ? [process.env.GOOGLE_GEMINI_API_KEY] : []),
  ];

  const sanitized = envKeysRaw
    .map((k) => k.trim())
    .filter((k) => k && k.length > 10 && k !== "dummy-gemini-key");

  return Array.from(new Set(sanitized));
}

/**
 * Checks if a key is currently cooled down due to 429/503 rate limit.
 */
export function isKeyInCooldown(key: string): boolean {
  const cooldownUntil = keyCooldownMap.get(key);
  if (!cooldownUntil) return false;
  if (Date.now() > cooldownUntil) {
    keyCooldownMap.delete(key);
    return false;
  }
  return true;
}

/**
 * Marks a key as in cooldown.
 * @param durationMs Default 3 minutes for 429 rate limit spikes, 30 mins for quota exhaustion
 */
export function markKeyCooldown(key: string, durationMs: number = 3 * 60 * 1000): void {
  keyCooldownMap.set(key, Date.now() + durationMs);
  console.warn(`[Gemini Pool] API Key ...${key.slice(-8)} placed in cooldown for ${Math.round(durationMs / 1000)}s`);
}

/**
 * Gets a sorted list of candidate keys, prioritizing keys not in cooldown.
 */
export function getCandidateKeys(): string[] {
  const allKeys = getAllGeminiKeys();
  const now = Date.now();

  const available: string[] = [];
  const cooling: string[] = [];

  for (const k of allKeys) {
    const cooldownUntil = keyCooldownMap.get(k);
    if (!cooldownUntil || now > cooldownUntil) {
      if (cooldownUntil) keyCooldownMap.delete(k);
      available.push(k);
    } else {
      cooling.push(k);
    }
  }

  // Rotate starting point for load balancing across available keys
  if (available.length > 0) {
    keyIndex = (keyIndex + 1) % available.length;
    const rotated = [...available.slice(keyIndex), ...available.slice(0, keyIndex)];
    return [...rotated, ...cooling];
  }

  return [...allKeys];
}

export interface GeminiStreamParams {
  modelName: string;
  systemInstruction?: string;
  contents: { role: string; parts: ({ text: string } | { inlineData: { mimeType: string; data: string } })[] }[];
  customKey?: string;
}

/**
 * Generates content stream with automatic multi-key rotation and model fallback.
 */
export async function generateGeminiStreamWithPool(params: {
  modelName: string;
  systemInstruction?: string;
  contents: { role: string; parts: ({ text: string } | { inlineData: { mimeType: string; data: string } })[] }[];
  customKey?: string;
}) {
  const { modelName, systemInstruction, contents, customKey } = params;

  // 1. If user supplied their own custom API key (BYOK), execute directly
  if (customKey && customKey.trim()) {
    const client = new GoogleGenerativeAI(customKey.trim());
    const model = client.getGenerativeModel({
      model: modelName || "gemini-3.6-flash",
      systemInstruction,
    });
    return await model.generateContentStream({ contents });
  }

  // 2. Multi-Key Pool Execution with Auto-Failover
  const candidateKeys = getCandidateKeys();
  const modelsToTry = [
    modelName || "gemini-3.6-flash",
    "gemini-3.5-flash-lite",
    "gemini-flash-lite-latest",
  ];

  // Deduplicate models
  const uniqueModels = Array.from(new Set(modelsToTry));

  let lastError: unknown = null;

  for (const targetModel of uniqueModels) {
    for (const key of candidateKeys) {
      // If key is actively in cooldown, skip unless no other keys remain
      if (isKeyInCooldown(key) && candidateKeys.some((k) => !isKeyInCooldown(k))) {
        continue;
      }

      try {
        const client = new GoogleGenerativeAI(key);
        const model = client.getGenerativeModel({
          model: targetModel,
          systemInstruction,
        });

        const streamResult = await model.generateContentStream({ contents });
        // Successfully initialized stream
        return streamResult;
      } catch (err: unknown) {
        lastError = err;
        const errMsg = err instanceof Error ? err.message : String(err);
        const isRateLimit =
          errMsg.includes("429") ||
          errMsg.includes("Resource has been exhausted") ||
          errMsg.includes("Quota exceeded") ||
          errMsg.includes("limit: 20") ||
          errMsg.includes("503");

        if (isRateLimit) {
          // If it is daily quota exhaustion, cooldown for 30 minutes; if short burst, cooldown 2 minutes
          const isDailyExhausted = errMsg.includes("limit: 20") || errMsg.includes("GenerateRequestsPerDay");
          const cooldownDuration = isDailyExhausted ? 30 * 60 * 1000 : 2 * 60 * 1000;
          markKeyCooldown(key, cooldownDuration);
        } else {
          console.warn(`[Gemini Pool] Error with key ...${key.slice(-8)} on model ${targetModel}:`, errMsg);
        }
      }
    }
  }

  throw lastError || new Error("Seluruh API Key Gemini dalam pool sedang mengalami batas kuota (429).");
}
