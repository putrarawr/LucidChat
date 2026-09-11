"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowUp, Paperclip } from "lucide-react";

interface ChatInputBarProps {
  onSendMessage: (text: string) => void;
  isLoading?: boolean;
}

export function ChatInputBar({ onSendMessage, isLoading }: ChatInputBarProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="liquid-glass-elevated p-2 border border-white/20 shadow-2xl backdrop-blur-2xl transition-all duration-300 focus-within:border-white/40 focus-within:shadow-[0_0_24px_rgba(255,255,255,0.15)]"
    >
      <div className="flex items-end gap-2 px-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tanyakan sesuatu atau minta buatkan komponen UI HTML..."
          rows={1}
          disabled={isLoading}
          className="w-full bg-transparent border-0 outline-none ring-0 focus:ring-0 resize-none text-sm text-white placeholder-white/40 py-2.5 max-h-40 overflow-y-auto leading-relaxed"
        />

        <div className="flex items-center gap-1.5 pb-1">
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
              input.trim() && !isLoading
                ? "bg-white text-black shadow-[0_0_12px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95"
                : "bg-white/10 text-white/30 border border-white/10 cursor-not-allowed"
            }`}
          >
            <ArrowUp className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </form>
  );
}
