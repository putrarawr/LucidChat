"use client";

import { useState } from "react";
import { DEFAULT_PERSONAS, Persona } from "@/lib/persona-types";
import { Sparkles, Code, Terminal, Zap, PenTool, Sliders, X, Check } from "lucide-react";

interface PersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPersona: Persona;
  onSelectPersona: (persona: Persona, customPrompt?: string) => void;
}

export function PersonaModal({
  isOpen,
  onClose,
  selectedPersona,
  onSelectPersona,
}: PersonaModalProps) {
  const [customPrompt, setCustomPrompt] = useState(
    selectedPersona.id === "custom" ? selectedPersona.systemPrompt : ""
  );
  const [activeTab, setActiveTab] = useState<"preset" | "custom">(
    selectedPersona.id === "custom" ? "custom" : "preset"
  );

  if (!isOpen) return null;

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "Code":
        return <Code className="w-4 h-4" />;
      case "Terminal":
        return <Terminal className="w-4 h-4" />;
      case "Zap":
        return <Zap className="w-4 h-4" />;
      case "PenTool":
        return <PenTool className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const handleApplyCustom = () => {
    const customPersona: Persona = {
      id: "custom",
      name: "Custom Persona",
      description: "System prompt khusus sesuai keinginan Anda.",
      icon: "Sliders",
      systemPrompt: customPrompt,
    };
    onSelectPersona(customPersona, customPrompt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg liquid-glass-elevated p-6 space-y-5 border border-white/[0.14] shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-4 h-4 text-white/70" />
            <h3 className="text-sm font-semibold text-white tracking-wide">Pilih AI Persona & System Prompt</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] text-xs font-medium">
          <button
            onClick={() => setActiveTab("preset")}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === "preset"
                ? "bg-white/[0.12] text-white shadow-sm font-semibold"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            Preset Persona
          </button>
          <button
            onClick={() => setActiveTab("custom")}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === "custom"
                ? "bg-white/[0.12] text-white shadow-sm font-semibold"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            System Prompt Kustom
          </button>
        </div>

        {/* Preset List */}
        {activeTab === "preset" ? (
          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            {DEFAULT_PERSONAS.map((p) => {
              const isSelected = selectedPersona.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    onSelectPersona(p);
                    onClose();
                  }}
                  className={`group p-3 rounded-2xl border cursor-pointer transition-all duration-200 flex items-start justify-between gap-3 ${
                    isSelected
                      ? "bg-white/[0.12] border-white/[0.25] shadow-md"
                      : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.07] hover:border-white/[0.12]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white/80 shrink-0 mt-0.5">
                      {renderIcon(p.icon)}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white">{p.name}</h4>
                      <p className="text-[11px] text-white/40 mt-0.5 leading-relaxed">{p.description}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="p-1 rounded-full bg-white text-black shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Custom Prompt Editor */
          <div className="space-y-4">
            <p className="text-xs text-white/50 leading-relaxed">
              Tuliskan instruksi sistem kustom untuk mengatur perilaku, gaya bahasa, dan batasan respons AI.
            </p>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Contoh: Anda adalah asisten senior yang selalu memberikan kode TypeScript lengkap dan penjelasan bullet point..."
              rows={5}
              className="w-full p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.1] text-xs text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-all resize-none"
            />
            <button
              onClick={handleApplyCustom}
              disabled={!customPrompt.trim()}
              className="w-full py-2.5 rounded-2xl bg-white text-black font-semibold text-xs hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Terapkan System Prompt
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
