"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_MODELS, ModelItem } from "@/lib/model-types";
import { MessageBubble, Message, stripThinkTags } from "@/components/chat/MessageBubble";
import { ChatInputBar, AttachmentFile } from "@/components/chat/ChatInputBar";
import { SessionList, SessionItem } from "@/components/sidebar/SessionList";
import { CodePreviewTabs } from "@/components/artifact/CodePreviewTabs";
import { PersonaModal } from "@/components/chat/PersonaModal";
import { DEFAULT_PERSONAS, Persona } from "@/lib/persona-types";
import { X, Sliders } from "lucide-react";

interface ChatRow {
  id: string;
  user_id: string;
  title: string;
  model_used: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export default function ChatPage() {
  const [selectedModel, setSelectedModel] = useState<ModelItem>(DEFAULT_MODELS[0]);
  const [selectedPersona, setSelectedPersona] = useState<Persona>(DEFAULT_PERSONAS[0]);
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>();
  const [activeCodePreview, setActiveCodePreview] = useState<string | null>(null);

  const [userEmail, setUserEmail] = useState<string | undefined>();
  const [userName, setUserName] = useState<string | undefined>();
  const [userAvatar, setUserAvatar] = useState<string | undefined>();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Resizable split panel states
  const [previewWidth, setPreviewWidth] = useState(50);
  const [isPreviewMaximized, setIsPreviewMaximized] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previewClosedByUserRef = useRef(false);
  const lastPreviewUpdateRef = useRef(0);
  const supabase = useMemo(() => createClient(), []);

  const handleClosePreview = () => {
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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load User & Sessions
  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserEmail(user.email);
          const meta = user.user_metadata || {};
          const name = meta.full_name || meta.name || meta.custom_claims?.global_name;
          if (name) {
            setUserName(name);
          } else if (user.email) {
            const rawName = user.email.split("@")[0];
            setUserName(rawName.charAt(0).toUpperCase() + rawName.slice(1));
          }
          if (meta.avatar_url || meta.picture) {
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

  const handleNewChat = () => {
    setMessages([]);
    setCurrentSessionId(undefined);
    previewClosedByUserRef.current = false;
    setActiveCodePreview(null);
  };

  const handleDeleteSession = async (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (currentSessionId === id) handleNewChat();
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
  const handleSendMessage = async (text: string, attachments?: AttachmentFile[]) => {
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
      if (!activeChatId && user) {
        const titleText = text.slice(0, 32) + (text.length > 32 ? "..." : "");
        const { data: newChat } = await supabase
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
          setCurrentSessionId(activeChatId);
          setSessions((prev) => [
            { id: newChat.id, title: newChat.title, updatedAt: newChat.updated_at },
            ...prev,
          ]);
        }
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

    const assistantId = (Date.now() + 1).toString();
    const assistantMsg: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      isStreaming: true,
    };

    setMessages((prev) => [...prev, assistantMsg]);
    let accumulatedContent = "";

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          modelId: selectedModel.id,
          provider: selectedModel.provider,
          customSystemPrompt: selectedPersona.systemPrompt,
          attachments,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      if (!response.body) return;
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

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
              if (parsed.delta) {
                accumulatedContent += parsed.delta;

                if (!previewClosedByUserRef.current) {
                  const cleanText = stripThinkTags(accumulatedContent);
                  const htmlMatch = cleanText.match(/```html([\s\S]*?)(?:```|$)/i) || cleanText.match(/```xml([\s\S]*?)(?:```|$)/i);
                  if (htmlMatch) {
                    let extractedCode = htmlMatch[1].trim();
                    if (extractedCode.includes("<") && extractedCode.length > 20 && !extractedCode.includes("**Draft Code")) {
                      const scriptOpen = (extractedCode.match(/<script/gi) || []).length;
                      const scriptClose = (extractedCode.match(/<\/script>/gi) || []).length;
                      if (scriptOpen > scriptClose) {
                        extractedCode += "\n</script>";
                      }
                      const styleOpen = (extractedCode.match(/<style/gi) || []).length;
                      const styleClose = (extractedCode.match(/<\/style>/gi) || []).length;
                      if (styleOpen > styleClose) {
                        extractedCode += "\n</style>";
                      }

                      const now = Date.now();
                      if (now - lastPreviewUpdateRef.current > 400) {
                        lastPreviewUpdateRef.current = now;
                        setActiveCodePreview(extractedCode);
                      }
                    }
                  }
                }

                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantId
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  )
                );
              }
            } catch {
              // Ignore non-JSON
            }
          }
        }
      }

      // Final update for live preview when streaming finishes
      if (!previewClosedByUserRef.current && accumulatedContent) {
        const cleanText = stripThinkTags(accumulatedContent);
        const htmlMatch = cleanText.match(/```html([\s\S]*?)(?:```|$)/i) || cleanText.match(/```xml([\s\S]*?)(?:```|$)/i);
        if (htmlMatch) {
          let extractedCode = htmlMatch[1].trim();
          if (extractedCode.includes("<") && extractedCode.length > 20 && !extractedCode.includes("**Draft Code")) {
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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Gagal mendapatkan respons AI";
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? { ...msg, content: `Error: ${errorMessage}` }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId ? { ...msg, isStreaming: false } : msg
        )
      );
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
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--surface-0)]">
      {/* Animated Background Orbs */}
      <div className="bg-orbs" />
      <div className="orb-center" />

      {/* Sidebar Navigation */}
      <SessionList
        sessions={sessions}
        currentSessionId={currentSessionId}
        isOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onPinSession={handlePinSession}
        onRenameSession={handleRenameSession}
        onExportSession={handleExportSession}
        onLogout={handleLogout}
        userEmail={userEmail}
        userName={userName}
        userAvatar={userAvatar}
      />

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
            width: activeCodePreview
              ? isPreviewMaximized
                ? "0%"
                : `${100 - previewWidth}%`
              : "100%",
            display: activeCodePreview && isPreviewMaximized ? "none" : "flex",
          }}
          className="flex-col h-full relative z-10 transition-[width] duration-75"
        >
          {/* Minimal Header Bar */}
          <header className="h-14 px-6 flex items-center justify-between border-b border-white/[0.05] bg-black/20 backdrop-blur-2xl">
            <div className="flex items-center gap-3">
              {/* Persona Selector Pill */}
              <button
                onClick={() => setIsPersonaModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.12] hover:border-white/[0.18] text-[11px] text-white/70 hover:text-white transition-all shadow-sm"
                title="Ganti AI Persona & System Prompt"
              >
                <Sliders className="w-3.5 h-3.5 text-white/60" />
                <span className="truncate max-w-[150px] font-medium">{selectedPersona.name}</span>
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
          </header>

          {/* Messages Stream Container */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-3xl w-full mx-auto space-y-2">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-5 my-auto min-h-[400px]">
                  {/* Empty State Hero Logo */}
                  <div className="relative">
                    <div className="w-20 h-20 rounded-[24px] bg-white/[0.04] border border-white/[0.12] flex items-center justify-center p-2 shadow-[0_0_40px_rgba(255,255,255,0.06)] animate-float overflow-hidden">
                      <img src="/logo.png" alt="LucidChat Logo" className="w-full h-full object-cover rounded-[18px]" />
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-2 rounded-full bg-white/[0.04] blur-sm" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white tracking-[-0.03em]">
                      {userName ? `Halo, ${userName.split(" ")[0]}!` : "Halo!"}
                    </h2>
                    <p className="text-xs text-white/40 max-w-sm leading-relaxed">
                      Ada yang bisa saya bantu hari ini? Pilih dari 15+ model AI gratis atau minta buatkan komponen web HTML secara interaktif.
                    </p>
                  </div>

                  {/* Quick suggestion chips */}
                  <div className="flex flex-wrap justify-center gap-2 max-w-md mt-2">
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
          <div className="p-4 max-w-3xl w-full mx-auto">
            <ChatInputBar
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              selectedModel={selectedModel}
              onSelectModel={setSelectedModel}
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
            style={{
              width: isPreviewMaximized ? "100%" : `${previewWidth}%`,
            }}
            className="fixed inset-0 md:relative md:inset-auto h-full p-2 md:p-3 bg-black/80 md:bg-black/40 backdrop-blur-3xl z-40 md:z-20 transition-[width] duration-75 animate-fade-in w-full md:w-auto"
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

      {/* Persona Selection Modal */}
      <PersonaModal
        isOpen={isPersonaModalOpen}
        onClose={() => setIsPersonaModalOpen(false)}
        selectedPersona={selectedPersona}
        onSelectPersona={setSelectedPersona}
      />
    </div>
  );
}
