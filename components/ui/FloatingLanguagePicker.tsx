"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nContext";
import { SUPPORTED_LANGUAGES, Language } from "@/lib/i18n/translations";
import { playClickSound } from "@/lib/sound";

interface FloatingLanguagePickerProps {
  variant?: "floating" | "compact" | "grid";
  className?: string;
}

export function FloatingLanguagePicker({
  variant = "floating",
  className = "",
}: FloatingLanguagePickerProps) {
  const { lang, setLang } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentLangInfo =
    SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSelect = (code: Language) => {
    playClickSound();
    setLang(code);
    setIsOpen(false);
  };

  if (variant === "grid") {
    return (
      <div className={`grid grid-cols-2 sm:grid-cols-3 gap-2 ${className}`}>
        {SUPPORTED_LANGUAGES.map((l) => {
          const isSelected = lang === l.code;
          return (
            <button
              key={l.code}
              type="button"
              onClick={() => handleSelect(l.code)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all border ${
                isSelected
                  ? "bg-white/15 border-white/30 text-white shadow-sm"
                  : "bg-white/[0.03] border-white/10 text-white/60 hover:text-white hover:bg-white/[0.06]"
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span className="text-sm">{l.flag}</span>
                <span className="truncate">{l.nativeName}</span>
              </div>
              {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Floating Circle Button */}
      {variant === "floating" ? (
        <button
          type="button"
          onClick={() => {
            playClickSound();
            setIsOpen(!isOpen);
          }}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-white/[0.08] hover:bg-white/[0.16] border border-white/15 text-white shadow-md backdrop-blur-md transition-all duration-200 active:scale-95 group relative"
          title={`Language: ${currentLangInfo.nativeName}`}
        >
          <span className="text-base group-hover:scale-110 transition-transform">
            {currentLangInfo.flag}
          </span>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border border-black/80 flex items-center justify-center text-[7px] font-bold text-black">
            ✓
          </span>
        </button>
      ) : (
        /* Compact Pill Button */
        <button
          type="button"
          onClick={() => {
            playClickSound();
            setIsOpen(!isOpen);
          }}
          className="px-2.5 py-1 rounded-full flex items-center gap-1.5 bg-white/[0.08] hover:bg-white/[0.16] border border-white/15 text-xs text-white font-medium shadow-sm backdrop-blur-md transition-all duration-200 active:scale-95"
        >
          <span className="text-sm">{currentLangInfo.flag}</span>
          <span className="uppercase text-[10px] font-bold tracking-wider">{currentLangInfo.code}</span>
          <ChevronDown className={`w-3 h-3 opacity-60 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
      )}

      {/* Glassmorphic Language Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/20 bg-[#0c0c12]/95 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] p-2 z-[9999] animate-fade-in space-y-1 max-h-80 overflow-y-auto scrollbar-thin">
          <div className="px-2.5 py-1.5 border-b border-white/10 flex items-center justify-between text-[10px] font-bold text-white/40 uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3" /> Select Language
            </span>
            <span>12 Languages</span>
          </div>
          <div className="py-1 space-y-0.5">
            {SUPPORTED_LANGUAGES.map((l) => {
              const isSelected = lang === l.code;
              return (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => handleSelect(l.code)}
                  className={`w-full px-2.5 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-all ${
                    isSelected
                      ? "bg-white/15 text-white font-semibold shadow-sm border border-white/10"
                      : "text-white/70 hover:text-white hover:bg-white/[0.08]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-base shrink-0">{l.flag}</span>
                    <div className="flex flex-col text-left truncate">
                      <span className="truncate leading-tight">{l.nativeName}</span>
                      <span className="text-[9px] text-white/40 truncate">{l.name}</span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
