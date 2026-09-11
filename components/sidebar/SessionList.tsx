"use client";

import { Plus, MessageSquare, Trash2, LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useState } from "react";

export interface SessionItem {
  id: string;
  title: string;
  updatedAt: string;
}

interface SessionListProps {
  sessions: SessionItem[];
  currentSessionId?: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onLogout?: () => void;
  userEmail?: string;
}

export function SessionList({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onLogout,
  userEmail,
}: SessionListProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      {/* Toggle Open Button when Sidebar collapsed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-40 p-2.5 liquid-glass text-white/70 hover:text-white border border-white/15"
          title="Buka Sidebar"
        >
          <PanelLeftOpen className="w-4 h-4" />
        </button>
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-30 w-72 p-4 liquid-glass rounded-none border-r border-white/10 flex flex-col justify-between transition-transform duration-300 backdrop-blur-2xl bg-black/50 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
              <span className="font-semibold text-sm tracking-tight text-white">LucidChat</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              title="Tutup Sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* New Chat Button */}
          <button
            onClick={onNewChat}
            className="w-full mt-4 glass-pill py-2.5 px-4 flex items-center justify-center gap-2 text-xs font-semibold tracking-wide bg-white/10 hover:bg-white/20 border border-white/20 shadow-md text-white transition-all"
          >
            <Plus className="w-4 h-4" />
            Chat Baru
          </button>

          {/* Session List */}
          <div className="mt-6 space-y-1 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
            <div className="text-[10px] font-semibold tracking-widest text-white/30 uppercase px-2 mb-2">
              Riwayat Chat
            </div>
            {sessions.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-white/30">
                Belum ada percakapan
              </div>
            ) : (
              sessions.map((s) => {
                const isActive = s.id === currentSessionId;
                return (
                  <div
                    key={s.id}
                    className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all ${
                      isActive
                        ? "bg-white/15 text-white font-medium border border-white/15"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <button
                      onClick={() => onSelectSession(s.id)}
                      className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
                    >
                      <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70" />
                      <span className="truncate">{s.title}</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(s.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-white/40 hover:text-white hover:bg-white/10 rounded transition-all"
                      title="Hapus Chat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Bottom Profile / Logout */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-white/20 border border-white/20 flex items-center justify-center text-xs font-semibold text-white">
              {userEmail ? userEmail[0].toUpperCase() : "U"}
            </div>
            <span className="text-xs text-white/70 truncate">{userEmail || "User"}</span>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
