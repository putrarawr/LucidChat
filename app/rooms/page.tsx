"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_MODELS, ModelItem } from "@/lib/model-types";
import { MessageBubble, Message, stripThinkTags } from "@/components/chat/MessageBubble";
import { ChatInputBar, AttachmentFile } from "@/components/chat/ChatInputBar";
import { ModelLogo } from "@/components/icons/ModelLogos";
import { ProviderType } from "@/lib/ai-clients";
import {
  ArrowLeft,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { playSuccessSound, playClickSound } from "@/lib/sound";

interface ChatRow {
  id: string;
  user_id: string;
  title: string;
  model_used: string;
  created_at: string;
  updated_at: string;
}

// Curated AI Contact Rooms (No Green Live Dots)
const ROOM_MODELS = [
  {
    id: "gemini/gemini-3.6-flash",
    name: "Gemini 3.6 Flash",
    provider: "Google",
    tagline: "Inferensi kilat & multimodal",
  },
  {
    id: "openai/gpt-4o",
    name: "OpenAI GPT-4o",
    provider: "OpenAI",
    tagline: "Penalaran cerdas & instruksi agen",
  },
  {
    id: "claude/claude-3-7-sonnet-20250219",
    name: "Claude 3.7 Sonnet",
    provider: "Anthropic",
    tagline: "Kreativitas & analisis kode mendalam",
  },
  {
    id: "deepseek/deepseek-r1",
    name: "DeepSeek R1",
    provider: "DeepSeek",
    tagline: "Model reasoning matematika & koding",
  },
  {
    id: "kimi/kimi-latest",
    name: "Kimi AI",
    provider: "Moonshot",
    tagline: "Konteks panjang & pemindaian dokumen",
  },
  {
    id: "qwen/qwen-2.5-coder-32b-instruct",
    name: "Qwen 2.5 Coder",
    provider: "Alibaba",
    tagline: "Spesialis arsitektur & sintaksis kode",
  },
  {
    id: "meta/llama-3.3-70b-instruct",
    name: "Llama 3.3 70B",
    provider: "Meta",
    tagline: "Open-weights reasoning terkemuka",
  },
];

export default function RoomsPage() {
  const [activeModelIndex, setActiveModelIndex] = useState(0);
  const activeRoom = ROOM_MODELS[activeModelIndex];

  const activeModelIndexRef = useRef(activeModelIndex);
  useEffect(() => {
    activeModelIndexRef.current = activeModelIndex;
  }, [activeModelIndex]);

  const activeModelItem: ModelItem = useMemo(() => {
    return (
      DEFAULT_MODELS.find((m) => m.id === activeRoom.id) || {
        id: activeRoom.id,
        provider: activeRoom.provider.toLowerCase() as ProviderType,
        display_name: activeRoom.name,
        capability_tags: ["fast"],
        context_length: 128000,
        is_free: true,
        status: "active",
      }
    );
  }, [activeRoom]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [roomSessions, setRoomSessions] = useState<Record<string, string>>({}); // modelId -> sessionId
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>();
  const [activeCodePreview, setActiveCodePreview] = useState<string | null>(null);

  const [userAvatar, setUserAvatar] = useState<string | undefined>();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previewClosedByUserRef = useRef(false);
  const supabase = useMemo(() => createClient(), []);

  // Request Native Browser & Phone Push Notification Permission
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().catch(() => {});
      }
    }
  }, []);

  // Sync total unread count to localStorage for global sidebar badge
  useEffect(() => {
    if (typeof window !== "undefined") {
      const total = Object.values(unreadCounts).reduce((a, b) => a + b, 0);
      localStorage.setItem("lucidchat_room_unreads_total", total.toString());
      window.dispatchEvent(new Event("storage"));
    }
  }, [unreadCounts]);

  // Filtered rooms
  const filteredRooms = ROOM_MODELS.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.provider.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load User & Room Sessions (Isolated from /chat global sessions)
  useEffect(() => {
    async function loadUserAndRooms() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const meta = user.user_metadata || {};
          setUserAvatar(meta.avatar_url || meta.picture);

          // Fetch only room chats starting with [Room AI]
          const { data: chatData } = await supabase
            .from("chats")
            .select("*")
            .eq("user_id", user.id)
            .like("title", "[Room AI]%");

          if (chatData) {
            const map: Record<string, string> = {};
            (chatData as ChatRow[]).forEach((c) => {
              if (c.model_used) map[c.model_used] = c.id;
            });
            setRoomSessions(map);
          }
        }
      } catch (err) {
        console.warn("Room auth check:", err);
      }
    }
    loadUserAndRooms();
  }, [supabase]);

  const loadRoomMessages = useCallback(async (sessionId: string) => {
    try {
      const { data: msgData } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", sessionId)
        .order("created_at", { ascending: true });

      if (msgData) {
        setMessages(
          msgData.map((m: { id: string; role: string; content: string }) => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            content: m.content,
            isStreaming: false,
          }))
        );
      }
    } catch (err) {
      console.warn("Failed to load room messages:", err);
    }
  }, [supabase]);

  // Handle switching rooms
  const handleSelectRoom = async (index: number) => {
    playClickSound();
    setActiveModelIndex(index);
    const targetRoom = ROOM_MODELS[index];

    // Clear unread badge for selected room
    setUnreadCounts((prev) => ({ ...prev, [targetRoom.id]: 0 }));

    setMessages([]);
    setIsLoading(false);
    setActiveCodePreview(null);
    previewClosedByUserRef.current = false;

    if (window.innerWidth < 768) setIsSidebarOpen(false);

    const existingSessionId = roomSessions[targetRoom.id];
    if (existingSessionId) {
      setCurrentSessionId(existingSessionId);
      loadRoomMessages(existingSessionId);
    } else {
      // Create new room session
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: newChat } = await supabase
            .from("chats")
            .insert({
              user_id: user.id,
              title: `[Room AI] ${targetRoom.name}`,
              model_used: targetRoom.id,
            })
            .select()
            .single();

          if (newChat) {
            setRoomSessions((prev) => ({ ...prev, [targetRoom.id]: newChat.id }));
            setCurrentSessionId(newChat.id);
          }
        }
      } catch (err) {
        console.warn("Failed to create room chat:", err);
      }
    }
  };

  // Load initial room messages when activeModelIndex or roomSessions changes
  useEffect(() => {
    const currentRoomId = ROOM_MODELS[activeModelIndex].id;
    if (roomSessions[currentRoomId] && currentSessionId !== roomSessions[currentRoomId]) {
      setCurrentSessionId(roomSessions[currentRoomId]);
      loadRoomMessages(roomSessions[currentRoomId]);
    }
  }, [activeModelIndex, roomSessions, currentSessionId, loadRoomMessages]);

  // Main Streaming Message Handler with Clean SSE Parsing & Push Notification
  const handleSendMessage = async (
    text: string,
    attachments?: AttachmentFile[],
    enableWebSearch?: boolean
  ) => {
    if (!text.trim() && (!attachments || attachments.length === 0)) return;

    const roomIndexAtStart = activeModelIndex;
    const targetRoom = ROOM_MODELS[roomIndexAtStart];
    let activeChatId = currentSessionId;

    // Create room session on first message if needed
    if (!activeChatId) {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: newChat } = await supabase
            .from("chats")
            .insert({
              user_id: user.id,
              title: `[Room AI] ${targetRoom.name}`,
              model_used: targetRoom.id,
            })
            .select()
            .single();

          if (newChat) {
            activeChatId = newChat.id;
            setCurrentSessionId(newChat.id);
            setRoomSessions((prev) => ({ ...prev, [targetRoom.id]: newChat.id }));
          }
        }
      } catch (err) {
        console.warn("Room creation error:", err);
      }
    }

    const userMsgId = Date.now().toString();
    const userMsg: Message = {
      id: userMsgId,
      role: "user",
      content: text,
      attachments,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (activeChatId && currentUser) {
      try {
        await supabase.from("messages").insert({
          chat_id: activeChatId,
          role: "user",
          content: text,
          has_code: text.includes("```"),
        });
      } catch (err) {
        console.warn("Save user msg error:", err);
      }
    }

    // Stream AI Assistant Response
    const assistantId = (Date.now() + 1).toString();
    const assistantMsg: Message = { id: assistantId, role: "assistant", content: "", isStreaming: true };
    setMessages((prev) => [...prev, assistantMsg]);

    let accumulatedContent = "";
    try {
      const apiMessages = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          model: activeModelItem.id,
          provider: activeModelItem.provider,
          enableWebSearch,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let lineBuffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunkStr = decoder.decode(value, { stream: true });
          lineBuffer += chunkStr;
          const lines = lineBuffer.split("\n");
          lineBuffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith("data: ")) {
              const dataStr = trimmed.replace("data: ", "").trim();
              if (dataStr === "[DONE]") break;

              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.delta) {
                  accumulatedContent += parsed.delta;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantId ? { ...m, content: accumulatedContent } : m
                    )
                  );
                }
              } catch {
                // Ignore partial JSON chunks
              }
            }
          }
        }
      }

      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, isStreaming: false } : m))
      );

      // Auto preview html code if detected
      if (!previewClosedByUserRef.current && accumulatedContent) {
        const clean = stripThinkTags(accumulatedContent);
        const match = clean.match(/```html([\s\S]*?)(?:```|$)/i);
        if (match && match[1].trim().length > 20) {
          playSuccessSound();
          setActiveCodePreview(match[1].trim());
        }
      }

      // Save assistant message to Supabase
      if (activeChatId && currentUser && accumulatedContent) {
        const finalClean = stripThinkTags(accumulatedContent);
        await supabase.from("messages").insert({
          chat_id: activeChatId,
          role: "assistant",
          content: finalClean,
          has_code: finalClean.includes("```"),
        });
      }

      playSuccessSound();

      // Check if user switched rooms or navigated away/hidden tab
      const isUserAway =
        (typeof document !== "undefined" && document.hidden) ||
        activeModelIndexRef.current !== roomIndexAtStart;

      if (isUserAway) {
        // Add WhatsApp-style unread badge
        setUnreadCounts((prev) => ({
          ...prev,
          [targetRoom.id]: (prev[targetRoom.id] || 0) + 1,
        }));

        // Send Native Push Notification to Device / Browser
        if (
          typeof window !== "undefined" &&
          "Notification" in window &&
          Notification.permission === "granted"
        ) {
          try {
            const notif = new Notification(`LucidChat - ${targetRoom.name}`, {
              body: accumulatedContent.slice(0, 100) + (accumulatedContent.length > 100 ? "..." : ""),
              icon: "/icon.png",
              tag: `room-${targetRoom.id}`,
            });
            notif.onclick = () => {
              window.focus();
            };
          } catch (e) {
            console.warn("Notification error:", e);
          }
        }
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Gagal mendapatkan respons AI";
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: `Error: ${errMsg}` }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearRoomHistory = async () => {
    if (!currentSessionId) return;
    setMessages([]);
    try {
      await supabase.from("messages").delete().eq("chat_id", currentSessionId);
    } catch (err) {
      console.warn("Clear room history error:", err);
    }
  };

  return (
    <div className="flex h-[100dvh] h-screen w-screen overflow-hidden bg-[#050508] text-white font-sans relative animate-entrance-page">
      {/* Ambient background blur */}
      <div className="bg-orbs" />
      <div className="orb-center" />

      {/* ═══ ROOMS SIDEBAR (WHATSAPP STYLE CONTACT LIST - NO GREEN LIVE DOTS) ═══ */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-80 p-4 sidebar-glass flex flex-col justify-between transition-transform duration-300 animate-entrance-sidebar ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col min-h-0 flex-1">
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2.5">
              <Link
                href="/chat"
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all"
                title="Kembali ke Chat Studio Global"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <h1 className="font-bold text-sm text-white tracking-tight">Model Rooms</h1>
                <p className="text-[10px] text-zinc-400">Ruang Obrolan Per AI</p>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* Search bar */}
          <div className="mt-3.5 relative shrink-0">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Room AI..."
              className="w-full pl-8 pr-3 py-2 rounded-full bg-white/[0.04] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/25 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Model Contact Rooms List (WhatsApp Style - No Green Live Dots, With Unread Badges) */}
          <div className="mt-4 overflow-y-auto flex-1 pr-1 space-y-2">
            <div className="text-[9px] font-semibold tracking-[0.2em] text-zinc-500 uppercase px-2 mb-2">
              Daftar Kontak Model AI
            </div>

            {filteredRooms.map((room) => {
              const originalIndex = ROOM_MODELS.findIndex((r) => r.id === room.id);
              const isActive = activeModelIndex === originalIndex;
              const unread = unreadCounts[room.id] || 0;

              return (
                <div
                  key={room.id}
                  onClick={() => handleSelectRoom(originalIndex)}
                  className={`group flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-300 border ${
                    isActive
                      ? "bg-gradient-to-r from-white/15 via-white/10 to-white/5 border-white/30 text-white shadow-[0_0_25px_rgba(255,255,255,0.1)] scale-[1.01]"
                      : "bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:bg-white/[0.06] hover:border-white/15 hover:text-white"
                  }`}
                >
                  {/* Model Avatar Icon (Clean, No Live Dot) */}
                  <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center p-2 shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                    <ModelLogo modelId={room.id} provider={room.provider} className="w-5 h-5" />
                  </div>

                  {/* Info */}
                  <div className="flex flex-col min-w-0 flex-1 text-left">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-white truncate text-xs">{room.name}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-zinc-400 shrink-0">
                        {room.provider}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-400 truncate mt-0.5">{room.tagline}</span>
                  </div>

                  {/* WhatsApp Style Unread Badge (1) */}
                  {unread > 0 && (
                    <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-black shadow-[0_0_12px_rgba(239,68,68,0.8)] border border-red-400/50 animate-bounce">
                      {unread}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Link back to Global Chat */}
        <div className="pt-3 border-t border-white/10 shrink-0">
          <Link
            href="/chat"
            className="w-full py-2.5 px-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center gap-2 text-xs font-semibold text-white transition-all shadow-sm"
          >
            <span>Buka Chat Studio Global</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </aside>

      {/* ═══ MAIN CHAT STAGE ═══ */}
      <div
        className={`flex-1 flex flex-col h-full w-full relative z-10 transition-all duration-300 ${
          isSidebarOpen ? "pl-0 md:pl-80" : "pl-0"
        }`}
      >
        {/* Room Header */}
        <header className="h-14 shrink-0 px-4 md:px-6 flex items-center justify-between border-b border-white/10 bg-[#08080e]/90 backdrop-blur-2xl z-30 animate-entrance-header">
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <button
                onClick={() => {
                  playClickSound();
                  setIsSidebarOpen(true);
                }}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white/80 hover:text-white transition-all"
                title="Buka Daftar Room"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            )}

            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center p-1.5 shrink-0">
              <ModelLogo modelId={activeRoom.id} provider={activeRoom.provider} className="w-4 h-4" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-tight">{activeRoom.name}</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-zinc-300 font-medium">
                  {activeRoom.provider}
                </span>
              </div>
              <p className="text-[10px] text-zinc-400">{activeRoom.tagline}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={handleClearRoomHistory}
                className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-xs text-zinc-300 hover:text-white transition-all flex items-center gap-1.5"
                title="Bersihkan Obrolan Room Ini"
              >
                <Trash2 className="w-3.5 h-3.5 text-zinc-400" />
                <span className="hidden sm:inline">Bersihkan</span>
              </button>
            )}
          </div>
        </header>

        {/* Messages Stream Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center p-4 shadow-[0_0_40px_rgba(255,255,255,0.15)] animate-pulse">
                  <ModelLogo modelId={activeRoom.id} provider={activeRoom.provider} className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Ruang Obrolan {activeRoom.name}</h3>
                  <p className="text-xs text-zinc-400 max-w-sm mt-1">
                    {activeRoom.tagline}. Mulai ketik pesan untuk berkonsultasi langsung dengan model AI ini.
                  </p>
                </div>
              </div>
            ) : (
              messages.map((m) => (
                <MessageBubble
                  key={m.id}
                  message={m}
                  userAvatar={userAvatar}
                  onOpenCodePreview={(code) => {
                    playClickSound();
                    setActiveCodePreview(code);
                    previewClosedByUserRef.current = false;
                  }}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 md:p-6 bg-[#08080e]/80 backdrop-blur-xl border-t border-white/10 shrink-0 animate-entrance-input">
          <div className="max-w-3xl mx-auto">
            <ChatInputBar
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              selectedModel={activeModelItem}
              onSelectModel={(m) => {
                const idx = ROOM_MODELS.findIndex((r) => r.id === m.id);
                if (idx !== -1) handleSelectRoom(idx);
              }}
            />
          </div>
        </div>
      </div>

      {/* Code Preview Artifact Overlay */}
      {activeCodePreview && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-2xl flex flex-col p-4 md:p-8 animate-fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
            <h3 className="font-bold text-sm text-white">Live Artifact Code Preview</h3>
            <button
              onClick={() => {
                playClickSound();
                setActiveCodePreview(null);
                previewClosedByUserRef.current = true;
              }}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <iframe
            srcDoc={activeCodePreview}
            className="w-full flex-1 rounded-2xl border border-white/20 bg-white"
            title="Artifact Live Preview"
            sandbox="allow-scripts allow-modals"
          />
        </div>
      )}
    </div>
  );
}
