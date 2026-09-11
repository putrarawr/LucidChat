import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

export type ProviderType = 'groq' | 'openrouter' | 'deepseek' | 'cerebras' | 'ollama' | 'gemini';

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

export const ollama = new OpenAI({
  apiKey: "ollama",
  baseURL: process.env.OLLAMA_BASE_URL || "http://localhost:11434/v1",
});

// Google Gemini Client
export const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "dummy-gemini-key");

export function getOpenAIClient(provider: Exclude<ProviderType, 'gemini'>): OpenAI {
  const clientMap: Record<Exclude<ProviderType, 'gemini'>, OpenAI> = {
    groq,
    openrouter,
    deepseek,
    cerebras,
    ollama,
  };
  return clientMap[provider];
}
