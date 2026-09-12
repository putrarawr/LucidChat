"use client";

import { useState } from "react";
import { Code, Eye, X, Copy, Check, Monitor, Tablet, Smartphone, Maximize2, Minimize2, WrapText } from "lucide-react";
import { SandboxedFrame } from "./SandboxedFrame";

interface CodePreviewTabsProps {
  codeContent: string;
  onClose?: () => void;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
}

export function CodePreviewTabs({
  codeContent,
  onClose,
  isMaximized = false,
  onToggleMaximize,
}: CodePreviewTabsProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [viewportMode, setViewportMode] = useState<"full" | "desktop" | "tablet" | "mobile">("full");
  const [wordWrap, setWordWrap] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full liquid-glass-elevated overflow-hidden border border-white/12 shadow-2xl rounded-2xl">
      {/* Tab Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-black/40 backdrop-blur-xl">
        {/* Left: Tab Switches */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === "code"
                ? "bg-white/15 text-white shadow-sm border border-white/15"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            Code
          </button>
        </div>

        {/* Center: Device Viewport Controls (only visible in preview tab) */}
        {activeTab === "preview" && (
          <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-xl bg-white/[0.05] border border-white/[0.08]">
            <button
              onClick={() => setViewportMode("full")}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                viewportMode === "full" ? "bg-white/20 text-white" : "text-white/40 hover:text-white/80"
              }`}
              title="Responsif / Full Width"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewportMode("desktop")}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                viewportMode === "desktop" ? "bg-white/20 text-white" : "text-white/40 hover:text-white/80"
              }`}
              title="Desktop (1024px)"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewportMode("tablet")}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                viewportMode === "tablet" ? "bg-white/20 text-white" : "text-white/40 hover:text-white/80"
              }`}
              title="Tablet (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewportMode("mobile")}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                viewportMode === "mobile" ? "bg-white/20 text-white" : "text-white/40 hover:text-white/80"
              }`}
              title="Mobile (375px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Right: Actions (Copy, Word Wrap, Maximize, Close) */}
        <div className="flex items-center gap-1.5">
          {activeTab === "code" && (
            <button
              onClick={() => setWordWrap(!wordWrap)}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-xl border transition-all ${
                wordWrap
                  ? "bg-white/15 text-white border-white/20"
                  : "bg-white/5 text-white/50 border-white/10 hover:text-white"
              }`}
              title="Toggle Word Wrap"
            >
              <WrapText className="w-3.5 h-3.5" />
              <span>Wrap</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"
            title="Copy Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>

          {onToggleMaximize && (
            <button
              onClick={onToggleMaximize}
              className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              title={isMaximized ? "Kecilkan Panel" : "Perbesar Fullscreen"}
            >
              {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              title="Tutup Preview"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 p-2.5 overflow-hidden bg-black/20">
        {activeTab === "preview" ? (
          <SandboxedFrame htmlContent={codeContent} viewportMode={viewportMode} />
        ) : (
          <pre
            className={`h-full p-4 overflow-auto font-mono text-xs text-emerald-300/90 bg-[#0a0a10]/95 rounded-xl border border-white/10 leading-relaxed selection:bg-white/20 ${
              wordWrap ? "whitespace-pre-wrap break-words" : "whitespace-pre"
            }`}
          >
            <code>{codeContent}</code>
          </pre>
        )}
      </div>
    </div>
  );
}
