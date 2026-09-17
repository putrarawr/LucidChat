"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_MODELS, ModelItem } from "@/lib/model-types";
import { MessageBubble, Message, stripThinkTags } from "@/components/chat/MessageBubble";
import { ChatInputBar, AttachmentFile } from "@/components/chat/ChatInputBar";
import { SessionList, SessionItem } from "@/components/sidebar/SessionList";
import { CodePreviewTabs } from "@/components/artifact/CodePreviewTabs";
import { LucidMode } from "@/lib/lucid-modes";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { VoiceCallModal } from "@/components/chat/VoiceCallModal";
import { X, PanelLeftOpen, Check } from "lucide-react";
import { playSuccessSound, playClickSound } from "@/lib/sound";
import { requestNotificationPermission, sendNativePushNotification } from "@/lib/notifications";
import { useI18n } from "@/lib/i18n/I18nContext";

interface ChatRow {
  id: string;
  user_id: string;
  title: string;
  model_used: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

function generateSmartTitle(prompt: string): string {
  const p = prompt.toLowerCase();
  
  if (p.includes("jailbreak") || p.includes("system instruction") || p.includes("override") || p.includes("bypass") || p.includes("hack") || p.includes("sapa halo")) {
    return "Percobaan Security & Jailbreak";
  }
  if (p.includes("html") || p.includes("css") || p.includes("js") || p.includes("website") || p.includes("landing page") || p.includes("component") || p.includes("porto")) {
    return "Pembuatan Web & Komponen HTML";
  }
  if (p.includes("python") || p.includes("script") || p.includes("code") || p.includes("fungsi") || p.includes("debug") || p.includes("bug")) {
    return "Analisis Kode & Pemrograman";
  }
  if (p.includes("model") || p.includes("api") || p.includes("list model") || p.includes("fitur")) {
    return "Tanya Jawab Model AI & API";
  }
  if (p.includes("gambar") || p.includes("foto") || p.includes("image") || p.includes("lampiran")) {
    return "Analisis Visual & Dokumen";
  }
  if (p.includes("halo") || p.includes("hai") || p.includes("pagi") || p.includes("siang") || p.includes("apa kabar")) {
    return "Percakapan Santai";
  }

  const words = prompt.trim().split(/\s+/).slice(0, 5).join(" ");
  const cleanTitle = words.length > 35 ? words.slice(0, 32) + "..." : words;
  return cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
}

export default function ChatPage() {
  const { lang, setLang, t } = useI18n();
  const params = useParams();
  const urlChatId = params?.chatId as string | undefined;

  const [selectedModel, setSelectedModel] = useState<ModelItem>(DEFAULT_MODELS[0]);
  const [selectedLucidMode, setSelectedLucidMode] = useState<LucidMode | null>(null);

  // Arena Mode (Side-by-Side Model Comparison)
  const [isArenaMode, setIsArenaMode] = useState(false);
  const [arenaModelB, setArenaModelB] = useState<ModelItem>(
    DEFAULT_MODELS.find((m) => m.id !== DEFAULT_MODELS[0].id) || DEFAULT_MODELS[1]
  );
  const [arenaMessages, setArenaMessages] = useState<Message[]>([]);
  const [arenaMobileTab, setArenaMobileTab] = useState<"a" | "b" | "both">("both");

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>();
  const [activeCodePreview, setActiveCodePreview] = useState<string | null>(null);

  const [userEmail, setUserEmail] = useState<string | undefined>();
  const [userName, setUserName] = useState<string | undefined>();
  const [userAvatar, setUserAvatar] = useState<string | undefined>();
  const [customSystemPrompt, setCustomSystemPrompt] = useState<string | undefined>();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isHandsFreeMode, setIsHandsFreeMode] = useState(false);

  // Resizable split panel states
  const [previewWidth, setPreviewWidth] = useState(50);
  const [isPreviewMaximized, setIsPreviewMaximized] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const previewClosedByUserRef = useRef(false);
  const lastPreviewUpdateRef = useRef(0);
  const supabase = useMemo(() => createClient(), []);

  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport on mount and handle resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleClosePreview = () => {
    playClickSound();
    previewClosedByUserRef.current = true;
    setActiveCodePreview(null);
    setIsPreviewMaximized(false);
  };

  // Mouse drag handler for split panel resizing
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const totalWidth = rect.width;
      const newPreviewWidth = ((totalWidth - relativeX) / totalWidth) * 100;
      const clampedWidth = Math.min(Math.max(newPreviewWidth, 20), 80);
      setPreviewWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load User & Sessions
  useEffect(() => {
    async function loadData() {
      try {
        // 1. Check local storage overrides first to prevent hard refresh resets
        if (typeof window !== "undefined") {
          const localName = localStorage.getItem("lucidchat_user_name");
          const localAvatar = localStorage.getItem("lucidchat_user_avatar");
          const localPrompt = localStorage.getItem("lucidchat_custom_system_prompt");

          if (localName && localName.trim()) setUserName(localName.trim());
          if (localAvatar && localAvatar.trim()) setUserAvatar(localAvatar.trim());
          if (localPrompt && localPrompt.trim()) setCustomSystemPrompt(localPrompt.trim());
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserEmail(user.email);
          const meta = user.user_metadata || {};
          const name = meta.full_name || meta.name || meta.custom_claims?.global_name;

          // Only set fallback from auth if not already present in localStorage
          const hasLocalName = typeof window !== "undefined" && !!localStorage.getItem("lucidchat_user_name");
          if (!hasLocalName) {
            if (name) {
              setUserName(name);
            } else if (user.email) {
              const rawName = user.email.split("@")[0];
              setUserName(rawName.charAt(0).toUpperCase() + rawName.slice(1));
            }
          }

          const hasLocalAvatar = typeof window !== "undefined" && !!localStorage.getItem("lucidchat_user_avatar");
          if (!hasLocalAvatar && (meta.avatar_url || meta.picture)) {
            setUserAvatar(meta.avatar_url || meta.picture);
          }

          const { data: chatData } = await supabase
            .from("chats")
            .select("*")
            .eq("user_id", user.id)
            .order("updated_at", { ascending: false });

          if (chatData) {
            const typedChatData = chatData as ChatRow[];
            setSessions(
              typedChatData.map((c: ChatRow) => ({
                id: c.id,
                title: c.title,
                updatedAt: c.updated_at,
              }))
            );
          }
        }
      } catch (err) {
        console.warn("Auth check skip or offline mode:", err);
      }
    }
    loadData();
  }, [supabase]);

  // Tab Title Cycling
  useEffect(() => {
    let activeTitle = "Multi-Model AI";
    if (currentSessionId) {
      const activeSession = sessions.find((s) => s.id === currentSessionId);
      if (activeSession && activeSession.title) {
        activeTitle = activeSession.title.replace(/—/g, "").trim();
      }
    }

    let isSessionTitle = true;
    document.title = activeTitle;

    const interval = setInterval(() => {
      isSessionTitle = !isSessionTitle;
      document.title = isSessionTitle ? activeTitle : "LucidChat";
    }, 3000);

    return () => clearInterval(interval);
  }, [currentSessionId, sessions]);

  // Session Selection
  const handleSelectSession = async (sessionId: string) => {
    setCurrentSessionId(sessionId);
    previewClosedByUserRef.current = false;
    setActiveCodePreview(null);
    setIsLoading(false);
    setArenaMessages([]);
    if (typeof window !== "undefined") {
      if (window.innerWidth < 768) setIsSidebarOpen(false);
      if (window.location.pathname !== `/chat/${sessionId}`) {
        window.history.pushState(null, "", `/chat/${sessionId}`);
      }
    }
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
      console.warn("Failed to load session messages:", err);
    }
  };

  // Automatically load session if urlChatId parameter changes or page opens via /chat/[chatId]
  useEffect(() => {
    if (urlChatId && urlChatId !== currentSessionId) {
      handleSelectSession(urlChatId);
    }
  }, [urlChatId]);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const handleNewChat = () => {
    setMessages([]);
    setArenaMessages([]);
    setCurrentSessionId(undefined);
    previewClosedByUserRef.current = false;
    setActiveCodePreview(null);
    if (typeof window !== "undefined") {
      if (window.innerWidth < 768) setIsSidebarOpen(false);
      if (window.location.pathname !== "/chat") {
        window.history.pushState(null, "", "/chat");
      }
    }
  };

  const handleDeleteSession = async (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (currentSessionId === id) handleNewChat();
    setArenaMessages([]);
    try {
      await supabase.from("chats").delete().eq("id", id);
    } catch (err) {
      console.warn("Failed to delete chat:", err);
    }
  };

  const handlePinSession = (id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isPinned: !s.isPinned } : s))
    );
  };

  const handleRenameSession = async (id: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle } : s))
    );
    try {
      await supabase.from("chats").update({ title: newTitle }).eq("id", id);
    } catch (err) {
      console.warn("Failed to rename chat:", err);
    }
  };

  const handleExportSession = (id: string) => {
    const session = sessions.find((s) => s.id === id);
    const title = session ? session.title : "LucidChat_Export";

    let mdContent = `# ${title}\n\n*Exported from LucidChat on ${new Date().toLocaleString()}*\n\n---\n\n`;
    messages.forEach((m) => {
      const sender = m.role === "user" ? "User" : "LucidChat AI";
      mdContent += `### ${sender}:\n${m.content}\n\n---\n\n`;
    });

    const blob = new Blob([mdContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Sign out err:", err);
    }
    window.location.href = "/login";
  };

  // Main Streaming AI Logic
  const handleSendMessage = async (text: string, attachments?: AttachmentFile[], enableWebSearch?: boolean) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      attachments,
    };

    previewClosedByUserRef.current = false;
    lastPreviewUpdateRef.current = 0;

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    let activeChatId = currentSessionId;
    let currentUser = null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      currentUser = user;

      if (!activeChatId) {
        const titleText = generateSmartTitle(text);
        if (user) {
          const { data: newChat, error: insertErr } = await supabase
            .from("chats")
            .insert({
              user_id: user.id,
              title: titleText,
              model_used: selectedModel.id,
            })
            .select()
            .single();

          if (newChat) {
            activeChatId = newChat.id;
          } else {
            console.warn("Chat DB insert warning:", insertErr);
            activeChatId = `chat_${Date.now()}`;
          }
        } else {
          activeChatId = `chat_${Date.now()}`;
        }

        const finalSessionId = activeChatId || `chat_${Date.now()}`;
        activeChatId = finalSessionId;
        setCurrentSessionId(finalSessionId);
        if (typeof window !== "undefined" && window.location.pathname !== `/chat/${finalSessionId}`) {
          window.history.pushState(null, "", `/chat/${finalSessionId}`);
        }
        const newSession: SessionItem = {
          id: finalSessionId,
          title: titleText,
          updatedAt: new Date().toISOString(),
        };
        setSessions((prev) => [newSession, ...prev.filter((s) => s.id !== finalSessionId)]);
      }

      if (activeChatId && user) {
        await supabase.from("messages").insert({
          chat_id: activeChatId,
          role: "user",
          content: text,
          has_code: text.includes("```"),
        });
      }
    } catch (err) {
      console.warn("Failed to save user chat/message to DB:", err);
    }

    const fetchStreamForModel = async (
      model: ModelItem,
      setter: React.Dispatch<React.SetStateAction<Message[]>>,
      msgId: string
    ) => {
      const startTime = performance.now();
      let ttftMs: number | undefined = undefined;
      let accumulatedContent = "";

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
            modelId: model.id,
            provider: model.provider,
            lucidMode: selectedLucidMode ? selectedLucidMode.id : "single-model",
            customSystemPrompt: [selectedLucidMode?.systemPrompt, customSystemPrompt].filter(Boolean).join("\n\n"),
            attachments,
            enableWebSearch: enableWebSearch || (selectedLucidMode?.forceWebSearch ?? false),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP error ${response.status}`);
        }

        if (!response.body) return "";
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let realTokensFromApi: number | undefined = undefined;

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunkStr = decoder.decode(value);
          const lines = chunkStr.split("\n\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataStr = line.replace("data: ", "").trim();
              if (dataStr === "[DONE]") break;

              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.delta !== undefined || parsed.usage) {
                  if (ttftMs === undefined && parsed.delta) {
                    ttftMs = Math.round(performance.now() - startTime);
                  }

                  if (parsed.delta) {
                    accumulatedContent += parsed.delta;
                    setter((prev) =>
                      prev.map((msg) =>
                        msg.id === msgId ? { ...msg, content: accumulatedContent } : msg
                      )
                    );
                  }

                  if (parsed.usage && parsed.usage.completionTokens) {
                    realTokensFromApi = parsed.usage.completionTokens;
                  }
                }
              } catch {
                // Ignore non-JSON
              }
            }
          }
        }

        // Calculate final tokens and performance metrics ONLY AFTER full generation completes
        const totalElapsedMs = performance.now() - startTime;
        const finalTokens = realTokensFromApi ?? Math.max(1, Math.round(accumulatedContent.length / 3.7));
        const elapsedSec = Math.max(0.1, totalElapsedMs / 1000);
        const tps = Math.round(finalTokens / elapsedSec);

        setter((prev) =>
          prev.map((msg) =>
            msg.id === msgId
              ? {
                  ...msg,
                  content: accumulatedContent,
                  isStreaming: false,
                  stats: {
                    ttftMs: ttftMs ?? Math.round(totalElapsedMs),
                    totalTokens: finalTokens,
                    tokensPerSec: tps,
                    provider: model.provider,
                    modelName: model.display_name,
                  },
                }
              : msg
          )
        );

        return accumulatedContent;
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Gagal mendapatkan respons AI";
        setter((prev) =>
          prev.map((msg) =>
            msg.id === msgId
              ? { ...msg, content: `Error: ${errorMessage}` }
              : msg
          )
        );
        return "";
      } finally {
        setter((prev) =>
          prev.map((msg) => (msg.id === msgId ? { ...msg, isStreaming: false } : msg))
        );
      }
    };

    let accumulatedContent = "";
    if (isArenaMode) {
      const assistantIdA = (Date.now() + 1).toString();
      const assistantIdB = (Date.now() + 2).toString();

      const assistantMsgA: Message = { id: assistantIdA, role: "assistant", content: "", isStreaming: true };
      const assistantMsgB: Message = { id: assistantIdB, role: "assistant", content: "", isStreaming: true };

      setMessages((prev) => [...prev, assistantMsgA]);
      setArenaMessages((prev) => {
        const hasUserMsg = prev.some((m) => m.id === userMsg.id);
        return hasUserMsg ? [...prev, assistantMsgB] : [...prev, userMsg, assistantMsgB];
      });

      const [resA, resB] = await Promise.all([
        fetchStreamForModel(selectedModel, setMessages, assistantIdA),
        fetchStreamForModel(arenaModelB, setArenaMessages, assistantIdB),
      ]);
      
      const resAHasHtml = resA && (resA.includes("```html") || resA.includes("```xml"));
      const resBHasHtml = resB && (resB.includes("```html") || resB.includes("```xml"));
      accumulatedContent = resAHasHtml ? resA : resBHasHtml ? resB : resA || resB;
    } else {
      const assistantId = (Date.now() + 1).toString();
      const assistantMsg: Message = { id: assistantId, role: "assistant", content: "", isStreaming: true };
      setMessages((prev) => [...prev, assistantMsg]);

      accumulatedContent = await fetchStreamForModel(selectedModel, setMessages, assistantId);
    }

    try {
      // Automatically open Live Preview in landscape mode ONLY AFTER code generation finishes 100%
      if (!previewClosedByUserRef.current && accumulatedContent) {
        const cleanText = stripThinkTags(accumulatedContent);
        const htmlMatch = cleanText.match(/```html([\s\S]*?)(?:```|$)/i) || cleanText.match(/```xml([\s\S]*?)(?:```|$)/i);
        if (htmlMatch) {
          const extractedCode = htmlMatch[1].trim();
          if (extractedCode.includes("<") && extractedCode.length > 20 && !extractedCode.includes("**Draft Code")) {
            playSuccessSound();
            setActiveCodePreview(extractedCode);
          }
        }
      }

      const finalCleanContent = stripThinkTags(accumulatedContent);
      if (activeChatId && currentUser && finalCleanContent) {
        await supabase.from("messages").insert({
          chat_id: activeChatId,
          role: "assistant",
          content: finalCleanContent,
          has_code: finalCleanContent.includes("```"),
        });
        await supabase.from("chats").update({ updated_at: new Date().toISOString() }).eq("id", activeChatId);
      }

      playSuccessSound();

      if (typeof document !== "undefined" && document.hidden) {
        sendNativePushNotification(
          `LucidChat - ${selectedModel.display_name}`,
          finalCleanContent || accumulatedContent,
          "/logo.png"
        );
      }
    } catch (err: unknown) {
      console.warn("Save assistant message error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditMessage = (id: string, newText: string) => {
    const msgIndex = messages.findIndex((m) => m.id === id);
    if (msgIndex === -1) return;
    const truncatedMessages = messages.slice(0, msgIndex);
    setMessages(truncatedMessages);
    handleSendMessage(newText);
  };

  const handleRegenerateResponse = (assistantMessageId: string) => {
    const assistantIndex = messages.findIndex((m) => m.id === assistantMessageId);
    if (assistantIndex <= 0) return;
    const lastUserMsg = messages[assistantIndex - 1];
    if (lastUserMsg && lastUserMsg.role === "user") {
      const truncatedMessages = messages.slice(0, assistantIndex);
      setMessages(truncatedMessages);
      handleSendMessage(lastUserMsg.content, lastUserMsg.attachments);
    }
  };

  return (
    <div className="flex h-[100dvh] h-screen w-screen overflow-hidden bg-[var(--surface-0)] animate-entrance-page">
      {/* Animated Background Orbs */}
      <div className="bg-orbs" />
      <div className="orb-center" />

      {/* Sidebar Navigation */}
      <div className="animate-entrance-sidebar z-50 relative">
        <SessionList
          sessions={sessions}
          currentSessionId={currentSessionId}
          selectedModelId={selectedModel.id}
          isOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onSelectSession={handleSelectSession}
          onNewChat={handleNewChat}
          onDeleteSession={handleDeleteSession}
          onPinSession={handlePinSession}
          onRenameSession={handleRenameSession}
          onExportSession={handleExportSession}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onLogout={handleLogout}
          userEmail={userEmail}
          userName={userName}
          userAvatar={userAvatar}
        />
      </div>

      {/* Main Container Area */}
      <div
        ref={containerRef}
        className={`flex-1 flex overflow-hidden transition-all duration-300 ${
          isSidebarOpen ? "pl-0 md:pl-72" : "pl-0"
        } ${isResizing ? "select-none cursor-col-resize" : ""}`}
      >
        {/* Chat Stream Panel */}
        <div
          style={{
            width: isMobile
              ? "100%"
              : activeCodePreview
              ? isPreviewMaximized
                ? "0%"
                : `${100 - previewWidth}%`
              : "100%",
            display: !isMobile && activeCodePreview && isPreviewMaximized ? "none" : "flex",
          }}
          className="flex flex-col h-full w-full relative z-10 transition-[width] duration-75 overflow-hidden"
        >
          {/* Minimal Clean Header Bar */}
          <header className="h-12 shrink-0 px-4 md:px-6 flex items-center justify-between border-b border-white/[0.05] bg-[#0c0c12]/90 backdrop-blur-2xl animate-entrance-header z-30">
            <div className="flex items-center gap-2.5">
              {/* Sidebar Open Button (Shown only when sidebar is closed) */}
              {!isSidebarOpen && (
                <button
                  onClick={() => {
                    playClickSound();
                    setIsSidebarOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.12] hover:border-white/[0.18] text-white/70 hover:text-white transition-all shadow-sm"
                  title="Buka Sidebar"
                >
                  <PanelLeftOpen className="w-3.5 h-3.5 text-white/70" />
                  <span className="text-[11px] font-medium text-white/80">Menu</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Glassmorphic Language Slider Switch Toggle */}
              <div className="flex items-center p-0.5 rounded-full bg-white/[0.06] border border-white/10 text-[10px] sm:text-[11px] font-semibold select-none relative shadow-inner">
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setLang("id");
                  }}
                  className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full transition-all duration-300 flex items-center gap-1 cursor-pointer z-10 ${
                    lang === "id"
                      ? "bg-white/20 text-white shadow-[0_0_12px_rgba(255,255,255,0.2)] font-bold scale-[1.03]"
                      : "text-white/40 hover:text-white/70"
                  }`}
                  title="Bahasa Indonesia"
                >
                  <span>🇮🇩 ID</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setLang("en");
                  }}
                  className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full transition-all duration-300 flex items-center gap-1 cursor-pointer z-10 ${
                    lang === "en"
                      ? "bg-white/20 text-white shadow-[0_0_12px_rgba(255,255,255,0.2)] font-bold scale-[1.03]"
                      : "text-white/40 hover:text-white/70"
                  }`}
                  title="English"
                >
                  <span>🇬🇧 EN</span>
                </button>
              </div>

              {activeCodePreview && (
                <button
                  onClick={handleClosePreview}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.10] hover:border-white/[0.15] text-[11px] text-white/50 hover:text-white/80 transition-all duration-200"
                >
                  <X className="w-3 h-3" />
                  Tutup Preview
                </button>
              )}
            </div>
          </header>

          {/* Messages Stream Container */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className={`${isArenaMode ? "max-w-6xl" : "max-w-3xl"} w-full mx-auto space-y-2 h-full`}>
              {isArenaMode ? (
                <div className="space-y-3 w-full min-w-0">
                  {/* Mobile Viewport Arena Tab Switcher (Visible on small screens) */}
                  <div className="flex md:hidden items-center justify-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] select-none">
                    <button
                      onClick={() => setArenaMobileTab("a")}
                      className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                        arenaMobileTab === "a" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm" : "text-white/50 hover:text-white"
                      }`}
                    >
                      Model A ({selectedModel.display_name.split(" ")[0]})
                    </button>
                    <button
                      onClick={() => setArenaMobileTab("b")}
                      className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                        arenaMobileTab === "b" ? "bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-sm" : "text-white/50 hover:text-white"
                      }`}
                    >
                      Model B ({arenaModelB.display_name.split(" ")[0]})
                    </button>
                    <button
                      onClick={() => setArenaMobileTab("both")}
                      className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                        arenaMobileTab === "both" ? "bg-white/15 text-white border border-white/20 shadow-sm" : "text-white/50 hover:text-white"
                      }`}
                    >
                      Semua
                    </button>
                  </div>

                  <div className={`grid gap-4 min-h-[450px] w-full min-w-0 ${activeCodePreview ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
                    {/* Model A Panel */}
                    <div className={`flex flex-col bg-white/[0.02] border border-white/[0.06] rounded-2xl p-3 space-y-2 min-w-0 w-full overflow-hidden ${
                      arenaMobileTab === "b" ? "hidden md:flex" : "flex"
                    }`}>
                      <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] text-xs font-bold text-amber-400 shrink-0">
                        <span>Model A: {selectedModel.display_name}</span>
                        <span className="text-[10px] font-mono text-white/40 uppercase">{selectedModel.provider}</span>
                      </div>
                      <div className="space-y-2 flex-1 overflow-y-auto min-w-0 w-full overflow-x-hidden pr-1">
                        {messages.map((m) => (
                          <MessageBubble
                            key={m.id}
                            message={m}
                            userAvatar={userAvatar}
                            onOpenCodePreview={(code) => {
                              previewClosedByUserRef.current = false;
                              setActiveCodePreview(code);
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Model B Panel */}
                    <div className={`flex flex-col bg-white/[0.02] border border-white/[0.06] rounded-2xl p-3 space-y-2 min-w-0 w-full overflow-hidden ${
                      arenaMobileTab === "a" ? "hidden md:flex" : "flex"
                    }`}>
                      <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] text-xs font-bold text-blue-400 shrink-0">
                        <span>Model B: {arenaModelB.display_name}</span>
                        <select
                          value={arenaModelB.id}
                          onChange={(e) => {
                            const m = DEFAULT_MODELS.find((mod) => mod.id === e.target.value);
                            if (m) setArenaModelB(m);
                          }}
                          className="bg-black/60 border border-white/15 rounded-lg text-[10px] text-white px-2 py-1 outline-none"
                        >
                          {DEFAULT_MODELS.map((m) => (
                            <option key={m.id} value={m.id} className="bg-neutral-900 text-white">
                              {m.display_name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2 flex-1 overflow-y-auto min-w-0 w-full overflow-x-hidden pr-1">
                        {arenaMessages.map((m) => (
                          <MessageBubble
                            key={m.id}
                            message={m}
                            userAvatar={userAvatar}
                            onOpenCodePreview={(code) => {
                              previewClosedByUserRef.current = false;
                              setActiveCodePreview(code);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-5 my-auto min-h-[400px] animate-entrance-hero">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-white tracking-[-0.03em]">
                      {userName ? `Halo, ${userName.split(" ")[0]}!` : "Halo!"}
                    </h2>
                    <p className="text-xs text-white/40 max-w-sm leading-relaxed">
                      Ada yang bisa saya bantu hari ini? Pilih dari 15+ model AI gratis atau minta buatkan komponen web HTML secara interaktif.
                    </p>
                  </div>

                  {/* Quick suggestion chips */}
                  <div className="flex flex-wrap justify-center gap-2 max-w-md mt-2 animate-entrance-chips">
                    {["Jelaskan quantum computing", "Buatkan landing page", "Analisis kode Python"].map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSendMessage(s)}
                        className="px-3.5 py-2 rounded-2xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.12] text-[11px] text-white/40 hover:text-white/70 transition-all duration-200 hover:scale-[1.02]"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((m) => (
                  <MessageBubble
                    key={m.id}
                    message={m}
                    userAvatar={userAvatar}
                    onOpenCodePreview={(code) => {
                      previewClosedByUserRef.current = false;
                      setActiveCodePreview(code);
                    }}
                    onEditMessage={handleEditMessage}
                    onRegenerate={handleRegenerateResponse}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Bottom Floating Input Bar */}
          <div className={`p-4 ${isArenaMode ? "max-w-5xl" : "max-w-3xl"} w-full mx-auto animate-entrance-input`}>
            <ChatInputBar
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              selectedModel={selectedModel}
              onSelectModel={setSelectedModel}
              selectedLucidMode={selectedLucidMode}
              onSelectLucidMode={setSelectedLucidMode}
              isArenaMode={isArenaMode}
              onToggleArenaMode={() => {
                setIsArenaMode((prev) => {
                  const next = !prev;
                  if (next) {
                    setArenaMessages([...messages]);
                  } else {
                    setArenaMessages([]);
                  }
                  return next;
                });
              }}
              isHandsFreeMode={isHandsFreeMode}
              onToggleHandsFreeMode={() => setIsHandsFreeMode((prev) => !prev)}
            />
          </div>
        </div>

        {/* Resizable Divider Drag Handle */}
        {activeCodePreview && !isPreviewMaximized && (
          <div
            onMouseDown={handleMouseDown}
            onDoubleClick={() => setPreviewWidth(50)}
            className="hidden md:flex w-1.5 hover:w-2.5 bg-white/[0.06] hover:bg-white/[0.25] cursor-col-resize select-none h-full transition-all duration-150 relative z-30 items-center justify-center group"
            title="Geser untuk mengubah ukuran panel (Klik 2x untuk reset 50%)"
          >
            <div className="w-1 h-8 rounded-full bg-white/30 group-hover:bg-white/80 transition-colors" />
          </div>
        )}

        {/* Code Artifact Preview Split Panel */}
        {activeCodePreview && (
          <div
            style={
              isMobile
                ? { width: "100%", left: 0, right: 0, top: 0, bottom: 0 }
                : { width: isPreviewMaximized ? "100%" : `${previewWidth}%` }
            }
            className="fixed inset-0 md:relative md:inset-auto h-full h-[100dvh] md:h-full p-1 sm:p-2 md:p-3 bg-black/95 md:bg-black/40 backdrop-blur-3xl z-50 md:z-20 transition-all duration-150 animate-fade-in w-full md:w-auto"
          >
            <CodePreviewTabs
              codeContent={activeCodePreview}
              onClose={handleClosePreview}
              isMaximized={isPreviewMaximized}
              onToggleMaximize={() => setIsPreviewMaximized(!isPreviewMaximized)}
            />
          </div>
        )}
      </div>

      {/* Settings Modal Component */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        userName={userName}
        onUpdateUserName={setUserName}
        userAvatar={userAvatar}
        onUpdateUserAvatar={setUserAvatar}
        customSystemPrompt={customSystemPrompt}
        onUpdateCustomSystemPrompt={setCustomSystemPrompt}
        onSaveSuccess={(msg) => {
          setToastMessage(msg);
          setTimeout(() => setToastMessage(null), 3000);
        }}
      />

      {/* Immersive Hands-Free Voice Call Screen Modal */}
      <VoiceCallModal
        isOpen={isHandsFreeMode}
        onClose={() => setIsHandsFreeMode(false)}
        selectedModel={selectedModel}
        userName={userName}
        onSendMessage={(spokenText) => handleSendMessage(spokenText)}
        isLoading={isLoading}
        lastAiMessage={messages.filter((m) => m.role === "assistant").slice(-1)[0]?.content || ""}
      />

      {/* Floating Toast Success Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#121319] border border-emerald-500/30 text-white shadow-2xl shadow-emerald-950/40 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-medium tracking-wide text-zinc-200">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
