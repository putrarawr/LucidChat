"use client";

import { useEffect, useRef, useState } from "react";
import { Copy, Check, Download, RefreshCw, ZoomIn, ZoomOut } from "lucide-react";
import { playClickSound } from "@/lib/sound";

interface MermaidDiagramProps {
  code: string;
}

export function MermaidDiagram({ code }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadAndRenderMermaid() {
      try {
        // Dynamically load Mermaid.js script if not present on window
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!(window as any).mermaid) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js";
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Failed to load Mermaid.js CDN"));
            document.head.appendChild(script);
          });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mermaid = (window as any).mermaid;
        if (!mermaid) return;

        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          themeVariables: {
            darkMode: true,
            background: "#0a0a10",
            primaryColor: "#ffffff",
            primaryTextColor: "#ffffff",
            primaryBorderColor: "rgba(255, 255, 255, 0.2)",
            lineColor: "rgba(255, 255, 255, 0.5)",
            secondaryColor: "rgba(255, 255, 255, 0.08)",
            tertiaryColor: "rgba(255, 255, 255, 0.04)",
          },
          securityLevel: "loose",
        });

        const uniqueId = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
        const cleanCode = code.trim();

        const { svg } = await mermaid.render(uniqueId, cleanCode);
        if (isMounted) {
          setSvgContent(svg);
          setError(null);
          setIsLoaded(true);
        }
      } catch (err) {
        if (isMounted) {
          console.warn("Mermaid render error:", err);
          setError(err instanceof Error ? err.message : "Gagal memproses diagram Mermaid");
          setIsLoaded(true);
        }
      }
    }

    loadAndRenderMermaid();

    return () => {
      isMounted = false;
    };
  }, [code]);

  const handleCopySvg = () => {
    if (!svgContent) return;
    playClickSound();
    navigator.clipboard.writeText(svgContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSvg = () => {
    if (!svgContent) return;
    playClickSound();
    const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `diagram_${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="my-3 rounded-2xl overflow-hidden border border-white/15 bg-[#0a0a10]/95 shadow-2xl font-sans select-none w-full">
      {/* Header Controls Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.04] border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
          <span className="text-[11px] font-semibold text-white/70 tracking-wide uppercase">
            Diagram Interaktif Mermaid
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}
            className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-white/60 hover:text-white transition-all"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] text-white/40 font-mono px-1">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))}
            className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-white/60 hover:text-white transition-all"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-3.5 bg-white/10 mx-1" />

          <button
            onClick={handleCopySvg}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-[10px] text-white/70 hover:text-white border border-white/[0.08] transition-all"
            title="Salin SVG Diagram"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? "Copied" : "Copy SVG"}</span>
          </button>

          <button
            onClick={handleDownloadSvg}
            className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-white/60 hover:text-white border border-white/[0.08] transition-all"
            title="Download SVG Diagram"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Canvas Body */}
      <div className="p-6 overflow-auto flex items-center justify-center min-h-[220px] bg-black/40 relative">
        {!isLoaded ? (
          <div className="flex items-center gap-2 text-xs text-white/50 animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin text-white/70" />
            <span>Memuat Diagram Mermaid...</span>
          </div>
        ) : error ? (
          <div className="text-center p-4 space-y-2">
            <p className="text-xs text-red-400 font-medium">{error}</p>
            <pre className="text-[10px] text-white/40 font-mono max-w-md overflow-x-auto p-2 bg-white/5 rounded-xl border border-white/10">
              {code}
            </pre>
          </div>
        ) : (
          <div
            ref={containerRef}
            style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
            className="transition-transform duration-200 ease-out max-w-full overflow-auto"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}
      </div>
    </div>
  );
}
