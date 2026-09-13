import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";

export type ProviderType = 'groq' | 'openrouter' | 'deepseek' | 'cerebras' | 'ollama' | 'gemini' | 'nvidia' | 'claude';

// OpenAI-Compatible Providers Clients
export const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || "dummy-groq-key",
  baseURL: "https://api.groq.com/openai/v1",
});

export const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || "dummy-openrouter-key",
  baseURL: "https://openrouter.ai/api/v1",
});

export const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || "dummy-deepseek-key",
  baseURL: "https://api.deepseek.com/v1",
});

export const cerebras = new OpenAI({
  apiKey: process.env.CEREBRAS_API_KEY || "dummy-cerebras-key",
  baseURL: "https://api.cerebras.ai/v1",
});

export const nvidia = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY || "dummy-nvidia-key",
  baseURL: "https://integrate.api.nvidia.com/v1",
});

export const ollama = new OpenAI({
  apiKey: "ollama",
  baseURL: process.env.OLLAMA_BASE_URL || "http://localhost:11434/v1",
});

// Google Gemini Client
export const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "dummy-gemini-key");

// Anthropic Claude Client
export const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY || "dummy-claude-key",
});

export function getOpenAIClient(provider: Exclude<ProviderType, 'gemini' | 'claude'>): OpenAI {
  const clientMap: Record<Exclude<ProviderType, 'gemini' | 'claude'>, OpenAI> = {
    groq,
    openrouter,
    deepseek,
    cerebras,
    nvidia,
    ollama,
  };
  return clientMap[provider];
}

