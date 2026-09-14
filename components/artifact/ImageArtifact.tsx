"use client";

import { useState } from "react";
import { Download, Sparkles, RefreshCw, Maximize2, ExternalLink, Image as ImageIcon } from "lucide-react";
import { playClickSound } from "@/lib/sound";

interface ImageArtifactProps {
  prompt: string;
  imageUrl: string;
  aspectRatio?: string;
}

export function ImageArtifact({ prompt, imageUrl }: ImageArtifactProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(imageUrl);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleDownload = async () => {
    playClickSound();
    try {
      const res = await fetch(currentUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lucidchat-art-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.warn("Download fail, opening in new tab:", err);
      window.open(currentUrl, "_blank");
    }
  };

  const handleRegenerate = () => {
    playClickSound();
    setIsRefreshing(true);
    setIsLoaded(false);
    setHasError(false);
    // Add random seed to refresh image
    const newSeed = Math.floor(Math.random() * 1000000);
    const cleanPrompt = encodeURIComponent(prompt.trim());
    const newUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=1024&height=1024&nologo=true&seed=${newSeed}`;
    setCurrentUrl(newUrl);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div className="my-3 max-w-lg w-full rounded-2xl overflow-hidden border border-white/15 bg-[#0b0c14]/90 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.6)] font-sans">
      {/* Header Bar */}
      <div className="px-3.5 py-2 flex items-center justify-between border-b border-white/10 bg-white/[0.03]">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>AI Image Generator</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleRegenerate}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all disabled:opacity-40"
            title="Generate Ulang Gambar"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleDownload}
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
            title="Download Gambar PNG"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
            title="Perbesar Gambar"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Image Viewport */}
      <div className="relative w-full aspect-square bg-black/40 overflow-hidden flex items-center justify-center">
        {!isLoaded && !hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/[0.02] animate-pulse">
            <ImageIcon className="w-8 h-8 text-white/20" />
            <span className="text-xs text-white/40 font-mono">Membuat Gambar AI...</span>
          </div>
        )}

        {hasError ? (
          <div className="flex flex-col items-center justify-center p-6 text-center gap-2 text-red-400">
            <span className="text-xs font-semibold">Gagal memuat gambar AI.</span>
            <button
              onClick={handleRegenerate}
              className="mt-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-white transition-all"
            >
              Coba Lagi
            </button>
          </div>
        ) : (
          <img
            src={currentUrl}
            alt={prompt}
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        )}
      </div>

      {/* Footer Prompt Label */}
      <div className="p-3 bg-white/[0.02] border-t border-white/5 flex items-start justify-between gap-2">
        <p className="text-[11px] text-white/70 line-clamp-2 italic leading-snug">
          &quot;{prompt}&quot;
        </p>
        <a
          href={currentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/40 hover:text-white shrink-0 p-1"
          title="Buka URL Asli"
        >
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Fullscreen Overlay Modal */}
      {isFullscreen && (
        <div
          onClick={() => setIsFullscreen(false)}
          className="fixed inset-0 z-[999999] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
        >
          <img
            src={currentUrl}
            alt={prompt}
            className="max-w-full max-h-full rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
