import React, { useId } from "react";
import { Globe, Sparkles } from "lucide-react";

// 1. Google Gemini Official Multi-Color Star
export function GeminiLogo({ className = "w-4 h-4" }: { className?: string }) {
  const id = useId();
  const gradId = `gemini-grad-${id.replace(/:/g, "")}`;

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4285F4" />
          <stop offset="40%" stopColor="#9B51E0" />
          <stop offset="80%" stopColor="#E94235" />
          <stop offset="100%" stopColor="#FBBC04" />
        </linearGradient>
      </defs>
      <path
        d="M12 0C12 6.627 6.627 12 0 12c6.627 0 12 5.373 12 12 0-6.627 5.373-12 12-12-6.627 0-12-5.373-12-12z"
        fill={`url(#${gradId})`}
      />
    </svg>
  );
}

// 2. OpenAI Official Emerald Green (#10A37F)
export function OpenAILogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#10A37F">
      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7952.7952 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5351-3.0137l.142.0852 4.783 2.7582a.7952.7952 0 0 0 .7854 0l5.8336-3.3692v2.3325a.0805.0805 0 0 1-.0332.0615l-4.8398 2.7914a4.4992 4.4992 0 0 1-6.1359-1.6459zm-1.2265-10.462a4.4755 4.4755 0 0 1 2.3413-1.9754V11.83a.7952.7952 0 0 0 .3927.6813l5.8336 3.3692-2.02 1.1686a.0758.0758 0 0 1-.0711 0l-4.8398-2.7961a4.504 4.504 0 0 1-1.6367-6.2476zm16.5965 3.0563l-5.8336-3.3692 2.02-1.1686a.0758.0758 0 0 1 .0711 0l4.8398 2.7961a4.504 4.504 0 0 1 1.6367 6.2476 4.4755 4.4755 0 0 1-2.3413 1.9754V11.5836a.7952.7952 0 0 0-.3927-.6813zm1.7617-3.9546l-.142-.0852-4.783-2.7582a.7952.7952 0 0 0-.7854 0L9.1869 9.2434V6.9109a.0805.0805 0 0 1 .0332-.0615l4.8398-2.7914a4.4992 4.4992 0 0 1 6.8776 4.6599zM8.3444 14.8817l-2.02-1.1686a.071.071 0 0 1-.038-.052V8.0785a4.504 4.504 0 0 1 7.3709-3.4536l-.1419.0804-4.7783 2.7582a.7952.7952 0 0 0-.3927.6813v6.7369zm1.0941-4.002l2.5613-1.4775 2.5613 1.4775v2.955l-2.5613 1.4775-2.5613-1.4775z"/>
    </svg>
  );
}

// 3. Anthropic Claude Official Terracotta Coral (#D97757 / #D96B27)
export function ClaudeLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4.04 16.52a.66.66 0 00.5.83l3.66 1.05a.66.66 0 00.77-.35l2.42-5.46a.66.66 0 00-.23-.8l-3.23-2.15a.66.66 0 00-.89.15L4.04 16.52z"
        fill="#D97757"
      />
      <path
        d="M17.46 3.96a.66.66 0 00-.82.16l-4.57 5.71a.66.66 0 00.08.92l3.18 2.22a.66.66 0 00.86-.06l4.63-5.22a.66.66 0 00-.09-.92l-3.27-2.81z"
        fill="#D97757"
      />
      <path
        d="M8.28 3.5a.66.66 0 00-.86.29L4.19 9.87a.66.66 0 00.22.84l3.52 2.15a.66.66 0 00.88-.17l3.61-6.15a.66.66 0 00-.24-.87L8.28 3.5z"
        fill="#D97757"
      />
      <path
        d="M19.92 14.16a.66.66 0 00-.54-.8L15.65 12.2a.66.66 0 00-.77.34l-2.67 5.86a.66.66 0 00.24.81l3.35 2.14a.66.66 0 00.88-.17l3.24-6.02z"
        fill="#D97757"
      />
      <circle cx="12" cy="12" r="3" fill="#D97757" />
    </svg>
  );
}

// 4. DeepSeek Official Deep Blue (#4D6BFE)
export function DeepSeekLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#4D6BFE" />
      <path
        d="M6 12C6 8.686 8.686 6 12 6s6 2.686 6 6-2.686 6-6 6-6-2.686-6-6zm3.5-3.5a1 1 0 100 2 1 1 0 000-2zm5 0a1 1 0 100 2 1 1 0 000-2zM8.5 14.5a3.5 3.5 0 007 0h-7z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

// 5. Moonshot Kimi AI Official Violet (#8B5CF6)
export function KimiLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#8B5CF6" />
      <path d="M12 5a7 7 0 1 0 7 7 5.5 5.5 0 0 1-7-7z" fill="#FFFFFF" />
    </svg>
  );
}

// 6. Qwen Official Alibaba Cloud Orange (#FF6A00)
export function QwenLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.8L19.2 8 12 11.2 4.8 8 12 4.8zM4 9.6l7 3.5v7.1l-7-3.5V9.6zm9 10.6v-7.1l7-3.5v7.1l-7 3.5z"
        fill="#FF6A00"
      />
    </svg>
  );
}

// 7. Meta Llama Official Blue (#0668E1)
export function LlamaLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M17.8 6c-2.1 0-3.9 1.1-5.1 2.8C11.5 7.1 9.7 6 7.6 6 4.5 6 2 8.5 2 11.6c0 3.3 2.8 6.4 5.9 6.4 2.1 0 3.9-1.1 5.1-2.8 1.2 1.7 3 2.8 5.1 2.8 3.1 0 5.9-3.1 5.9-6.4C24 8.5 21.5 6 17.8 6zm-10.2 10c-2.1 0-4-2.1-4-4.4 0-2.2 1.7-4 3.9-4 1.8 0 3.4 1.2 4.1 3-0.7 1.8-2.3 5.4-4 5.4zm10.2 0c-1.7 0-3.3-3.6-4-5.4 0.7-1.8 2.3-3 4.1-3 2.2 0 3.9 1.8 3.9 4 0 2.3-1.9 4.4-4 4.4z"
        fill="#0668E1"
      />
    </svg>
  );
}

// 8. NVIDIA Official Green (#76B900)
export function NvidiaLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 16c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm-4-6c0 2.21 1.79 4 4 4s4-1.79 4-4-1.79-4-4-4-4 1.79-4 4z"
        fill="#76B900"
      />
    </svg>
  );
}

// 9. Web Crawler Agent Logo
export function WebCrawlerLogo({ className = "w-4 h-4" }: { className?: string }) {
  return <Globe className={`${className} text-emerald-400`} />;
}

export function ModelLogo({
  modelId,
  provider,
  className = "w-4 h-4",
}: {
  modelId: string;
  provider: string;
  className?: string;
}) {
  const id = (modelId || "").toLowerCase();
  const prov = (provider || "").toLowerCase();

  if (id === "web-crawler-agent") {
    return <WebCrawlerLogo className={className} />;
  }
  if (id.includes("gemini") || prov === "gemini" || prov === "google") {
    return <GeminiLogo className={className} />;
  }
  if (id.includes("gpt") || id.includes("o3") || id.includes("openai") || prov === "openai") {
    return <OpenAILogo className={className} />;
  }
  if (id.includes("claude") || prov === "claude") {
    return <ClaudeLogo className={className} />;
  }
  if (id.includes("deepseek") || prov === "deepseek") {
    return <DeepSeekLogo className={className} />;
  }
  if (id.includes("kimi") || id.includes("moonshot") || prov === "kimi") {
    return <KimiLogo className={className} />;
  }
  if (id.includes("qwen")) {
    return <QwenLogo className={className} />;
  }
  if (id.includes("llama")) {
    return <LlamaLogo className={className} />;
  }
  if (id.includes("nvidia") || id.includes("nemotron")) {
    return <NvidiaLogo className={className} />;
  }

  return <Sparkles className={`${className} text-amber-400`} />;
}
