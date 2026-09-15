import React from "react";
import { Globe, Sparkles } from "lucide-react";

export function GeminiLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C12 6.627 6.627 12 0 12c6.627 0 12 5.373 12 12 0-6.627 5.373-12 12-12-6.627 0-12-5.373-12-12z" />
    </svg>
  );
}

export function OpenAILogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7952.7952 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5351-3.0137l.142.0852 4.783 2.7582a.7952.7952 0 0 0 .7854 0l5.8336-3.3692v2.3325a.0805.0805 0 0 1-.0332.0615l-4.8398 2.7914a4.4992 4.4992 0 0 1-6.1359-1.6459zm-1.2265-10.462a4.4755 4.4755 0 0 1 2.3413-1.9754V11.83a.7952.7952 0 0 0 .3927.6813l5.8336 3.3692-2.02 1.1686a.0758.0758 0 0 1-.0711 0l-4.8398-2.7961a4.504 4.504 0 0 1-1.6367-6.2476zm16.5965 3.0563l-5.8336-3.3692 2.02-1.1686a.0758.0758 0 0 1 .0711 0l4.8398 2.7961a4.504 4.504 0 0 1 1.6367 6.2476 4.4755 4.4755 0 0 1-2.3413 1.9754V11.5836a.7952.7952 0 0 0-.3927-.6813zm1.7617-3.9546l-.142-.0852-4.783-2.7582a.7952.7952 0 0 0-.7854 0L9.1869 9.2434V6.9109a.0805.0805 0 0 1 .0332-.0615l4.8398-2.7914a4.4992 4.4992 0 0 1 6.8776 4.6599zM8.3444 14.8817l-2.02-1.1686a.071.071 0 0 1-.038-.052V8.0785a4.504 4.504 0 0 1 7.3709-3.4536l-.1419.0804-4.7783 2.7582a.7952.7952 0 0 0-.3927.6813v6.7369zm1.0941-4.002l2.5613-1.4775 2.5613 1.4775v2.955l-2.5613 1.4775-2.5613-1.4775z"/>
    </svg>
  );
}

export function ClaudeLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.827 3.56L12.004 9.07L10.18 3.56H7.13L10.378 12.63L6.85 20.44H9.98L12.004 15.42L14.027 20.44H17.157L13.63 12.63L16.877 3.56H13.827Z" />
    </svg>
  );
}

export function DeepSeekLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 3a7 7 0 016.93 6H16a4 4 0 00-7.87-1H5.07A7 7 0 0112 5zm0 14a7 7 0 01-6.93-6H10a4 4 0 007.87 1h3.06A7 7 0 0112 19z" />
    </svg>
  );
}

export function KimiLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2A10 10 0 1 0 22 12 10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm-1-13a5 5 0 0 0 0 10 5 5 0 0 0 0-10z" />
    </svg>
  );
}

export function QwenLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.8L19.2 8 12 11.2 4.8 8 12 4.8zM4 9.6l7 3.5v7.1l-7-3.5V9.6zm9 10.6v-7.1l7-3.5v7.1l-7 3.5z" />
    </svg>
  );
}

export function LlamaLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.8 6c-2.1 0-3.9 1.1-5.1 2.8C11.5 7.1 9.7 6 7.6 6 4.5 6 2 8.5 2 11.6c0 3.3 2.8 6.4 5.9 6.4 2.1 0 3.9-1.1 5.1-2.8 1.2 1.7 3 2.8 5.1 2.8 3.1 0 5.9-3.1 5.9-6.4C24 8.5 21.5 6 17.8 6zm-10.2 10c-2.1 0-4-2.1-4-4.4 0-2.2 1.7-4 3.9-4 1.8 0 3.4 1.2 4.1 3-0.7 1.8-2.3 5.4-4 5.4zm10.2 0c-1.7 0-3.3-3.6-4-5.4 0.7-1.8 2.3-3 4.1-3 2.2 0 3.9 1.8 3.9 4 0 2.3-1.9 4.4-4 4.4z"/>
    </svg>
  );
}

export function NvidiaLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 16c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm-4-6c0 2.21 1.79 4 4 4s4-1.79 4-4-1.79-4-4-4-4 1.79-4 4z"/>
    </svg>
  );
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
    return <Globe className={`${className} text-emerald-400`} />;
  }
  if (id.includes("gemini") || prov === "gemini") {
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

  return <Sparkles className={className} />;
}
