"use client";

import { useState, useEffect, useRef } from "react";
import { Sparkles, User, Copy, Check, Eye, Volume2, VolumeX, Pencil, RefreshCw, ExternalLink, Globe, Zap, Activity, Hash, Cpu } from "lucide-react";
import { AttachmentFile } from "./ChatInputBar";
import { playClickSound } from "@/lib/sound";
import { MermaidDiagram } from "@/components/artifact/MermaidDiagram";

export interface MessageStats {
  ttftMs?: number;
  totalTokens?: number;
  tokensPerSec?: number;
  provider?: string;
  modelName?: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  attachments?: AttachmentFile[];
  hasCode?: boolean;
  isStreaming?: boolean;
  stats?: MessageStats;
}

interface MessageBubbleProps {
  message: Message;
  userAvatar?: string;
  onOpenCodePreview?: (code: string) => void;
  onEditMessage?: (id: string, newText: string) => void;
  onRegenerate?: (id: string) => void;
}

const LOADING_PHRASES = [
  "Sedang menganalisis konteks...",
  "Mencari jawaban terbaik...",
  "Menyusun respons terstruktur...",
  "Memformulasikan jawaban presisi...",
  "Merancang solusi & kode...",
  "Menyelesaikan kalimat...",
];

export function stripThinkTags(text: string): string {
  if (!text) return "";
  let cleaned = text;
  // 1. Remove completed <think>...</think> blocks
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, "");
  // 2. Remove unclosed <think>... if streaming
  cleaned = cleaned.replace(/<think>[\s\S]*/gi, "");
  // 3. Remove system prompt leaks & instructions
  cleaned = cleaned.replace(/<system_instructions>[\s\S]*?<\/system_instructions>/gi, "");
  cleaned = cleaned.replace(/<custom_persona_instructions>[\s\S]*?<\/custom_persona_instructions>/gi, "");
  cleaned = cleaned.replace(/<user_input>[\s\S]*?<\/user_input>/gi, "");
  cleaned = cleaned.replace(/^system_instructions[\s\S]*?\n/gi, "");
  cleaned = cleaned.replace(/^You are LucidChat AI Assistant[\s\S]*?\n\n/gi, "");
  // 4. Remove any hallucinated Chinese, Japanese, or Korean characters (CJK)
  cleaned = cleaned.replace(/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af\u1100-\u11ff\u3130-\u318f]/g, "");
  return cleaned.trim();
}

function DynamicLoadingText() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % LOADING_PHRASES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2.5 text-[12px] text-white/70 py-0.5 select-none">
      <div className="flex gap-1 items-center shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-ping" />
        <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
      </div>
      <span className="transition-all duration-300 font-medium italic tracking-wide text-white/75">
        {LOADING_PHRASES[index]}
      </span>
    </div>
  );
}

function CodeTerminalBlock({
  lang,
  code,
  onOpenCodePreview,
}: {
  lang: string;
  code: string;
  onOpenCodePreview?: (code: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Keep scroll at top initially so top of code (<!DOCTYPE html>) is always visible first
    if (containerRef.current && !isExpanded) {
      containerRef.current.scrollTop = 0;
    }
  }, [code, isExpanded]);

  const handleCopy = () => {
    playClickSound();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isPreviewable =
    lang.toLowerCase().includes("html") ||
    code.includes("<html") ||
    code.includes("<div") ||
    code.includes("<!DOCTYPE");

  const lineCount = code.split("\n").length;

  return (
    <div className="my-3 rounded-2xl overflow-hidden border border-white/12 bg-[#0a0a10]/95 shadow-2xl font-mono text-xs select-text w-full">
      {/* Terminal Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-white/[0.04] border-b border-white/[0.08]">
        {/* Mac OS Traffic Light Dots */}
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 border border-red-600/40" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 border border-yellow-600/40" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 border border-green-600/40" />
          <span className="ml-2 text-[11px] font-sans font-medium text-white/40 tracking-wider">
            {lang ? lang.toLowerCase() : "terminal"} • {lineCount} baris
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 font-sans">
          <button
            onClick={() => {
              playClickSound();
              setIsExpanded(!isExpanded);
            }}
            className="px-2 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-[10px] text-white/70 hover:text-white border border-white/[0.08] transition-all"
          >
            {isExpanded ? "Ringkas" : "Perluas"}
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-[10px] text-white/70 hover:text-white border border-white/[0.08] transition-all"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
          {isPreviewable && onOpenCodePreview && (
            <button
              onClick={() => {
                playClickSound();
                onOpenCodePreview(code);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.12] hover:bg-white/[0.20] text-[10px] font-semibold text-white border border-white/[0.15] shadow-sm transition-all"
            >
              <Eye className="w-3 h-3" />
              <span>Live Preview</span>
            </button>
          )}
        </div>
      </div>

      {/* Terminal Code Body */}
      <div
        ref={containerRef}
        className={`p-4 overflow-x-auto overflow-y-auto leading-relaxed text-emerald-300/90 selection:bg-white/20 transition-all duration-300 ${
          isExpanded ? "max-h-[650px]" : "max-h-72"
        }`}
      >
        <pre className="whitespace-pre font-mono text-[12px]">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

function parseInlineMarkdown(text: string) {
  const parts = text.split(/(\[\d+\]|\[[^\]]+\]\([^)]+\)|\*\*[\s\S]*?\*\*|`[^`]+`|\*[^*]+\*|https?:\/\/[^\s<)]+)/g);

  return parts.map((part, index) => {
    // Numeric citation bracket: [1], [2], [3]
    const citationMatch = part.match(/^\[(\d+)\]$/);
    if (citationMatch) {
      const num = citationMatch[1];
      return (
        <sup
          key={index}
          className="inline-flex items-center justify-center px-1.5 py-0.5 mx-0.5 rounded-md bg-white/10 hover:bg-white/20 text-[10px] font-semibold text-white/90 border border-white/15 select-none transition-all cursor-pointer"
          title={`Sumber Referensi Berita #${num}`}
        >
          {num}
        </sup>
      );
    }

    // Markdown link: [Title](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const label = linkMatch[1];
      const url = linkMatch[2];
      return (
        <a
          key={index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 my-0.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.18] text-white underline underline-offset-4 decoration-white/40 hover:decoration-white transition-all text-[12px] font-medium border border-white/[0.12] shadow-sm group"
          title={`Buka ${url}`}
        >
          <Globe className="w-3.5 h-3.5 text-white/60 group-hover:text-white shrink-0" />
          <span>{label}</span>
          <ExternalLink className="w-3 h-3 text-white/50 group-hover:text-white inline shrink-0 transition-colors" />
        </a>
      );
    }

    // Raw HTTP / HTTPS URL
    if (part.startsWith("http://") || part.startsWith("https://")) {
      let displayUrl = part;
      try {
        const u = new URL(part);
        displayUrl = u.hostname + (u.pathname.length > 15 ? u.pathname.slice(0, 15) + "..." : u.pathname);
      } catch {
        displayUrl = part.slice(0, 30);
      }

      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/[0.06] hover:bg-white/[0.14] text-white/90 underline underline-offset-2 transition-all text-[12px] group"
          title={part}
        >
          <span className="truncate max-w-[200px]">{displayUrl}</span>
          <ExternalLink className="w-3 h-3 text-white/40 group-hover:text-white shrink-0" />
        </a>
      );
    }

    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      const boldText = part.slice(2, -2);
      return (
        <strong key={index} className="font-bold text-white tracking-wide">
          {boldText}
        </strong>
      );
    }

    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      const codeText = part.slice(1, -1);
      return (
        <code key={index} className="px-1.5 py-0.5 rounded-md bg-white/10 text-white font-mono text-[11px] border border-white/10">
          {codeText}
        </code>
      );
    }

    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      const italicText = part.slice(1, -1);
      return (
        <em key={index} className="italic text-white/80">
          {italicText}
        </em>
      );
    }

    return part;
  });
}

function FormattedTextSegment({ text }: { text: string }) {
  const lines = text.split("\n");

  return (
    <div className="space-y-1">
      {lines.map((line, lineIndex) => {
        if (line.startsWith("### ")) {
          return (
            <h4 key={lineIndex} className="text-sm font-bold text-white mt-3 mb-1 tracking-tight">
              {parseInlineMarkdown(line.slice(4))}
            </h4>
          );
        }
        if (line.startsWith("## ")) {
          return (
            <h3 key={lineIndex} className="text-base font-bold text-white mt-3 mb-1 tracking-tight">
              {parseInlineMarkdown(line.slice(3))}
            </h3>
          );
        }
        if (line.startsWith("# ")) {
          return (
            <h2 key={lineIndex} className="text-lg font-bold text-white mt-3 mb-1 tracking-tight">
              {parseInlineMarkdown(line.slice(2))}
            </h2>
          );
        }

        const isBullet = line.trim().startsWith("* ") || line.trim().startsWith("- ");
        if (isBullet) {
          const bulletText = line.trim().slice(2);
          return (
            <div key={lineIndex} className="flex items-start gap-2 pl-2 my-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white/50 shrink-0 mt-2" />
              <div className="text-[13px] leading-[1.65] text-white/90">
                {parseInlineMarkdown(bulletText)}
              </div>
            </div>
          );
        }

        if (!line.trim()) {
          return <div key={lineIndex} className="h-1.5" />;
        }

        return (
          <div key={lineIndex} className="text-[13px] leading-[1.65] text-white/90 break-words">
            {parseInlineMarkdown(line)}
          </div>
        );
      })}
    </div>
  );
}

function ParsedMessageContent({
  content,
  onOpenCodePreview,
}: {
  content: string;
  onOpenCodePreview?: (code: string) => void;
}) {
  let cleanText = stripThinkTags(content);
  if (!cleanText) return <div className="text-[13px] text-white/70 italic">Halo! Ada yang bisa saya bantu hari ini?</div>;

  // Auto-close unclosed code block if truncated or streaming
  const codeBlockMatches = (cleanText.match(/```/g) || []).length;
  if (codeBlockMatches % 2 !== 0) {
    cleanText += "\n```";
  }

  const parts = cleanText.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2">
      {parts.map((part, index) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          const firstLineEnd = part.indexOf("\n");
          let lang = "code";
          let code = "";
          if (firstLineEnd !== -1) {
            lang = part.slice(3, firstLineEnd).trim() || "code";
            code = part.slice(firstLineEnd + 1, -3).trim();
          } else {
            code = part.slice(3, -3).trim();
          }

          if (lang.toLowerCase() === "mermaid") {
            return <MermaidDiagram key={index} code={code} />;
          }

          return (
            <CodeTerminalBlock
              key={index}
              lang={lang}
              code={code}
              onOpenCodePreview={onOpenCodePreview}
            />
          );
        }

        if (!part.trim()) return null;

        return (
          <FormattedTextSegment key={index} text={part} />
        );
      })}
    </div>
  );
}

export function MessageBubble({
  message,
  userAvatar,
  onOpenCodePreview,
  onEditMessage,
  onRegenerate,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const cleanContent = isUser ? message.content : stripThinkTags(message.content);

  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);

  const handleToggleSpeech = () => {
    if (!window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanContent);
    utterance.lang = "id-ID";
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = () => {
    playClickSound();
    navigator.clipboard.writeText(cleanContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    if (editText.trim() && onEditMessage) {
      onEditMessage(message.id, editText.trim());
      setIsEditing(false);
    }
  };

  return (
    <div className={`group flex gap-2.5 my-2.5 ${isUser ? "flex-row-reverse" : "flex-row"} animate-slide-up`}>
      {/* Avatar Icon */}
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border overflow-hidden mt-0.5 ${
          isUser
            ? "bg-white/12 border-white/20 text-white"
            : "bg-white/[0.04] border-white/[0.08] text-white/70"
        }`}
      >
        {isUser ? (
          userAvatar ? (
            <img src={userAvatar} alt="User Avatar" className="w-full h-full object-cover rounded-full" />
          ) : (
            <User className="w-3 h-3" />
          )
        ) : (
          <Sparkles className="w-3 h-3 text-white/70" />
        )}
      </div>

      {/* Bubble Container - items-end for user keeps bubble snug next to avatar */}
      <div className={`flex flex-col gap-1 max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>
        {/* Render Attachments if Present */}
        {message.attachments && message.attachments.length > 0 && (
          <div className={`flex flex-wrap gap-2 ${isUser ? "justify-end" : "justify-start"} mb-1`}>
            {message.attachments.map((att, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-white/10 max-w-[200px]">
                {att.type === "image" ? (
                  <img src={att.content} alt={att.name} className="w-full h-auto object-cover max-h-48" />
                ) : (
                  <div className="p-2 bg-white/5 text-[10px] text-white/70 font-mono truncate">
                    {att.name}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className={`w-fit px-4 py-3 ${isUser ? "msg-user" : "msg-assistant"}`}>
          {isEditing ? (
            <div className="space-y-2 min-w-[260px]">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={3}
                className="w-full p-2.5 rounded-xl bg-black/40 border border-white/20 text-xs text-white outline-none resize-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-2.5 py-1 rounded-lg text-[10px] text-white/50 hover:bg-white/10"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1 rounded-lg text-[10px] font-semibold bg-white text-black hover:bg-white/90"
                >
                  Kirim Ulang
                </button>
              </div>
            </div>
          ) : !isUser && !cleanContent && message.isStreaming ? (
            <DynamicLoadingText />
          ) : (
            <ParsedMessageContent
              content={cleanContent || (isUser ? "" : "Halo! Ada yang bisa saya bantu hari ini?")}
              onOpenCodePreview={onOpenCodePreview}
            />
          )}
        </div>

        {/* Real-time Performance & Token Stats Pill Bar */}
        {!isUser && message.stats && (
          <div className="flex flex-wrap items-center gap-1.5 mt-1 px-1 text-[10px] font-mono text-white/40 select-none">
            {message.stats.ttftMs !== undefined && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06]" title="Time-to-First-Token (Latency ms)">
                <Zap className="w-3 h-3 text-amber-400/80" />
                <span>{message.stats.ttftMs}ms TTFT</span>
              </span>
            )}
            {message.stats.tokensPerSec !== undefined && message.stats.tokensPerSec > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06]" title="Tokens per Second (Kecepatan real-time)">
                <Activity className="w-3 h-3 text-emerald-400/80" />
                <span>{message.stats.tokensPerSec} t/s</span>
              </span>
            )}
            {message.stats.totalTokens !== undefined && message.stats.totalTokens > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06]" title="Total Token Terhitung">
                <Hash className="w-3 h-3 text-blue-400/80" />
                <span>{message.stats.totalTokens} tokens</span>
                {message.isStreaming && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping ml-0.5" />
                )}
              </span>
            )}
            {message.stats.provider && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06]" title="Active AI Provider">
                <Cpu className="w-3 h-3 text-purple-400/80" />
                <span className="capitalize">{message.stats.provider}</span>
              </span>
            )}
          </div>
        )}

        {/* Action Toolbar on Hover */}
        {!message.isStreaming && !isEditing && (
          <div
            className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-1 ${
              isUser ? "justify-end" : "justify-start"
            }`}
          >
            <button
              onClick={handleCopy}
              className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
              title="Salin Teks"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={handleToggleSpeech}
              className={`p-1 rounded-lg hover:bg-white/10 transition-colors ${
                isSpeaking ? "text-emerald-400" : "text-white/40 hover:text-white"
              }`}
              title={isSpeaking ? "Hentikan Suara" : "Bacakan Respons (Text-to-Speech)"}
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {isUser && onEditMessage && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                title="Edit Pesan"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}

            {!isUser && onRegenerate && (
              <button
                onClick={() => onRegenerate(message.id)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                title="Regenerate Respons AI"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
