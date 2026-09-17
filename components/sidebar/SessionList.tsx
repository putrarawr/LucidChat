"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  MessageSquare,
  Trash2,
  PanelLeftClose,
  Search,
  Pin,
  Pencil,
  Download,
  Check,
  X,
  Settings,
  LogOut,
  Bot,
  ExternalLink,
} from "lucide-react";
import { playClickSound } from "@/lib/sound";

export interface SessionItem {
  id: string;
  title: string;
  updatedAt: string;
  isPinned?: boolean;
  modelUsed?: string;
}

export interface SessionListProps {
  sessions: SessionItem[];
  currentSessionId?: string;
  selectedModelId?: string;
  isOpen: boolean;
  onToggleSidebar: () => void;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onPinSession?: (id: string) => void;
  onRenameSession?: (id: string, newTitle: string) => void;
  onExportSession?: (id: string) => void;
  onOpenSettings?: () => void;
  onLogout?: () => void;
  userEmail?: string;
  userName?: string;
  userAvatar?: string;
}

export function SessionList({
  sessions,
  currentSessionId,
  isOpen,
  onToggleSidebar,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onPinSession,
  onRenameSession,
  onExportSession,
  onOpenSettings,
  onLogout,
  userEmail,
  userName,
  userAvatar,
}: SessionListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [deleteConfirmSession, setDeleteConfirmSession] = useState<SessionItem | null>(null);
  const [totalRoomUnreads, setTotalRoomUnreads] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const readUnreads = () => {
        const val = localStorage.getItem("lucidchat_room_unreads_total");
        if (val) setTotalRoomUnreads(parseInt(val, 10) || 0);
        else setTotalRoomUnreads(0);
      };
      readUnreads();
      window.addEventListener("storage", readUnreads);
      return () => window.removeEventListener("storage", readUnreads);
    }
  }, []);

  // Filter out room chats from global history to keep /chat history separate from /rooms
  const historySessions = sessions.filter(
    (s) => !s.title.startsWith("[Room AI]")
  );

  const filteredSessions = historySessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedSessions = filteredSessions.filter((s) => s.isPinned);
  const unpinnedSessions = filteredSessions.filter((s) => !s.isPinned);

  const handleStartRename = (session: SessionItem, e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound();
    setEditingSessionId(session.id);
    setEditTitle(session.title);
  };

  const handleSaveRename = (id: string, e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();
    if (editTitle.trim() && onRenameSession) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingSessionId(null);
  };

  const handleConfirmDelete = () => {
    playClickSound();
    if (deleteConfirmSession) {
      onDeleteSession(deleteConfirmSession.id);
      setDeleteConfirmSession(null);
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onToggleSidebar}
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 md:hidden animate-fade-in cursor-pointer"
        />
      )}

      {/* Delete Confirmation Liquid Glass Modal */}
      {deleteConfirmSession && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-fade-in">
          <div className="w-full max-w-sm md:max-w-md rounded-3xl border border-white/20 bg-[#0e0e14]/95 p-6 shadow-[0_0_80px_rgba(0,0,0,0.9)] space-y-4 relative z-[100000]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">Hapus Percakapan?</h3>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              Apakah Anda yakin ingin menghapus percakapan <strong className="text-white">&quot;{deleteConfirmSession.title}&quot;</strong>? Percakapan akan dihapus permanen.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmSession(null)}
                className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white hover:bg-white/10 transition-all font-medium"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-red-500/90 hover:bg-red-500 text-white border border-red-400/40 shadow-lg transition-all"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 p-4 sidebar-glass rounded-none flex flex-col justify-between transition-transform duration-300 ease-[var(--ease-glass)] ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top Header & Navigation */}
        <div className="flex flex-col min-h-0 flex-1">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] shrink-0">
            <div className="flex items-center gap-2.5">
              <img
                src="/logo.png"
                alt="LucidChat Logo"
                className="w-7 h-7 rounded-lg object-cover shadow-[0_0_12px_rgba(255,255,255,0.3)] border border-white/20"
              />
              <span className="font-semibold text-sm tracking-[-0.02em] text-white">LucidChat</span>
            </div>
            <button
              onClick={onToggleSidebar}
              className="p-1.5 text-white/40 hover:text-white hover:bg-white/[0.08] rounded-xl transition-all duration-200"
              title="Tutup Sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* New Chat Button */}
          <button
            onClick={onNewChat}
            className="w-full mt-3 py-2.5 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs font-semibold tracking-wide bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] hover:border-white/[0.15] shadow-sm text-white/80 hover:text-white transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shrink-0"
          >
            <Plus className="w-4 h-4" />
            Chat Baru
          </button>

          {/* Dedicated Model Rooms Route Button */}
          <Link
            href="/rooms"
            className="w-full mt-2 py-2.5 px-3.5 rounded-2xl flex items-center justify-between gap-2 text-xs font-semibold bg-gradient-to-r from-white/10 via-white/5 to-transparent hover:from-white/20 hover:to-white/10 border border-white/15 text-white shadow-sm transition-all shrink-0 group"
          >
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
              <span>Model Rooms AI</span>
              {totalRoomUnreads > 0 && (
                <span className="flex items-center justify-center min-w-[18px] h-4.5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-black shadow-[0_0_10px_rgba(239,68,68,0.8)] border border-red-400/40 animate-bounce">
                  {totalRoomUnreads}
                </span>
              )}
            </div>
            <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
          </Link>

          {/* Search Filter Input */}
          <div className="mt-3 relative shrink-0">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari percakapan..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-xs text-white placeholder-white/25 focus:outline-none focus:border-white/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Session List Container (Global Custom Sessions Only) */}
          <div className="mt-4 space-y-3 overflow-y-auto flex-1 pr-1">
            {/* Pinned Sessions */}
            {pinnedSessions.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[9px] font-semibold tracking-[0.15em] text-white/40 uppercase px-2 mb-1">
                  <Pin className="w-3 h-3 text-white/50" />
                  <span>Disematkan</span>
                </div>
                {pinnedSessions.map((s) => renderSessionRow(s))}
              </div>
            )}

            {/* Unpinned / Regular Sessions */}
            <div className="space-y-1">
              {pinnedSessions.length > 0 && (
                <div className="text-[9px] font-semibold tracking-[0.15em] text-white/25 uppercase px-2 mb-1 pt-1">
                  Semua Chat
                </div>
              )}
              {filteredSessions.length === 0 ? (
                <div className="px-3 py-6 text-center text-xs text-white/20">
                  {searchQuery ? "Tidak ditemukan percakapan" : "Belum ada percakapan"}
                </div>
              ) : (
                unpinnedSessions.map((s) => renderSessionRow(s))
              )}
            </div>
          </div>
        </div>

        {/* Bottom Profile / Logout */}
        <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userName || "User Avatar"}
                className="w-7 h-7 rounded-full border border-white/10 object-cover shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-white/[0.10] border border-white/[0.10] flex items-center justify-center text-[10px] font-semibold text-white/70 shrink-0">
                {userName ? userName[0].toUpperCase() : userEmail ? userEmail[0].toUpperCase() : "U"}
              </div>
            )}
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[11px] font-medium text-white/80 truncate">
                {userName || userEmail || "Guest User"}
              </span>
              {userName && userEmail && (
                <span className="text-[9px] text-white/35 truncate">{userEmail}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0 ml-1">
            {onOpenSettings && (
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  onOpenSettings();
                }}
                className="p-1.5 text-white/40 hover:text-white hover:bg-white/[0.08] rounded-xl transition-all duration-200"
                title="Pengaturan Aplikasi & Profil"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="p-1.5 text-white/30 hover:text-white hover:bg-white/[0.08] rounded-xl transition-all duration-200"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );

  function renderSessionRow(s: SessionItem) {
    const isActive = s.id === currentSessionId;
    const isEditing = editingSessionId === s.id;

    if (isEditing) {
      return (
        <form
          key={s.id}
          onSubmit={(e) => handleSaveRename(s.id, e)}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-white/[0.10] border border-white/20"
        >
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="flex-1 bg-transparent text-xs text-white focus:outline-none"
            autoFocus
          />
          <button type="submit" className="p-1 text-emerald-400 hover:text-emerald-300">
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setEditingSessionId(null)}
            className="p-1 text-white/40 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </form>
      );
    }

    return (
      <div
        key={s.id}
        onClick={() => onSelectSession(s.id)}
        className={`group relative flex items-center justify-between px-2.5 py-2.5 rounded-xl text-xs cursor-pointer transition-all duration-200 ${
          isActive
            ? "bg-white/[0.12] text-white font-medium border border-white/[0.12] shadow-sm"
            : "text-white/60 hover:text-white hover:bg-white/[0.06] active:bg-white/[0.10]"
        }`}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0 text-left pr-1 pointer-events-none">
          <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-60 text-white" />
          <span className="truncate">{s.title}</span>
        </div>

        {/* Action Menu */}
        <div className="opacity-100 md:opacity-0 md:group-hover:opacity-100 flex items-center gap-0.5 transition-all duration-200 shrink-0">
          {onPinSession && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPinSession(s.id);
              }}
              className={`p-1 rounded-lg transition-colors ${
                s.isPinned ? "text-amber-400 hover:text-amber-300" : "text-white/40 hover:text-white hover:bg-white/[0.10]"
              }`}
              title={s.isPinned ? "Lepas Sematan" : "Sematkan Chat"}
            >
              <Pin className="w-3 h-3" />
            </button>
          )}

          {onRenameSession && (
            <button
              type="button"
              onClick={(e) => handleStartRename(s, e)}
              className="p-1 text-white/40 hover:text-white hover:bg-white/[0.10] rounded-lg transition-colors"
              title="Ubah Judul Chat"
            >
              <Pencil className="w-3 h-3" />
            </button>
          )}

          {onExportSession && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onExportSession(s.id);
              }}
              className="p-1 text-white/40 hover:text-white hover:bg-white/[0.10] rounded-lg transition-colors"
              title="Ekspor Chat ke Markdown"
            >
              <Download className="w-3 h-3" />
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteConfirmSession(s);
            }}
            className="p-1 text-white/40 hover:text-red-400 hover:bg-white/[0.10] rounded-lg transition-colors"
            title="Hapus Chat"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }
}
