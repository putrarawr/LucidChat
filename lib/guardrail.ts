import { groq } from "@/lib/ai-clients";

const INJECTION_PATTERNS = [
  // System prompt override attempts
  /ignore\s+(all\s+)?(previous|above|prior)\s+(instructions?|prompts?|rules?)/i,
  /forget\s+(everything|all|your)\s+(instructions?|rules?|training)/i,
  /disregard\s+(the\s+)?system\s+prompt/i,

  // Persona & Roleplay Jailbreaks
  /you\s+are\s+now\s+(a|an|the|in)\s+/i,
  /act\s+as\s+(if\s+you\s+are|a|an|the)\s+/i,
  /pretend\s+to\s+be\s+/i,
  /\bDAN\b.*\bjailbreak/i,
  /developer\s+mode\s+(enabled|on)/i,

  // Prompt leak attempts
  /repeat\s+(all\s+)?(words?|text)\s+above/i,
  /print\s+your\s+system\s+prompt/i,
  /what\s+are\s+your\s+(initial|original)\s+instructions/i,

  // Delimiter Hijacking
  /<\/?system_instructions>/i,
  /<\/?user_input>/i,
  /\[\s*SYSTEM\s*\]/i,
  /```system/i,
];

export function checkPatternInjection(input: string): { safe: boolean; reason?: string } {
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      return {
        safe: false,
        reason: "Pesan terdeteksi mengandung upaya Prompt Injection / Jailbreak / Roleplay override.",
      };
    }
  }
  return { safe: true };
}

export async function runGuardrail(message: string): Promise<{ safe: boolean; reason?: string }> {
  // Step 1: Fast pattern-based check
  const patternCheck = checkPatternInjection(message);
  if (!patternCheck.safe) return patternCheck;

  // Step 2: Model-based check via Llama Guard (if enabled in env and key available)
  if (process.env.ENABLE_LLAMA_GUARD === "true" && process.env.GROQ_API_KEY) {
    try {
      const response = await groq.chat.completions.create({
        model: "llama-guard-3-8b",
        messages: [{ role: "user", content: message }],
      });
      const verdict = response.choices[0]?.message?.content ?? "";
      if (verdict.toLowerCase().startsWith("unsafe")) {
        return {
          safe: false,
          reason: "Konten dinilai tidak aman oleh pengawas keselamatan AI.",
        };
      }
    } catch (err) {
      console.warn("Llama Guard check skipped or failed:", err);
    }
  }

  return { safe: true };
}
