"use client";

import { Code2, Sparkles, User } from "lucide-react";

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  hasCode?: boolean;
}

interface MessageBubbleProps {
  message: Message;
  onOpenCodePreview?: (code: string) => void;
}

export function MessageBubble({ message, onOpenCodePreview }: MessageBubbleProps) {
  const isUser = message.role === "user";

  // Extract HTML code block if present
  const extractCode = (text: string) => {
    const match = text.match(/```html([\s\S]*?)```/) || text.match(/```([\s\S]*?)```/);
    return match ? match[1].trim() : null;
  };

  const codeSnippet = extractCode(message.content);

  return (
    <div className={`flex gap-3 my-4 ${isUser ? "flex-row-reverse" : "flex-row"} animate-glass-appear`}>
      {/* Avatar Icon */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
          isUser
            ? "bg-white/20 border-white/30 text-white shadow-[0_0_12px_rgba(255,255,255,0.2)]"
            : "bg-black/40 border-white/10 text-white/80"
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-white" />}
      </div>

      {/* Bubble Box */}
      <div
        className={`max-w-[85%] rounded-2xl p-4 transition-all duration-300 ${
          isUser
            ? "bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-tr-sm shadow-glass-sm"
            : "liquid-glass text-white/90 rounded-tl-sm"
        }`}
      >
        <div className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-1">
          {isUser ? "Anda" : "LucidAI"}
        </div>

        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words font-normal">
          {message.content}
        </div>

        {/* Code Artifact Preview Button */}
        {codeSnippet && onOpenCodePreview && (
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-white/60 flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-white" />
              Web UI Artifact Terdeteksi
            </span>
            <button
              onClick={() => onOpenCodePreview(codeSnippet)}
              className="glass-pill text-xs px-3 py-1 bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center gap-1 shadow-sm"
            >
              Lihat Preview
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
