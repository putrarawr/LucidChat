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
  X,
  Trash2,
  Bot,
  Sparkles,
} from "lucide-react";
import { playSuccessSound, playClickSound } from "@/lib/sound";
import { requestNotificationPermission, sendNativePushNotification } from "@/lib/notifications";
import { useI18n } from "@/lib/i18n/I18nContext";
import { FloatingLanguagePicker } from "@/components/ui/FloatingLanguagePicker";
import { VoiceCallModal } from "@/components/chat/VoiceCallModal";

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
    taglineKey: "rooms.geminiTagline",
    defaultTagline: "Lightning inference & multimodal",
  },
  {
    id: "openai/gpt-4o",
    name: "OpenAI GPT-4o",
    provider: "OpenAI",
    taglineKey: "rooms.gptTagline",
    defaultTagline: "Advanced reasoning & agent instructions",
  },
  {
    id: "claude/claude-3-7-sonnet-20250219",
    name: "Claude 3.7 Sonnet",
    provider: "Anthropic",
    taglineKey: "rooms.claudeTagline",
    defaultTagline: "Deep code analysis & creativity",
  },
  {
    id: "deepseek/deepseek-r1",
    name: "DeepSeek R1",
    provider: "DeepSeek",
    taglineKey: "rooms.deepseekTagline",
    defaultTagline: "Math reasoning & code logic",
  },
  {
    id: "kimi/kimi-latest",
    name: "Kimi AI",
    provider: "Moonshot",
    taglineKey: "rooms.kimiTagline",
    defaultTagline: "Long context & document scanner",
  },
  {
    id: "qwen/qwen-2.5-coder-32b-instruct",
    name: "Qwen 2.5 Coder",
    provider: "Alibaba",
    taglineKey: "rooms.qwenTagline",
    defaultTagline: "Code architecture & syntax specialist",
  },
  {
    id: "meta/llama-3.3-70b-instruct",
    name: "Llama 3.3 70B",
    provider: "Meta",
    taglineKey: "rooms.llamaTagline",
    defaultTagline: "Leading open-weights reasoning model",
  },
];

export default function RoomsPage() {
  const { t } = useI18n();
  // Default: NO AI room opened initially (activeModelIndex = null)
  const [activeModelIndex, setActiveModelIndex] = useState<number | null>(null);
  const activeRoom = activeModelIndex !== null ? ROOM_MODELS[activeModelIndex] : null;

  const activeModelIndexRef = useRef(activeModelIndex);
  useEffect(() => {
    activeModelIndexRef.current = activeModelIndex;
  }, [activeModelIndex]);

  const activeModelItem: ModelItem | null = useMemo(() => {
    if (!activeRoom) return null;
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
  const [userName, setUserName] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [roomPreviews, setRoomPreviews] = useState<Record<string, string>>({});
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);
  const [isHandsFreeMode, setIsHandsFreeMode] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const previewClosedByUserRef = useRef(false);
  const supabase = useMemo(() => createClient(), []);

  // Request Native Browser & Mobile Push Notification Permission
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Load unread counts from localStorage on mount so navigating /chat -> /rooms preserves unreads
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("lucidchat_room_unreads_map");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === "object") {
            setUnreadCounts(parsed);
          }
        }
      } catch (e) {
        console.warn("Failed to load unreads map:", e);
      }
    }
  }, []);

  // Sync total & map unread counts to localStorage for global sidebar badge & persistence
  useEffect(() => {
    if (typeof window !== "undefined") {
      const total = Object.values(unreadCounts).reduce((a, b) => a + b, 0);
      localStorage.setItem("lucidchat_room_unreads_total", total.toString());
      localStorage.setItem("lucidchat_room_unreads_map", JSON.stringify(unreadCounts));
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
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
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

          if (chatData && chatData.length > 0) {
            const map: Record<string, string> = {};
            const chatIds: string[] = [];
            (chatData as ChatRow[]).forEach((c) => {
              if (c.model_used) {
                map[c.model_used] = c.id;
                chatIds.push(c.id);
              }
            });
            setRoomSessions(map);

            // Fetch latest messages for each room to display as spoiler response previews
            try {
              const { data: latestMsgs } = await supabase
                .from("messages")
                .select("chat_id, role, content, created_at")
                .in("chat_id", chatIds)
                .order("created_at", { ascending: false });

              if (latestMsgs) {
                const prevs: Record<string, string> = {};
                (chatData as ChatRow[]).forEach((c) => {
                  const msg = latestMsgs.find((m) => m.chat_id === c.id);
                  if (msg && msg.content) {
                    prevs[c.model_used] = stripThinkTags(msg.content).trim();
                  }
                });
                setRoomPreviews(prevs);
              }
            } catch (err) {
              console.warn("Failed to fetch room previews:", err);
            }
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
    if (activeModelIndex === null) return;
    const currentRoomId = ROOM_MODELS[activeModelIndex].id;
    if (roomSessions[currentRoomId] && currentSessionId !== roomSessions[currentRoomId]) {
      setCurrentSessionId(roomSessions[currentRoomId]);
      loadRoomMessages(roomSessions[currentRoomId]);
    }
  }, [activeModelIndex, roomSessions, currentSessionId, loadRoomMessages]);

  // Main Streaming Message Handler with Clean SSE Parsing & Native Push Notification
  const handleSendMessage = async (
    text: string,
    attachments?: AttachmentFile[],
    enableWebSearch?: boolean
  ) => {
    if (activeModelIndex === null || !activeRoom || !activeModelItem) return;
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
                  const currentClean = stripThinkTags(accumulatedContent).trim();
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantId ? { ...m, content: accumulatedContent } : m
                    )
                  );
                  if (currentClean) {
                    setRoomPreviews((prev) => ({
                      ...prev,
                      [targetRoom.id]: currentClean,
                    }));
                  }
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

      // Save assistant message to Supabase & update room preview spoiler
      if (activeChatId && currentUser && accumulatedContent) {
        const finalClean = stripThinkTags(accumulatedContent);
        setRoomPreviews((prev) => ({
          ...prev,
          [targetRoom.id]: finalClean.trim(),
        }));
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

        // Send Native Push Notification to Device (Android/iOS SW or Desktop)
        sendNativePushNotification(
          `LucidChat - ${targetRoom.name}`,
          accumulatedContent,
          "/logo.png"
        );
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
    if (!activeRoom || !currentSessionId) return;
    playClickSound();
    try {
      await supabase.from("messages").delete().eq("chat_id", currentSessionId);
      await supabase.from("chats").delete().eq("id", currentSessionId);

      setMessages([]);
      setRoomSessions((prev) => {
        const next = { ...prev };
        delete next[activeRoom.id];
        return next;
      });
      setRoomPreviews((prev) => {
        const next = { ...prev };
        delete next[activeRoom.id];
        return next;
      });
      setCurrentSessionId(undefined);
    } catch (err) {
      console.warn("Failed to clear room history:", err);
    }
  };

  return (
    <div className="flex h-[100dvh] w-full bg-[#08080c] text-white overflow-hidden relative font-sans">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Glass Split Panel */}
      <div className="relative z-10 flex w-full h-full p-2 sm:p-4 md:p-6 gap-3 md:gap-4 max-w-[1600px] mx-auto">
        {/* Left Side: Model Contacts Sidebar (Visible on desktop or when no active room selected on mobile) */}
        <div
          className={`flex flex-col bg-[#111118]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 transition-all duration-300 ${
            activeRoom ? "hidden md:flex md:w-80 lg:w-96" : "w-full md:w-80 lg:w-96"
          } shrink-0`}
        >
          {/* Top Bar Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <Link
                href="/chat"
                className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/80 hover:text-white transition-all"
                title={t("rooms.openGlobalChat", "Open Global Chat Studio")}
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <h1 className="text-sm font-bold text-white tracking-tight">{t("rooms.title", "AI Model Rooms")}</h1>
                <p className="text-[10px] text-zinc-400">{t("rooms.subtitle", "Dedicated Per-AI Chat Hub")}</p>
              </div>
            </div>

            {/* Floating Multi-Language Picker */}
            <FloatingLanguagePicker variant="floating" />
          </div>

          {/* Search Contacts Bar */}
          <div className="mt-3 relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("rooms.searchPlaceholder", "Search AI Room...")}
              className="w-full pl-9 pr-8 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/20 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Model Contact Rooms List */}
          <div className="mt-4 overflow-y-auto flex-1 pr-1 space-y-2">
            <div className="text-[9px] font-semibold tracking-[0.2em] text-zinc-500 uppercase px-2 mb-2">
              {t("rooms.contactListTitle", "AI MODEL CONTACT LIST")}
            </div>

            {filteredRooms.map((room) => {
              const originalIndex = ROOM_MODELS.findIndex((r) => r.id === room.id);
              const isActive = activeModelIndex === originalIndex;
              const unread = unreadCounts[room.id] || 0;
              const taglineText = t(room.taglineKey, room.defaultTagline);

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
                  {/* Model Avatar Icon */}
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
                    <span
                      className="text-[10px] text-zinc-400 truncate mt-0.5"
                      title={roomPreviews[room.id] || taglineText}
                    >
                      {roomPreviews[room.id] ? roomPreviews[room.id] : taglineText}
                    </span>
                  </div>

                  {/* Unread Badge */}
                  {unread > 0 && (
                    <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold shadow-md border border-red-400/50">
                      {unread}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Active Chat Room Window */}
        <div
          className={`flex-1 flex-col bg-[#111118]/80 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden transition-all duration-300 relative ${
            !activeRoom ? "hidden md:flex" : "flex"
          }`}
        >
          {!activeRoom ? (
            /* Empty State: Select a Room */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 my-auto">
              <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 shadow-2xl">
                <Bot className="w-8 h-8 text-white/70" />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h2 className="text-xl font-bold text-white">{t("rooms.welcomeTitle", "AI Model Rooms Studio")}</h2>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {t("rooms.welcomeDesc", "Select an AI model contact from the list on the left to start an isolated conversation session without mixing your global chat history.")}
                </p>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-zinc-400">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{t("rooms.welcomeBadge", "Isolated & Real-Time Notifications")}</span>
              </div>
            </div>
          ) : (
            /* Active Room View */
            activeRoom && (
              <>
                {/* Room Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    {/* Back Button on Mobile */}
                    <button
                      onClick={() => {
                        playClickSound();
                        setActiveModelIndex(null);
                      }}
                      className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:text-white"
                      title={t("rooms.backToRooms", "Back to AI Rooms List")}
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>

                    <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center p-1.5 shrink-0">
                      <ModelLogo modelId={activeRoom.id} provider={activeRoom.provider} className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-white leading-tight">{activeRoom.name}</h2>
                      <p className="text-[10px] text-zinc-400">{activeRoom.provider} Engine</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Floating Language Picker */}
                    <FloatingLanguagePicker variant="floating" />

                    {/* Clear Room History Button */}
                    <button
                      onClick={() => setIsConfirmClearOpen(true)}
                      className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-red-500/20 hover:border-red-500/30 text-zinc-400 hover:text-red-400 transition-all duration-200"
                      title={t("rooms.clearRoom", "Clear This Room Chat")}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Messages Stream Container */}
                <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                  <div className="max-w-3xl mx-auto space-y-3 min-h-full flex flex-col justify-end">
                    {messages.length === 0 ? (
                      <div className="my-auto py-12 flex flex-col items-center justify-center text-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                          <ModelLogo modelId={activeRoom.id} provider={activeRoom.provider} className="w-6 h-6 opacity-80" />
                        </div>
                        <h3 className="text-base font-bold text-white">{t("rooms.welcomeGreeting", "Hello! How can I help you today?")}</h3>
                        <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
                          {t("rooms.roomChatDesc", "Start typing messages to consult directly with this AI model.")}
                        </p>
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

                {/* Floating Chat Input Bar */}
                <div className="p-3 md:p-4 w-full max-w-3xl mx-auto shrink-0 animate-entrance-input pb-[calc(0.75rem+env(safe-area-inset-bottom))] bg-transparent border-t-0">
                  {activeModelItem && (
                    <ChatInputBar
                      onSendMessage={handleSendMessage}
                      isLoading={isLoading}
                      selectedModel={activeModelItem}
                      hideModelSelector={true}
                      isHandsFreeMode={isHandsFreeMode}
                      onToggleHandsFreeMode={() => setIsHandsFreeMode((prev) => !prev)}
                    />
                  )}
                </div>
              </>
            )
          )}
        </div>
      </div>

      {/* Clear Room History Confirmation Glass Alert Modal */}
      {isConfirmClearOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-white/20 bg-[#0e0e14]/95 p-6 shadow-[0_0_80px_rgba(0,0,0,0.9)] space-y-4 relative z-[100000]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">{t("rooms.clearRoomTitle", "Clear Chat?")}</h3>
                <p className="text-xs text-zinc-400">{activeRoom?.name}</p>
              </div>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              {t("rooms.confirmClearDesc", "Are you sure you want to clear all chat history in this room? This action cannot be undone.")}
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmClearOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all"
              >
                {t("sidebar.cancel", "Cancel")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsConfirmClearOpen(false);
                  handleClearRoomHistory();
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-500 hover:bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] border border-red-400/40 transition-all"
              >
                {t("rooms.confirmClearBtn", "Yes, Clear")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hands-Free Voice Call Modal */}
      {activeModelItem && (
        <VoiceCallModal
          isOpen={isHandsFreeMode}
          onClose={() => setIsHandsFreeMode(false)}
          selectedModel={activeModelItem}
          userName={userName}
          onSendMessage={(spokenText) => handleSendMessage(spokenText)}
          isLoading={isLoading}
          lastAiMessage={messages.filter((m) => m.role === "assistant").slice(-1)[0]?.content || ""}
        />
      )}

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
