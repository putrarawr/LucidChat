"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_MODELS, ModelItem } from "@/lib/model-router";
import { ModelSelector } from "@/components/chat/ModelSelector";
import { MessageBubble, Message } from "@/components/chat/MessageBubble";
import { ChatInputBar } from "@/components/chat/ChatInputBar";
import { SessionList, SessionItem } from "@/components/sidebar/SessionList";
import { CodePreviewTabs } from "@/components/artifact/CodePreviewTabs";
import { Sparkles, Code2 } from "lucide-react";

export default function ChatPage() {
  const [selectedModel, setSelectedModel] = useState<ModelItem>(DEFAULT_MODELS[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>();
  const [activeCodePreview, setActiveCodePreview] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | undefined>();

  const supabase = createClient();

  // Load User & Sessions
  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email);
        const { data: chatData } = await supabase
          .from("chats")
          .select("*")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false });

        if (chatData) {
          setSessions(
            chatData.map((c) => ({
              id: c.id,
              title: c.title,
              updatedAt: c.updated_at,
            }))
          );
        }
      }
    }
    loadData();
  }, []);

  // Handle New Chat
  const handleNewChat = () => {
    setMessages([]);
    setCurrentSessionId(undefined);
    setActiveCodePreview(null);
  };

  // Delete Session
  const handleDeleteSession = async (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (currentSessionId === id) handleNewChat();
    await supabase.from("chats").delete().eq("id", id);
  };

  // Send Message with Streaming SSE Response
  const handleSendMessage = async (text: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    // Initial assistant empty bubble
    const assistantId = (Date.now() + 1).toString();
    const assistantMsg: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
    };

    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          modelId: selectedModel.id,
          provider: selectedModel.provider,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = "";

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

                // Detect code block on the fly
                const match = accumulatedContent.match(/```html([\s\S]*?)```/) || accumulatedContent.match(/```([\s\S]*?)```/);
                if (match && !activeCodePreview) {
                  setActiveCodePreview(match[1].trim());
                }

                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantId
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  )
                );
              }
            } catch (err) {
              // Non-JSON line ignore
            }
          }
        }
      }
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? { ...msg, content: `⚠️ Error: ${err.message || "Gagal mendapatkan respons AI"}` }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#080808]">
      {/* Background Ambient Blur Glow */}
      <div className="ambient-glow" />

      {/* Sidebar Navigation */}
      <SessionList
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={(id) => setCurrentSessionId(id)}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onLogout={() => supabase.auth.signOut()}
        userEmail={userEmail}
      />

      {/* Main Container Area */}
      <div className="flex-1 flex overflow-hidden pl-0 md:pl-72 transition-all">
        {/* Chat Stream Panel */}
        <div className="flex-1 flex flex-col h-full relative z-10">
          {/* Header Bar */}
          <header className="h-16 px-6 flex items-center justify-between border-b border-white/10 bg-black/40 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <ModelSelector
                selectedModel={selectedModel}
                onSelectModel={(model) => setSelectedModel(model)}
              />
            </div>

            {activeCodePreview && (
              <button
                onClick={() => setActiveCodePreview(null)}
                className="glass-pill text-xs px-3 py-1.5 flex items-center gap-1.5 text-white/70 hover:text-white"
              >
                <Code2 className="w-3.5 h-3.5" />
                Tutup Preview
              </button>
            )}
          </header>

          {/* Messages Stream Container */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 max-w-4xl w-full mx-auto">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 my-auto min-h-[400px]">
                <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/15 flex items-center justify-center shadow-inner">
                  <Sparkles className="w-8 h-8 text-white/80" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">LucidChat</h2>
                  <p className="text-xs text-white/40 max-w-sm mt-1 leading-relaxed">
                    Pilih dari 15+ model AI gratis. Tanyakan apa saja atau minta buatkan komponen web HTML secara interaktif.
                  </p>
                </div>
              </div>
            ) : (
              messages.map((m) => (
                <MessageBubble
                  key={m.id}
                  message={m}
                  onOpenCodePreview={(code) => setActiveCodePreview(code)}
                />
              ))
            )}
          </div>

          {/* Bottom Floating Input Bar */}
          <div className="p-4 max-w-4xl w-full mx-auto">
            <ChatInputBar onSendMessage={handleSendMessage} isLoading={isLoading} />
          </div>
        </div>

        {/* Code Artifact Preview Split Panel */}
        {activeCodePreview && (
          <div className="w-1/2 h-full p-4 border-l border-white/10 bg-black/60 backdrop-blur-2xl z-20 transition-all duration-300">
            <CodePreviewTabs
              codeContent={activeCodePreview}
              onClose={() => setActiveCodePreview(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
