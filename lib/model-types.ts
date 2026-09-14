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
  // 1. Google Gemini (Default)
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
    id: "gemini/gemini-1.5-pro",
    provider: "gemini",
    display_name: "Gemini 1.5 Pro",
    capability_tags: ["reasoning", "coding", "multilingual"],
    context_length: 2097152,
    is_free: true,
    status: "active",
  },

  // 2. OpenAI Official
  {
    id: "openai/gpt-4o",
    provider: "openai",
    display_name: "OpenAI GPT-4o",
    capability_tags: ["reasoning", "coding", "agentic", "multilingual"],
    context_length: 128000,
    is_free: false,
    status: "active",
  },
  {
    id: "openai/gpt-4o-mini",
    provider: "openai",
    display_name: "OpenAI GPT-4o Mini",
    capability_tags: ["fast", "routine", "multilingual"],
    context_length: 128000,
    is_free: true,
    status: "active",
  },
  {
    id: "openai/o3-mini",
    provider: "openai",
    display_name: "OpenAI o3-mini (Reasoning)",
    capability_tags: ["reasoning", "coding", "agentic"],
    context_length: 200000,
    is_free: false,
    status: "active",
  },

  // 3. Kimi (Moonshot AI)
  {
    id: "kimi/moonshot-v1-8k",
    provider: "kimi",
    display_name: "Kimi Moonshot V1 8K",
    capability_tags: ["fast", "routine", "multilingual"],
    context_length: 8192,
    is_free: true,
    status: "active",
  },
  {
    id: "kimi/moonshot-v1-32k",
    provider: "kimi",
    display_name: "Kimi Moonshot V1 32K",
    capability_tags: ["reasoning", "multilingual", "coding"],
    context_length: 32768,
    is_free: true,
    status: "active",
  },
  {
    id: "kimi/kimi-latest",
    provider: "kimi",
    display_name: "Kimi AI (Latest)",
    capability_tags: ["fast", "reasoning", "multilingual"],
    context_length: 128000,
    is_free: true,
    status: "active",
  },

  // 4. Anthropic Claude
  {
    id: "claude/claude-3-7-sonnet-20250219",
    provider: "claude",
    display_name: "Claude 3.7 Sonnet",
    capability_tags: ["reasoning", "coding", "agentic"],
    context_length: 200000,
    is_free: false,
    status: "active",
  },
  {
    id: "claude/claude-3-5-haiku-20241022",
    provider: "claude",
    display_name: "Claude 3.5 Haiku",
    capability_tags: ["fast", "routine"],
    context_length: 200000,
    is_free: false,
    status: "active",
  },

  // 5. DeepSeek
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
    display_name: "DeepSeek R1 (Reasoning)",
    capability_tags: ["reasoning", "coding"],
    context_length: 65536,
    is_free: true,
    status: "active",
  },

  // 6. Groq AI & Web Agent
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
    id: "groq/qwen/qwen3.6-27b",
    provider: "groq",
    display_name: "Qwen 3.6 27B (Groq)",
    capability_tags: ["fast", "routine", "coding"],
    context_length: 128000,
    is_free: true,
    status: "active",
  },
  {
    id: "groq/llama-3.3-70b-versatile",
    provider: "groq",
    display_name: "Llama 3.3 70B (Groq)",
    capability_tags: ["reasoning", "coding", "fast"],
    context_length: 128000,
    is_free: true,
    status: "active",
  },

  // 7. Bazaarlink API
  {
    id: "bazaarlink/gpt-4o",
    provider: "bazaarlink",
    display_name: "Bazaarlink GPT-4o",
    capability_tags: ["reasoning", "coding", "fast"],
    context_length: 128000,
    is_free: true,
    status: "active",
  },
  {
    id: "bazaarlink/claude-3-5-sonnet",
    provider: "bazaarlink",
    display_name: "Bazaarlink Claude 3.5 Sonnet",
    capability_tags: ["reasoning", "coding", "agentic"],
    context_length: 200000,
    is_free: true,
    status: "active",
  },

  // 8. Requestly API
  {
    id: "requestly/gpt-4o-mini",
    provider: "requestly",
    display_name: "Requestly GPT-4o Mini",
    capability_tags: ["fast", "routine"],
    context_length: 128000,
    is_free: true,
    status: "active",
  },
  {
    id: "requestly/claude-3-haiku",
    provider: "requestly",
    display_name: "Requestly Claude 3 Haiku",
    capability_tags: ["fast", "routine"],
    context_length: 200000,
    is_free: true,
    status: "active",
  },

  // 9. OpenRouter Free Tier
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
    id: "openrouter/nvidia/nemotron-3.5-lightning:free",
    provider: "openrouter",
    display_name: "NVIDIA Nemotron 3.5 (Free)",
    capability_tags: ["reasoning", "coding", "agentic", "fast"],
    context_length: 128000,
    is_free: true,
    status: "active",
  },

  // 10. Cerebras Ultra-Fast
  {
    id: "cerebras/qwen-3.8-27b",
    provider: "cerebras",
    display_name: "Qwen 3.8 27B (Cerebras)",
    capability_tags: ["fast", "routine"],
    context_length: 8192,
    is_free: true,
    status: "active",
  },

  // 11. Ollama Local Engine
  {
    id: "ollama/llama3.2",
    provider: "ollama",
    display_name: "Llama 3.2 (Local)",
    capability_tags: ["local", "fast"],
    context_length: 131072,
    is_free: true,
    status: "active",
  },
];
