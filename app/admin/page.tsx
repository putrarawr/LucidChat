"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Announcement, AnnouncementType, saveAnnouncementLocally } from "@/lib/announcements";
import { getEffectiveAvatarUrl } from "@/lib/avatar";
import {
  Users,
  MessageSquare,
  Radio,
  Send,
  ShieldCheck,
  ArrowLeft,
  Flame,
  Info,
  AlertTriangle,
  CheckCircle2,
  Search,
  Mail,
  Lock,
  Globe,
  TrendingUp,
  Zap,
  BarChart3,
  Clock,
  Trophy,
  PieChart,
  Activity,
  Plus,
  Trash2,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { FloatingLanguagePicker } from "@/components/ui/FloatingLanguagePicker";
import { playClickSound } from "@/lib/sound";

const AUTHORIZED_ADMIN_EMAILS = [
  "putrarawr18@gmail.com",
  "uyungoke58@gmail.com",
  "lucidchat18@gmail.com",
];

// ─── Interfaces ──────────────────────────────────────────────────────
interface RegisteredUserRecord {
  id: string;
  email: string;
  name: string;
  avatar: string;
  provider: "Google" | "Email";
  createdAt: string;
  lastSignIn: string | null;
}

interface PresenceItem {
  user_id?: string;
  name?: string;
  email?: string;
  avatar?: string;
  provider?: "Google" | "Email";
  online_at?: string;
}

interface ModelTrafficItem {
  modelId: string;
  displayName: string;
  count: number;
  percent: number;
}

interface ActivityEvent {
  id: string;
  type: "chat_created" | "chat_deleted" | "chat_updated" | "user_joined";
  description: string;
  timestamp: string;
  modelUsed?: string;
}

interface TopUserItem {
  userId: string;
  email: string;
  name: string;
  avatar: string;
  chatCount: number;
}

// ─── Helper: Model ID to Display Name ────────────────────────────────
function modelDisplayName(modelId: string): string {
  const map: Record<string, string> = {
    "deepseek/deepseek-chat": "DeepSeek V3",
    "deepseek/deepseek-reasoner": "DeepSeek R1",
    "gemini/gemini-3.6-flash": "Gemini 3.6 Flash",
    "gemini/gemini-1.5-pro": "Gemini 1.5 Pro",
    "openai/gpt-4o": "GPT-4o",
    "openai/gpt-4o-mini": "GPT-4o Mini",
    "openai/o3-mini": "OpenAI o3-mini",
    "claude/claude-3-7-sonnet-20250219": "Claude 3.7 Sonnet",
    "claude/claude-3-5-haiku-20241022": "Claude 3.5 Haiku",
    "groq/llama-3.3-70b-versatile": "Llama 3.3 70B",
    "groq/qwen/qwen3.6-27b": "Qwen 3.6 27B",
    "web-crawler-agent": "Web Crawler Agent",
    "kimi/moonshot-v1-8k": "Kimi Moonshot 8K",
    "kimi/moonshot-v1-32k": "Kimi Moonshot 32K",
    "kimi/kimi-latest": "Kimi Latest",
    "bazaarlink/gpt-4o": "Bazaarlink GPT-4o",
    "bazaarlink/claude-3-5-sonnet": "Bazaarlink Claude 3.5",
    "requestly/gpt-4o-mini": "Requestly GPT-4o Mini",
    "requestly/claude-3-haiku": "Requestly Claude 3 Haiku",
    "openrouter/qwen/qwen-2.5-coder-32b-instruct": "Qwen 2.5 Coder 32B",
    "openrouter/nvidia/nemotron-3.5-lightning:free": "NVIDIA Nemotron 3.5",
    "cerebras/qwen-3.8-27b": "Qwen 3.8 27B (Cerebras)",
    "ollama/llama3.2": "Llama 3.2 (Local)",
  };
  return map[modelId] || modelId;
}

// ─── Helper: Relative Time ───────────────────────────────────────────
function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffSec = Math.floor((now - then) / 1000);
  if (diffSec < 10) return "just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

// ─── Model Badge Color ──────────────────────────────────────────────
function modelBadgeColor(modelId: string): string {
  if (modelId.includes("deepseek")) return "bg-cyan-500/10 border-cyan-500/30 text-cyan-400";
  if (modelId.includes("gemini")) return "bg-blue-500/10 border-blue-500/30 text-blue-400";
  if (modelId.includes("claude")) return "bg-amber-500/10 border-amber-500/30 text-amber-400";
  if (modelId.includes("gpt") || modelId.includes("openai") || modelId.includes("o3")) return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
  if (modelId.includes("llama")) return "bg-purple-500/10 border-purple-500/30 text-purple-400";
  if (modelId.includes("qwen")) return "bg-rose-500/10 border-rose-500/30 text-rose-400";
  if (modelId.includes("kimi") || modelId.includes("moonshot")) return "bg-indigo-500/10 border-indigo-500/30 text-indigo-400";
  if (modelId.includes("web-crawler")) return "bg-teal-500/10 border-teal-500/30 text-teal-400";
  return "bg-white/10 border-white/20 text-white/60";
}

// ═══════════════════════════════════════════════════════════════════════
// ─── ADMIN DASHBOARD COMPONENT ──────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════
export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Core Stats
  const [realtimeCount, setRealtimeCount] = useState<number>(1);
  const [totalChats, setTotalChats] = useState<number>(0);
  const [totalUsersCount, setTotalUsersCount] = useState<number>(0);

  // Real Users from Supabase Auth
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUserRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [usersLoading, setUsersLoading] = useState(false);

  // AI Model Traffic (Real from DB)
  const [modelTraffic, setModelTraffic] = useState<ModelTrafficItem[]>([]);

  // Live Activity Feed
  const [activityFeed, setActivityFeed] = useState<ActivityEvent[]>([]);

  // Peak Hours Heatmap
  const [peakHours, setPeakHours] = useState<number[]>(new Array(24).fill(0));

  // Provider Analytics
  const [providerStats, setProviderStats] = useState({ google: 0, email: 0 });

  // Top Active Users
  const [topUsers, setTopUsers] = useState<TopUserItem[]>([]);

  // Announcement Form State
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");
  const [annType, setAnnType] = useState<AnnouncementType>("info");
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState<string | null>(null);

  // Active online user emails for green dot indicators
  const [onlineEmails, setOnlineEmails] = useState<Set<string>>(new Set());

  // ─── Fetch Real Users from Supabase Auth API ────────────────────────
  const fetchRealUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        const users: RegisteredUserRecord[] = (data.users || []).map((u: {
          id: string;
          email: string;
          name: string;
          avatar: string;
          provider: "Google" | "Email";
          createdAt: string;
          lastSignIn: string | null;
        }) => ({
          id: u.id,
          email: u.email,
          name: u.name,
          avatar: u.avatar || getEffectiveAvatarUrl(u.email),
          provider: u.provider,
          createdAt: new Date(u.createdAt).toLocaleDateString("en-GB", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          lastSignIn: u.lastSignIn,
        }));
        setRegisteredUsers(users);
        setTotalUsersCount(users.length);

        // Provider analytics
        let google = 0, email = 0;
        users.forEach((u: RegisteredUserRecord) => {
          if (u.provider === "Google") google++;
          else email++;
        });
        setProviderStats({ google, email });
      }
    } catch (err) {
      console.warn("Failed to fetch users:", err);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  // ─── Compute Model Traffic from Chats Data ─────────────────────────
  const computeModelTraffic = useCallback((chats: { model_used: string; created_at: string; user_id: string }[]) => {
    // Model frequency
    const modelCounts: Record<string, number> = {};
    chats.forEach((c) => {
      const m = c.model_used || "unknown";
      modelCounts[m] = (modelCounts[m] || 0) + 1;
    });

    const total = chats.length || 1;
    const trafficList: ModelTrafficItem[] = Object.entries(modelCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([modelId, count]) => ({
        modelId,
        displayName: modelDisplayName(modelId),
        count,
        percent: Math.round((count / total) * 100),
      }));

    setModelTraffic(trafficList);

    // Peak hours heatmap
    const hours = new Array(24).fill(0);
    chats.forEach((c) => {
      const h = new Date(c.created_at).getHours();
      hours[h]++;
    });
    setPeakHours(hours);

    // Top active users
    const userChatCounts: Record<string, number> = {};
    chats.forEach((c) => {
      userChatCounts[c.user_id] = (userChatCounts[c.user_id] || 0) + 1;
    });
    const sortedTopUsers = Object.entries(userChatCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    setTopUsers(sortedTopUsers.map(([userId, chatCount]) => {
      const foundUser = registeredUsers.find((u) => u.id === userId);
      return {
        userId,
        email: foundUser?.email || userId.slice(0, 8) + "...",
        name: foundUser?.name || "Unknown User",
        avatar: foundUser?.avatar || getEffectiveAvatarUrl(""),
        chatCount,
      };
    }));
  }, [registeredUsers]);

  // ─── Add Activity Event ────────────────────────────────────────────
  const addActivity = useCallback((event: ActivityEvent) => {
    setActivityFeed((prev) => [event, ...prev].slice(0, 30));
  }, []);

  // ─── Main Init Effect ──────────────────────────────────────────────
  useEffect(() => {
    async function initAdminDashboard() {
      setLoading(true);
      try {
        const supabaseClient = createClient();
        const { data: { user } } = await supabaseClient.auth.getUser();

        if (user) {
          const email = (user.email || "").toLowerCase();
          setUserEmail(email);
          const metaAdmin = user.user_metadata?.is_admin === true;
          const authorized = AUTHORIZED_ADMIN_EMAILS.includes(email) || metaAdmin;
          setIsAdmin(authorized);

          if (!authorized) {
            setLoading(false);
            return;
          }
        } else {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        // 1. Fetch total chats count
        const { count: chatsCount } = await supabaseClient
          .from("chats")
          .select("*", { count: "exact", head: true });
        if (chatsCount !== null) setTotalChats(chatsCount);

        // 2. Fetch all chats with model_used for analytics
        const { data: allChats } = await supabaseClient
          .from("chats")
          .select("model_used, created_at, user_id, title, updated_at")
          .order("created_at", { ascending: false });

        if (allChats && allChats.length > 0) {
          computeModelTraffic(allChats);

          // Seed initial activity feed with recent 10 chats
          const recentChats = allChats.slice(0, 10);
          const initialEvents: ActivityEvent[] = recentChats.map((c) => ({
            id: `init_${c.created_at}_${Math.random()}`,
            type: "chat_created" as const,
            description: `New chat "${(c.title || "Untitled").slice(0, 40)}" using ${modelDisplayName(c.model_used)}`,
            timestamp: c.created_at,
            modelUsed: c.model_used,
          }));
          setActivityFeed(initialEvents);
        }

        // 3. Fetch real users from Auth API
        await fetchRealUsers();

        // 4. REALTIME: Postgres Changes on chats table
        const chatsDbChannel = supabaseClient
          .channel("admin-chats-realtime-v2")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "chats" },
            async (payload) => {
              // Update total chats count
              const { count } = await supabaseClient
                .from("chats")
                .select("*", { count: "exact", head: true });
              if (count !== null) setTotalChats(count);

              // Re-fetch all chats for updated analytics
              const { data: updatedChats } = await supabaseClient
                .from("chats")
                .select("model_used, created_at, user_id, title, updated_at")
                .order("created_at", { ascending: false });

              if (updatedChats) {
                computeModelTraffic(updatedChats);
              }

              // Add activity event
              if (payload.eventType === "INSERT") {
                const newChat = payload.new as { title?: string; model_used?: string; created_at?: string };
                addActivity({
                  id: `evt_${Date.now()}`,
                  type: "chat_created",
                  description: `New chat "${(newChat.title || "Untitled").slice(0, 40)}" using ${modelDisplayName(newChat.model_used || "unknown")}`,
                  timestamp: newChat.created_at || new Date().toISOString(),
                  modelUsed: newChat.model_used,
                });
              } else if (payload.eventType === "DELETE") {
                addActivity({
                  id: `evt_${Date.now()}`,
                  type: "chat_deleted",
                  description: "A chat conversation was deleted",
                  timestamp: new Date().toISOString(),
                });
              } else if (payload.eventType === "UPDATE") {
                const updatedChat = payload.new as { title?: string; model_used?: string };
                addActivity({
                  id: `evt_${Date.now()}`,
                  type: "chat_updated",
                  description: `Chat "${(updatedChat.title || "Untitled").slice(0, 40)}" was updated`,
                  timestamp: new Date().toISOString(),
                  modelUsed: updatedChat.model_used,
                });
              }
            }
          )
          .subscribe();

        // 5. REALTIME: Presence for active online users
        const presenceChannel = supabaseClient.channel("online-presence");
        presenceChannel
          .on("presence", { event: "sync" }, () => {
            const state = presenceChannel.presenceState<PresenceItem>();
            const presences = Object.values(state).flat();
            const count = Math.max(1, presences.length);
            setRealtimeCount(count);

            // Track online user emails
            const emails = new Set<string>();
            presences.forEach((p: PresenceItem) => {
              if (p.email) emails.add(p.email.toLowerCase());
            });
            setOnlineEmails(emails);
          })
          .subscribe();

        return () => {
          supabaseClient.removeChannel(chatsDbChannel);
          supabaseClient.removeChannel(presenceChannel);
        };
      } catch (err) {
        console.warn("Admin check error:", err);
      } finally {
        setLoading(false);
      }
    }

    initAdminDashboard();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Re-compute top users when registeredUsers changes ─────────────
  useEffect(() => {
    if (registeredUsers.length > 0 && topUsers.length > 0) {
      setTopUsers((prev) =>
        prev.map((tu) => {
          const found = registeredUsers.find((u) => u.id === tu.userId);
          if (found) {
            return { ...tu, name: found.name, email: found.email, avatar: found.avatar || getEffectiveAvatarUrl(found.email) };
          }
          return tu;
        })
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registeredUsers]);

  // ─── Announcement Handler ──────────────────────────────────────────
  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;

    playClickSound();
    setBroadcasting(true);
    setBroadcastSuccess(null);

    try {
      const newAnn: Announcement = {
        id: `ann_${Date.now()}`,
        title: annTitle.trim(),
        content: annContent.trim(),
        type: annType,
        createdAt: new Date().toISOString(),
        author: userEmail || "LucidChat Admin",
      };

      await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAnn),
      }).catch(console.warn);

      const supabase = createClient();
      const channel = supabase.channel("global-announcements");
      await channel.subscribe();
      await channel.send({
        type: "broadcast",
        event: "new_announcement",
        payload: newAnn,
      });

      saveAnnouncementLocally(newAnn);

      setBroadcastSuccess("✅ Announcement broadcasted live to all users!");
      setAnnTitle("");
      setAnnContent("");
      setTimeout(() => setBroadcastSuccess(null), 5000);
    } catch (err) {
      console.error("Broadcast failed:", err);
    } finally {
      setBroadcasting(false);
    }
  };

  // ─── Filtered Users ────────────────────────────────────────────────
  const filteredUsers = registeredUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ─── Peak hours max for bar scaling ────────────────────────────────
  const peakMax = Math.max(...peakHours, 1);

  // ═══════════════════════════════════════════════════════════════════
  // ─── LOADING STATE ─────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════
  if (loading) {
    return (
      <div className="min-h-screen bg-[#090a0f] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-white/20 border-t-emerald-400 rounded-full animate-spin mx-auto" />
          <p className="text-xs text-white/50 font-mono">Initializing Admin Control Center...</p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // ─── UNAUTHORIZED ──────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#090a0f] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900/60 border border-red-500/20 rounded-2xl p-8 text-center space-y-5 backdrop-blur-xl">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-lg font-bold text-white">Access Restricted</h1>
            <p className="text-xs text-white/50 leading-relaxed">
              This dashboard is restricted to authorized platform administrators only.
            </p>
          </div>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black font-semibold text-xs shadow-lg hover:bg-white/90 active:scale-95 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Chat</span>
          </Link>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // ─── MAIN ADMIN DASHBOARD ─────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 p-4 sm:p-6 lg:p-8 font-sans antialiased selection:bg-emerald-500/30">
      <div className="max-w-[1400px] mx-auto space-y-6">

        {/* ─── Header ──────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3" /> Admin Verified
              </span>
              <span className="text-xs text-white/40 font-mono">{userEmail}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              LucidChat Control Center
            </h1>
            <p className="text-xs text-white/50">Realtime analytics, user management & broadcast studio</p>
          </div>

          <div className="flex items-center gap-3">
            <FloatingLanguagePicker variant="compact" />
            <Link
              href="/chat"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-medium text-white transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Chat</span>
            </Link>
          </div>
        </div>

        {/* ─── Stats Cards Grid ────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Total Registered Users */}
          <div className="bg-slate-900/50 border border-white/10 p-4 sm:p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-white/60">Registered Users</span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Users className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{totalUsersCount}</span>
              <span className="text-[10px] text-emerald-400 font-medium">users</span>
            </div>
            <p className="text-[10px] text-white/40 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
              <span>From Supabase Auth</span>
            </p>
          </div>

          {/* Realtime Active */}
          <div className="bg-slate-900/50 border border-emerald-500/30 p-4 sm:p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-white/60">Active Online</span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{realtimeCount}</span>
              <span className="text-[10px] text-emerald-400 font-medium">online</span>
            </div>
            <p className="text-[10px] text-white/40">Realtime presence stream</p>
          </div>

          {/* Total Chats */}
          <div className="bg-slate-900/50 border border-white/10 p-4 sm:p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-white/60">Total Chats</span>
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{totalChats}</span>
              <span className="text-[10px] text-purple-400 font-medium">conversations</span>
            </div>
            <p className="text-[10px] text-white/40 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block animate-pulse" />
              <span>Live DB sync</span>
            </p>
          </div>

          {/* AI Models Used */}
          <div className="bg-slate-900/50 border border-white/10 p-4 sm:p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-white/60">AI Models Active</span>
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Zap className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{modelTraffic.length}</span>
              <span className="text-[10px] text-amber-400 font-medium">models</span>
            </div>
            <p className="text-[10px] text-white/40">Distinct models used</p>
          </div>
        </div>

        {/* ─── Row 2: AI Model Traffic + Live Activity Feed ──── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">

          {/* AI Model Traffic (Real from DB) — 3 cols */}
          <div className="lg:col-span-3 bg-slate-900/50 border border-white/10 p-5 sm:p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-amber-400" />
                  <span>AI Model Traffic</span>
                  <span className="text-[10px] text-emerald-400 font-mono ml-1">(Live from DB)</span>
                </h2>
                <p className="text-[10px] text-white/40 mt-0.5">Real usage distribution across all chat conversations</p>
              </div>
            </div>

            <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
              {modelTraffic.length === 0 ? (
                <p className="text-xs text-white/30 text-center py-8">No chat data yet</p>
              ) : (
                modelTraffic.map((m, idx) => (
                  <div key={m.modelId} className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-white/10 font-bold text-[10px] flex items-center justify-center text-white/70">
                          #{idx + 1}
                        </span>
                        <span className="font-bold text-white">{m.displayName}</span>
                        <span className={`px-1.5 py-0.5 rounded-md border text-[9px] font-semibold ${modelBadgeColor(m.modelId)}`}>
                          {m.modelId.split("/")[0] || "custom"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-white/60 font-mono">{m.count} chats</span>
                        <span className="font-extrabold text-emerald-400">{m.percent}%</span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700"
                        style={{ width: `${m.percent}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Live Activity Feed — 2 cols */}
          <div className="lg:col-span-2 bg-slate-900/50 border border-white/10 p-5 sm:p-6 rounded-2xl space-y-4">
            <div className="border-b border-white/10 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>Live Activity Feed</span>
              </h2>
              <p className="text-[10px] text-white/40 mt-0.5">Real-time database events stream</p>
            </div>

            <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
              {activityFeed.length === 0 ? (
                <p className="text-xs text-white/30 text-center py-8">Waiting for events...</p>
              ) : (
                activityFeed.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 flex items-start gap-2.5"
                  >
                    <div className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                      evt.type === "chat_created" ? "bg-emerald-500/10 text-emerald-400" :
                      evt.type === "chat_deleted" ? "bg-red-500/10 text-red-400" :
                      evt.type === "user_joined" ? "bg-blue-500/10 text-blue-400" :
                      "bg-amber-500/10 text-amber-400"
                    }`}>
                      {evt.type === "chat_created" && <Plus className="w-3 h-3" />}
                      {evt.type === "chat_deleted" && <Trash2 className="w-3 h-3" />}
                      {evt.type === "chat_updated" && <RefreshCw className="w-3 h-3" />}
                      {evt.type === "user_joined" && <Users className="w-3 h-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-white/80 leading-relaxed truncate">{evt.description}</p>
                      <p className="text-[10px] text-white/30 mt-0.5">{relativeTime(evt.timestamp)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ─── Row 3: Peak Hours + Provider Analytics + Top Users ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

          {/* Peak Hours Heatmap */}
          <div className="bg-slate-900/50 border border-white/10 p-5 sm:p-6 rounded-2xl space-y-4">
            <div className="border-b border-white/10 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <span>Peak Hours</span>
              </h2>
              <p className="text-[10px] text-white/40 mt-0.5">Chat activity distribution by hour (24h)</p>
            </div>

            <div className="flex items-end gap-[3px] h-28">
              {peakHours.map((count, hour) => {
                const heightPercent = (count / peakMax) * 100;
                const isPeak = count === peakMax && count > 0;
                return (
                  <div key={hour} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div
                      className={`w-full rounded-t-sm transition-all duration-300 ${
                        isPeak ? "bg-emerald-400" : heightPercent > 60 ? "bg-emerald-500/70" : heightPercent > 30 ? "bg-emerald-500/40" : "bg-white/10"
                      }`}
                      style={{ height: `${Math.max(heightPercent, 2)}%` }}
                      title={`${hour}:00 — ${count} chats`}
                    />
                    {hour % 4 === 0 && (
                      <span className="text-[8px] text-white/30 font-mono">{hour}</span>
                    )}
                    {/* Tooltip */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block px-1.5 py-0.5 rounded bg-slate-800 border border-white/10 text-[9px] text-white whitespace-nowrap z-10">
                      {hour}:00 — {count} chats
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Provider Analytics */}
          <div className="bg-slate-900/50 border border-white/10 p-5 sm:p-6 rounded-2xl space-y-4">
            <div className="border-b border-white/10 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-blue-400" />
                <span>Auth Provider Distribution</span>
              </h2>
              <p className="text-[10px] text-white/40 mt-0.5">Sign-up method breakdown</p>
            </div>

            <div className="space-y-4">
              {/* Visual Bar */}
              <div className="flex h-4 rounded-full overflow-hidden bg-white/10">
                {(providerStats.google + providerStats.email) > 0 && (
                  <>
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-700"
                      style={{ width: `${(providerStats.google / (providerStats.google + providerStats.email)) * 100}%` }}
                    />
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700"
                      style={{ width: `${(providerStats.email / (providerStats.google + providerStats.email)) * 100}%` }}
                    />
                  </>
                )}
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[11px] font-semibold text-blue-300">Google</span>
                  </div>
                  <p className="text-xl font-extrabold text-white">{providerStats.google}</p>
                  <p className="text-[10px] text-white/40">
                    {totalUsersCount > 0 ? Math.round((providerStats.google / totalUsersCount) * 100) : 0}% of users
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[11px] font-semibold text-emerald-300">Email</span>
                  </div>
                  <p className="text-xl font-extrabold text-white">{providerStats.email}</p>
                  <p className="text-[10px] text-white/40">
                    {totalUsersCount > 0 ? Math.round((providerStats.email / totalUsersCount) * 100) : 0}% of users
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Active Users Leaderboard */}
          <div className="bg-slate-900/50 border border-white/10 p-5 sm:p-6 rounded-2xl space-y-4">
            <div className="border-b border-white/10 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Top Active Users</span>
              </h2>
              <p className="text-[10px] text-white/40 mt-0.5">Most conversations created</p>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
              {topUsers.length === 0 ? (
                <p className="text-xs text-white/30 text-center py-6">Loading...</p>
              ) : (
                topUsers.map((u, idx) => (
                  <div key={u.userId} className="flex items-center gap-2.5 p-2 rounded-lg bg-white/[0.02] border border-white/5">
                    <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      idx === 0 ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                      idx === 1 ? "bg-slate-400/20 text-slate-300 border border-slate-400/30" :
                      idx === 2 ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" :
                      "bg-white/10 text-white/50"
                    }`}>
                      {idx + 1}
                    </span>
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-6 h-6 rounded-full object-cover bg-slate-800 border border-white/10 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-white truncate">{u.name}</p>
                      <p className="text-[9px] text-white/30 font-mono truncate">{u.email}</p>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-400 shrink-0">{u.chatCount} chats</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ─── Row 4: Announcement Studio + Users Directory ──── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

          {/* Mass Announcement Studio */}
          <div className="lg:col-span-1 bg-slate-900/50 border border-white/10 p-5 sm:p-6 rounded-2xl space-y-4">
            <div className="border-b border-white/10 pb-3 space-y-0.5">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Broadcast Studio</span>
              </h2>
              <p className="text-[10px] text-white/40">Send real-time alerts to all users</p>
            </div>

            {broadcastSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300">
                {broadcastSuccess}
              </div>
            )}

            <form onSubmit={handleSendAnnouncement} className="space-y-3">
              <div>
                <label className="text-[10px] font-medium text-white/60 mb-1 block">Title</label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="e.g. 🚀 Platform Update"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder-white/30 outline-none focus:border-white/30 transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] font-medium text-white/60 mb-1 block">Priority</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: "info", label: "Info", icon: Info, color: "text-cyan-400" },
                    { id: "success", label: "Success", icon: CheckCircle2, color: "text-emerald-400" },
                    { id: "warning", label: "Warning", icon: AlertTriangle, color: "text-amber-400" },
                    { id: "urgent", label: "Urgent", icon: Flame, color: "text-red-400" },
                  ].map((item) => {
                    const IconComp = item.icon;
                    const selected = annType === item.id;
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => setAnnType(item.id as AnnouncementType)}
                        className={`p-1.5 rounded-lg border text-[10px] font-medium flex items-center justify-center gap-1 transition-all ${
                          selected ? `bg-white/10 border-white/20 ${item.color} font-bold` : "bg-white/[0.02] border-white/5 text-white/40 hover:bg-white/[0.05]"
                        }`}
                      >
                        <IconComp className="w-3 h-3" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-medium text-white/60 mb-1 block">Content</label>
                <textarea
                  required
                  rows={3}
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  placeholder="Type broadcast message..."
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder-white/30 outline-none focus:border-white/30 transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={broadcasting}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{broadcasting ? "Broadcasting..." : "Broadcast Announcement"}</span>
              </button>
            </form>
          </div>

          {/* Users Directory (Real from Supabase Auth) */}
          <div className="lg:col-span-2 bg-slate-900/50 border border-white/10 p-5 sm:p-6 rounded-2xl space-y-4 flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>Users Directory</span>
                  <span className="text-[10px] text-emerald-400 font-mono ml-1">(Supabase Auth)</span>
                </h2>
                <p className="text-[10px] text-white/40 mt-0.5">
                  {totalUsersCount} registered users
                  {usersLoading && " — refreshing..."}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-white/40 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="pl-7 pr-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-xs text-white placeholder-white/30 outline-none focus:border-white/30 transition-colors w-full sm:w-48"
                  />
                </div>
                <button
                  onClick={fetchRealUsers}
                  className="p-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all"
                  title="Refresh users"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${usersLoading ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-white/40 uppercase text-[9px] tracking-wider">
                    <th className="py-2 px-2.5 font-semibold">User</th>
                    <th className="py-2 px-2.5 font-semibold">Email</th>
                    <th className="py-2 px-2.5 font-semibold">Provider</th>
                    <th className="py-2 px-2.5 font-semibold">Registered</th>
                    <th className="py-2 px-2.5 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {filteredUsers.map((u) => {
                    const isOnline = onlineEmails.has(u.email.toLowerCase());
                    return (
                      <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-2.5 px-2.5">
                          <div className="flex items-center gap-2">
                            <div className="relative shrink-0">
                              <img
                                src={u.avatar}
                                alt={u.name}
                                className="w-6 h-6 rounded-full object-cover bg-slate-800 border border-white/10"
                              />
                              {isOnline && (
                                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#090a0f]" />
                              )}
                            </div>
                            <span className="font-semibold text-white truncate max-w-[120px] text-[11px]">{u.name}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-2.5 text-white/60 font-mono text-[10px]">{u.email}</td>
                        <td className="py-2.5 px-2.5">
                          {u.provider === "Google" ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-medium">
                              <Globe className="w-2.5 h-2.5" /> Google
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-medium">
                              <Mail className="w-2.5 h-2.5" /> Email
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-2.5 text-white/40 text-[10px] whitespace-nowrap">{u.createdAt}</td>
                        <td className="py-2.5 px-2.5">
                          {isOnline ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online
                            </span>
                          ) : (
                            <span className="text-[9px] text-white/30">Offline</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <p className="text-xs text-white/30 text-center py-6">
                  {searchQuery ? "No users match your search" : "Loading users..."}
                </p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
