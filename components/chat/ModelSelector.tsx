"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Sparkles, Code, Brain, Globe, Laptop, Zap } from "lucide-react";
import { DEFAULT_MODELS, ModelItem } from "@/lib/model-router";

interface ModelSelectorProps {
  selectedModel: ModelItem;
  onSelectModel: (model: ModelItem) => void;
}

const CATEGORY_ICONS: Record<string, any> = {
  fast: Zap,
  routine: Zap,
  coding: Code,
  agentic: Sparkles,
  reasoning: Brain,
  multilingual: Globe,
  local: Laptop,
};

export function ModelSelector({ selectedModel, onSelectModel }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const categories = [
    { tag: "fast", title: "FAST & ROUTINE", items: DEFAULT_MODELS.filter((m) => m.capability_tags.includes("fast")) },
    { tag: "coding", title: "CODING & AGENTIC", items: DEFAULT_MODELS.filter((m) => m.capability_tags.includes("coding")) },
    { tag: "reasoning", title: "DEEP REASONING", items: DEFAULT_MODELS.filter((m) => m.capability_tags.includes("reasoning")) },
    { tag: "multilingual", title: "MULTILINGUAL", items: DEFAULT_MODELS.filter((m) => m.capability_tags.includes("multilingual")) },
    { tag: "local", title: "LOCAL ENGINE", items: DEFAULT_MODELS.filter((m) => m.capability_tags.includes("local")) },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="glass-pill flex items-center gap-2 text-xs font-medium tracking-wide shadow-lg border border-white/15 hover:border-white/30"
      >
        <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
        <span>{selectedModel.display_name}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-white/60 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 liquid-glass-elevated py-2 z-50 animate-glass-appear border border-white/20 divide-y divide-white/10 max-h-96 overflow-y-auto">
          {categories.map((cat) => {
            if (cat.items.length === 0) return null;
            const Icon = CATEGORY_ICONS[cat.tag] || Sparkles;

            return (
              <div key={cat.tag} className="py-1.5 first:pt-0 last:pb-0">
                <div className="px-3 py-1 flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-white/40 uppercase">
                  <Icon className="w-3 h-3" />
                  <span>{cat.title}</span>
                </div>
                <div className="space-y-0.5 px-1">
                  {cat.items.map((m) => {
                    const isSelected = m.id === selectedModel.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => {
                          onSelectModel(m);
                          setIsOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                          isSelected
                            ? "bg-white/15 text-white font-medium border border-white/15"
                            : "text-white/70 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        <span className="truncate">{m.display_name}</span>
                        {m.is_free && (
                          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-full bg-white/10 text-white/50 border border-white/10">
                            Free
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
