"use client";

import { useState } from "react";
import { Code, Eye, X, Copy, Check } from "lucide-react";
import { SandboxedFrame } from "./SandboxedFrame";

interface CodePreviewTabsProps {
  codeContent: string;
  onClose?: () => void;
}

export function CodePreviewTabs({ codeContent, onClose }: CodePreviewTabsProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full liquid-glass-elevated overflow-hidden border border-white/10">
      {/* Tab Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "preview"
                ? "bg-white/15 text-white shadow-sm border border-white/15"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Preview
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "code"
                ? "bg-white/15 text-white shadow-sm border border-white/15"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            Code
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all"
            title="Copy Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 p-3 overflow-hidden bg-black/20">
        {activeTab === "preview" ? (
          <SandboxedFrame htmlContent={codeContent} />
        ) : (
          <pre className="h-full p-4 overflow-auto font-mono text-xs text-white/90 bg-black/60 rounded-xl border border-white/10 leading-relaxed selection:bg-white/20">
            <code>{codeContent}</code>
          </pre>
        )}
      </div>
    </div>
  );
}
