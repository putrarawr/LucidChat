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
    id: "web-crawler-agent",
    provider: "groq",
    display_name: "Web Crawler Agent (Multi-Source)",
    capability_tags: ["agentic", "multilingual", "routine"],
    context_length: 128000,
    is_free: true,
    status: "active",
  },
  {
    id: "gemini/gemini-3.6-flash",
    provider: "gemini",
    display_name: "Gemini 3.6 Flash",
    capability_tags: ["fast", "routine", "multilingual"],
    context_length: 1048576,
    is_free: true,
    status: "active",
  },
  {
    id: "groq/qwen/qwen3.6-27b",
    provider: "groq",
    display_name: "Qwen 3.6 27B (Groq)",
    capability_tags: ["fast", "routine", "coding"],
    context_length: 128000,
    is_free: true,
    status: "active",
  },
  {
    id: "openrouter/qwen/qwen-2.5-coder-32b-instruct",
    provider: "openrouter",
    display_name: "Qwen 2.5 Coder 32B",
    capability_tags: ["coding", "agentic"],
    context_length: 32768,
    is_free: true,
    status: "active",
  },
  {
    id: "openrouter/nex-agi/nex-n2.5-mini:free",
    provider: "openrouter",
    display_name: "Nex N2.5 Mini (Free)",
    capability_tags: ["fast", "routine"],
    context_length: 32768,
    is_free: true,
    status: "active",
  },
  {
    id: "openrouter/liquid/lfm-2.5-2.6b:free",
    provider: "openrouter",
    display_name: "LFM 2.5 2.6B (Free)",
    capability_tags: ["fast", "reasoning"],
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
    id: "cerebras/qwen-3.8-27b",
    provider: "cerebras",
    display_name: "Qwen 3.8 27B (Cerebras)",
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
