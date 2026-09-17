"use client";

import { useState } from "react";
import { Code, Eye, X, Copy, Check, Monitor, Tablet, Smartphone, Maximize2, Minimize2, WrapText, Download, Loader2 } from "lucide-react";
import JSZip from "jszip";
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
  const [downloadingZip, setDownloadingZip] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setDownloadingZip(true);
      const zip = new JSZip();

      let css = "";
      let js = "";

      const styleMatches = [...codeContent.matchAll(/<style[\s\S]*?>([\s\S]*?)<\/style>/gi)];
      if (styleMatches.length > 0) {
        css = styleMatches.map((m) => m[1].trim()).join("\n\n");
      }

      const scriptMatches = [...codeContent.matchAll(/<script(?![^>]*\bsrc=)[\s\S]*?>([\s\S]*?)<\/script>/gi)];
      if (scriptMatches.length > 0) {
        js = scriptMatches.map((m) => m[1].trim()).join("\n\n");
      }

      if (css || js) {
        let cleanHtml = codeContent;
        if (css) {
          cleanHtml = cleanHtml.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '<link rel="stylesheet" href="styles.css" />');
          zip.file("styles.css", css);
        }
        if (js) {
          cleanHtml = cleanHtml.replace(/<script(?![^>]*\bsrc=)[\s\S]*?>[\s\S]*?<\/script>/gi, '<script src="script.js"></script>');
          zip.file("script.js", js);
        }
        zip.file("index.html", cleanHtml);
      } else {
        zip.file("index.html", codeContent);
      }

      zip.file("README.md", "# LucidChat Exported Web Project\n\nDouble-click `index.html` to view in browser.");

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lucidchat-project-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to generate zip project:", err);
    } finally {
      setDownloadingZip(false);
    }
  };

  return (
    <div className="flex flex-col h-full liquid-glass-elevated overflow-hidden border border-white/12 shadow-2xl rounded-2xl">
      {/* Tab Header Bar */}
      <div className="flex items-center justify-between px-2.5 sm:px-4 py-2 sm:py-2.5 border-b border-white/10 bg-black/40 backdrop-blur-xl gap-1.5">
        {/* Left: Tab Switches */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === "preview"
                ? "bg-white/15 text-white shadow-sm border border-white/15"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="text-[11px] sm:text-xs">Preview</span>
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === "code"
                ? "bg-white/15 text-white shadow-sm border border-white/15"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span className="text-[11px] sm:text-xs">Code</span>
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

        {/* Right: Actions (Copy, Download ZIP, Word Wrap, Maximize, Close) */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {activeTab === "code" && (
            <button
              onClick={() => setWordWrap(!wordWrap)}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-xs font-medium rounded-xl border transition-all ${
                wordWrap
                  ? "bg-white/15 text-white border-white/20"
                  : "bg-white/5 text-white/50 border-white/10 hover:text-white"
              }`}
              title="Toggle Word Wrap"
            >
              <WrapText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Wrap</span>
            </button>
          )}

          <button
            onClick={handleDownloadZip}
            disabled={downloadingZip}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-xs font-medium text-purple-300 hover:text-purple-100 bg-purple-500/10 hover:bg-purple-500/20 rounded-xl border border-purple-500/20 transition-all disabled:opacity-50"
            title="Download Full Project (.ZIP)"
          >
            {downloadingZip ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Export ZIP</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-xs font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"
            title="Copy Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
          </button>

          {onToggleMaximize && (
            <button
              onClick={onToggleMaximize}
              className="hidden sm:block p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              title={isMaximized ? "Kecilkan Panel" : "Perbesar Fullscreen"}
            >
              {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl border border-white/15 transition-all shadow-sm"
              title="Close Preview"
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
