import { DEFAULT_MODELS, ModelItem } from "./model-types";

export async function resolveFallback(failedModelId: string): Promise<ModelItem | null> {
  try {
    const memoryCandidates = DEFAULT_MODELS.filter((m) => m.id !== failedModelId && m.status === "active");
    if (memoryCandidates.length > 0) {
      // Prioritize Gemini 3.6 Flash or OpenRouter Qwen 2.5 Coder as reliable fallbacks
      const preferred = memoryCandidates.find((m) => m.provider === "gemini" || m.provider === "openrouter");
      return preferred || memoryCandidates[0];
    }
  } catch (err) {
    console.warn("Fallback lookup error:", err);
  }

  return DEFAULT_MODELS[0] || null;
}
