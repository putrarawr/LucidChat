"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Announcement, AnnouncementType, saveAnnouncementLocally } from "@/lib/announcements";
import {
  Activity,
  Users,
  MessageSquare,
  Radio,
  Send,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  Flame,
  Info,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { FloatingLanguagePicker } from "@/components/ui/FloatingLanguagePicker";
import { playClickSound } from "@/lib/sound";

const AUTHORIZED_ADMIN_EMAILS = [
  "uyungoke58@gmail.com",
  "putrarawr18@gmail.com",
  "lucidchat18@gmail.com",
];

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Stats
  const [realtimeCount, setRealtimeCount] = useState<number>(1);
  const [totalChats, setTotalChats] = useState<number>(0);
  const [totalUsers, setTotalUsers] = useState<number>(1);

  // Announcement Form State
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");
  const [annType, setAnnType] = useState<AnnouncementType>("info");
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState<string | null>(null);

  const [sentHistory, setSentHistory] = useState<Announcement[]>([]);

  useEffect(() => {
    async function checkAdminAndFetchStats() {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          setUserEmail(user.email || null);
          const email = (user.email || "").toLowerCase();
          const metaAdmin = user.user_metadata?.is_admin === true;
          const isAuthAdmin = AUTHORIZED_ADMIN_EMAILS.includes(email) || metaAdmin;
          setIsAdmin(isAuthAdmin);

          if (isAuthAdmin) {
            // Fetch total chats count
            const { count: chatsCount } = await supabase
              .from("chats")
              .select("*", { count: "exact", head: true });
            if (chatsCount !== null) setTotalChats(chatsCount);

            // Estimate total users based on unique user_ids in chats
            const { data: uniqueUsers } = await supabase
              .from("chats")
              .select("user_id");
            if (uniqueUsers) {
              const uniqueIds = new Set(uniqueUsers.map((u) => u.user_id));
              setTotalUsers(Math.max(1, uniqueIds.size));
            }
          }
        } else {
          setIsAdmin(false);
        }

        // Subscribe to presence count
        const channel = supabase.channel("online-presence");
        channel.on("presence", { event: "sync" }, () => {
          const state = channel.presenceState();
          const count = Math.max(1, Object.keys(state).length);
          setRealtimeCount(count);
        }).subscribe();

      } catch (err) {
        console.warn("Admin check error:", err);
      } finally {
        setLoading(false);
      }
    }

    checkAdminAndFetchStats();
  }, []);

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;

    playClickSound();
    setBroadcasting(true);
    setBroadcastSuccess(null);

    try {
      const supabase = createClient();
      const newAnn: Announcement = {
        id: `ann_${Date.now()}`,
        title: annTitle.trim(),
        content: annContent.trim(),
        type: annType,
        createdAt: new Date().toISOString(),
        author: userEmail || "LucidChat Admin",
      };

      // 1. Broadcast live via Supabase Realtime channel
      const channel = supabase.channel("global-announcements");
      await channel.subscribe();
      await channel.send({
        type: "broadcast",
        event: "new_announcement",
        payload: newAnn,
      });

      // 2. Save locally for persistence
      saveAnnouncementLocally(newAnn);
      setSentHistory((prev) => [newAnn, ...prev]);

      setBroadcastSuccess("✅ Mass announcement broadcasted live to all active users!");
      setAnnTitle("");
      setAnnContent("");
      setTimeout(() => setBroadcastSuccess(null), 5000);
    } catch (err) {
      console.error("Broadcast failed:", err);
    } finally {
      setBroadcasting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--surface-0)] flex items-center justify-center p-4 relative">
        <div className="bg-orbs" />
        <div className="text-center space-y-3 z-10">
          <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
          <p className="text-xs text-white/50">Verifying Admin Access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[var(--surface-0)] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="bg-orbs" />
        <div className="relative z-10 max-w-md w-full liquid-glass-elevated p-8 text-center space-y-5 border border-red-500/20">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-xl font-bold text-white">Access Restricted</h1>
            <p className="text-xs text-white/50 leading-relaxed">
              You must be an authorized admin ({AUTHORIZED_ADMIN_EMAILS.join(", ")}) to access the LucidChat Control Dashboard.
            </p>
          </div>
          {userEmail && (
            <p className="text-[11px] text-white/30 bg-white/5 py-1.5 px-3 rounded-lg inline-block">
              Logged in as: <span className="text-white/70 font-mono">{userEmail}</span>
            </p>
          )}
          <div className="pt-2">
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-xs shadow-lg hover:bg-white/90 active:scale-95 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Chat</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--surface-0)] text-white p-4 sm:p-8 relative overflow-x-hidden">
      <div className="bg-orbs" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Admin Verified
              </span>
              <span className="text-xs text-white/40 font-mono">{userEmail}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <span>LucidChat Control Center</span>
              <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
            </h1>
            <p className="text-xs text-white/50">Realtime Traffic Monitor & Global Announcement System</p>
          </div>

          <div className="flex items-center gap-3">
            <FloatingLanguagePicker variant="compact" />
            <Link
              href="/chat"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Go to App</span>
            </Link>
          </div>
        </div>

        {/* Realtime Traffic Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Realtime Online Card */}
          <div className="liquid-glass p-5 rounded-2xl border border-emerald-500/20 space-y-3 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white/60">Realtime Online</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Radio className="w-4 h-4 animate-pulse" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white tracking-tight">{realtimeCount}</span>
              <span className="text-xs text-emerald-400 font-medium">active sessions</span>
            </div>
            <p className="text-[11px] text-white/40">Users currently active on LucidChat</p>
          </div>

          {/* Total Registered Users */}
          <div className="liquid-glass p-5 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white/60">Total Users</span>
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white tracking-tight">{totalUsers}</span>
              <span className="text-xs text-cyan-400 font-medium">registered</span>
            </div>
            <p className="text-[11px] text-white/40">Active unique user accounts</p>
          </div>

          {/* Total Chat Sessions */}
          <div className="liquid-glass p-5 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white/60">Total Chat Threads</span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                <MessageSquare className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white tracking-tight">{totalChats}</span>
              <span className="text-xs text-purple-400 font-medium">conversations</span>
            </div>
            <p className="text-[11px] text-white/40">Saved multi-model chat sessions</p>
          </div>

          {/* AI Models Active */}
          <div className="liquid-glass p-5 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white/60">Active AI Models</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white tracking-tight">15+</span>
              <span className="text-xs text-amber-400 font-medium">models online</span>
            </div>
            <p className="text-[11px] text-white/40">DeepSeek, Llama, Qwen & Gemini</p>
          </div>
        </div>

        {/* Mass Announcement System Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Announcement Form */}
          <div className="lg:col-span-2 liquid-glass-elevated p-6 sm:p-8 rounded-2xl border border-white/15 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="space-y-0.5">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Radio className="w-5 h-5 text-red-400 animate-pulse" />
                  <span>Broadcast Mass Announcement</span>
                </h2>
                <p className="text-xs text-white/50">Send real-time alert banner to all online & visiting users</p>
              </div>
            </div>

            {broadcastSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 animate-in fade-in duration-200">
                {broadcastSuccess}
              </div>
            )}

            <form onSubmit={handleSendAnnouncement} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-white/70 mb-1.5 block">Announcement Title</label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="e.g. 🚀 System Upgrade Completed / Special Feature Update"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-xs text-white placeholder-white/30 outline-none focus:border-white/40 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-white/70 mb-1.5 block">Announcement Priority & Style</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "info", label: "Information", icon: Info, color: "text-cyan-400 border-cyan-500/30" },
                    { id: "success", label: "Success", icon: CheckCircle2, color: "text-emerald-400 border-emerald-500/30" },
                    { id: "warning", label: "Warning", icon: AlertTriangle, color: "text-amber-400 border-amber-500/30" },
                    { id: "urgent", label: "Urgent", icon: Flame, color: "text-red-400 border-red-500/30" },
                  ].map((item) => {
                    const IconComp = item.icon;
                    const selected = annType === item.id;
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => setAnnType(item.id as AnnouncementType)}
                        className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                          selected ? `bg-white/15 ${item.color} font-bold shadow-md` : "bg-white/[0.04] border-white/10 text-white/50 hover:bg-white/[0.08]"
                        }`}
                      >
                        <IconComp className="w-3.5 h-3.5" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-white/70 mb-1.5 block">Announcement Content</label>
                <textarea
                  required
                  rows={4}
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  placeholder="Type full announcement message here..."
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/15 text-xs text-white placeholder-white/30 outline-none focus:border-white/40 transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={broadcasting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold text-xs shadow-xl hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{broadcasting ? "Broadcasting Mass Announcement..." : "Broadcast Announcement to All Users"}</span>
              </button>
            </form>
          </div>

          {/* Broadcast Log */}
          <div className="liquid-glass p-6 rounded-2xl border border-white/10 space-y-4 flex flex-col">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Broadcast Activity Log</span>
            </h3>

            <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[360px] pr-1">
              {sentHistory.length === 0 ? (
                <div className="p-6 text-center text-xs text-white/30 space-y-1">
                  <p>No mass announcements broadcasted in this session yet.</p>
                  <p className="text-[10px]">Submitted announcements will appear here live.</p>
                </div>
              ) : (
                sentHistory.map((item) => (
                  <div key={item.id} className="p-3 rounded-xl bg-white/[0.04] border border-white/10 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white truncate max-w-[160px]">{item.title}</span>
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-white/10 text-white/60">{item.type}</span>
                    </div>
                    <p className="text-[11px] text-white/60 line-clamp-2">{item.content}</p>
                    <div className="text-[9px] text-white/30 pt-0.5">
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
