import { createClient } from "@/lib/supabase/server";
import { ProviderType } from "./ai-clients";

export interface ModelItem {
  id: string;
  provider: ProviderType;
  display_name: string;
  capability_tags: string[];
  context_length: number;
  is_free: boolean;
  status: 'active' | 'deprecated' | 'rate_limited';
}

export const DEFAULT_MODELS: ModelItem[] = [
  {
    id: "gemini/gemini-2.0-flash",
    provider: "gemini",
    display_name: "Gemini 2.0 Flash",
    capability_tags: ["fast", "routine", "multilingual"],
    context_length: 1048576,
    is_free: true,
    status: "active",
  },
  {
    id: "groq/llama-3.3-70b-versatile",
    provider: "groq",
    display_name: "Llama 3.3 70B (Groq)",
    capability_tags: ["fast", "routine"],
    context_length: 128000,
    is_free: true,
    status: "active",
  },
  {
    id: "openrouter/qwen/qwen-2.5-coder-32b-instruct:free",
    provider: "openrouter",
    display_name: "Qwen 2.5 Coder 32B",
    capability_tags: ["coding", "agentic"],
    context_length: 32768,
    is_free: true,
    status: "active",
  },
  {
    id: "deepseek/deepseek-chat",
    provider: "deepseek",
    display_name: "DeepSeek V3",
    capability_tags: ["reasoning", "coding"],
    context_length: 65536,
    is_free: true,
    status: "active",
  },
  {
    id: "deepseek/deepseek-reasoner",
    provider: "deepseek",
    display_name: "DeepSeek R1",
    capability_tags: ["reasoning"],
    context_length: 65536,
    is_free: true,
    status: "active",
  },
  {
    id: "cerebras/llama-3.3-70b",
    provider: "cerebras",
    display_name: "Llama 3.3 70B (Cerebras)",
    capability_tags: ["fast", "routine"],
    context_length: 8192,
    is_free: true,
    status: "active",
  },
  {
    id: "ollama/llama3.2",
    provider: "ollama",
    display_name: "Llama 3.2 (Local)",
    capability_tags: ["local", "fast"],
    context_length: 131072,
    is_free: true,
    status: "active",
  }
];

export async function resolveFallback(failedModelId: string): Promise<ModelItem | null> {
  try {
    const supabase = await createClient();

    const { data: failed } = await supabase
      .from("model_catalog")
      .select("capability_tags")
      .eq("id", failedModelId)
      .single();

    const tags = failed?.capability_tags || ["fast"];

    const { data: candidates } = await supabase
      .from("model_catalog")
      .select("*")
      .neq("id", failedModelId)
      .eq("status", "active")
      .overlaps("capability_tags", tags)
      .limit(1);

    if (candidates && candidates.length > 0) {
      return candidates[0] as ModelItem;
    }
  } catch (err) {
    console.warn("Database model fallback lookup failed, using memory default:", err);
  }

  // Memory fallback
  const memoryCandidate = DEFAULT_MODELS.find((m) => m.id !== failedModelId && m.status === "active");
  return memoryCandidate || null;
}
