"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MessageBubble, Message } from "@/components/chat/MessageBubble";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Sparkles, Share2, Check, ExternalLink } from "lucide-react";

export default function PublicSharePage() {
  const params = useParams();
  const chatId = params?.chatId as string | undefined;

  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionTitle, setSessionTitle] = useState("Percakapan Ditinggalkan");
  const [modelName, setModelName] = useState("Gemini 3.6 Flash");
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    if (!chatId) return;

    async function loadSharedSession() {
      setIsLoading(true);
      try {
        const { data: sessionData } = await supabase
          .from("chat_sessions")
          .select("*")
          .eq("id", chatId)
          .single();

        if (sessionData) {
          setSessionTitle(sessionData.title || "Percakapan Shared");
          setModelName(sessionData.model_id || "Gemini 3.6 Flash");
        }

        const { data: msgData } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("session_id", chatId)
          .order("created_at", { ascending: true });

        if (msgData && msgData.length > 0) {
          const formatted: Message[] = msgData.map((m) => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            content: m.content,
            timestamp: m.created_at,
          }));
          setMessages(formatted);
        }
      } catch (err) {
        console.error("Failed to load shared session:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadSharedSession();
  }, [chatId, supabase]);

  const handleCopyShareLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[#07070d] text-white font-sans flex flex-col justify-between selection:bg-white/20">
      {/* Header Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[#07070d]/90 border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/chat"
            className="p-2 rounded-xl bg-white/[0.06] border border-white/10 hover:bg-white/[0.12] text-white/70 hover:text-white transition-colors"
            title="Kembali ke Studio Chat"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold text-white tracking-tight truncate max-w-[200px] sm:max-w-md">
              {sessionTitle}
            </h1>
            <span className="text-[10px] text-white/40 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Dipublikasikan via LucidChat AI • {modelName}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyShareLink}
            className="px-3 py-1.5 rounded-xl bg-white/[0.08] border border-white/15 hover:bg-white/[0.15] text-xs font-semibold text-white transition-all flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="hidden xs:inline">{copied ? "Link Tersalin!" : "Bagikan Link"}</span>
          </button>
          <Link
            href="/chat"
            className="px-4 py-1.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-white/90 shadow-md transition-all flex items-center gap-1"
          >
            <span>Coba Chat</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </header>

      {/* Main Shared Content Body */}
      <main className="max-w-3xl w-full mx-auto p-4 sm:p-6 flex-1 space-y-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
            <p className="text-xs text-white/40">Memuat percakapan publik...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-20 text-xs text-white/40">
            Percakapan ini kosong atau belum tersimpan secara publik.
          </div>
        ) : (
          messages.map((m) => (
            <MessageBubble
              key={m.id}
              message={m}
              onOpenCodePreview={() => {}}
            />
          ))
        )}
      </main>

      {/* Bottom CTA Banner */}
      <footer className="border-t border-white/10 bg-[#0c0c14] p-6 text-center space-y-3">
        <p className="text-xs text-white/60 font-medium">
          Ingin melakukan percakapan AI interaktif dengan model pilihan Anda?
        </p>
        <Link
          href="/chat"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-black text-xs font-bold shadow-lg hover:scale-105 transition-all"
        >
          <span>Mulai Percakapan Baru di LucidChat</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </footer>
    </div>
  );
}
