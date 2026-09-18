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
  LayoutDashboard,
  Megaphone,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { FloatingLanguagePicker } from "@/components/ui/FloatingLanguagePicker";
import { playClickSound } from "@/lib/sound";

const AUTHORIZED_ADMIN_EMAILS = [
  "putrarawr18@gmail.com",
  "uyungoke58@gmail.com",
  "lucidchat18@gmail.com",
];

// ─── Sidebar Pages ───────────────────────────────────────────────────
type AdminPage = "overview" | "traffic" | "users" | "activity" | "broadcast";

const SIDEBAR_ITEMS: { id: AdminPage; label: string; icon: React.ElementType; description: string }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, description: "Stats & analytics" },
  { id: "traffic", label: "AI Traffic", icon: BarChart3, description: "Model usage ranking" },
  { id: "users", label: "Users", icon: Users, description: "User directory" },
  { id: "activity", label: "Activity", icon: Activity, description: "Live event feed" },
  { id: "broadcast", label: "Broadcast", icon: Megaphone, description: "Announcements" },
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

// ─── Helpers ─────────────────────────────────────────────────────────
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
export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<AdminPage>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Core Stats
  const [realtimeCount, setRealtimeCount] = useState<number>(1);
  const [totalChats, setTotalChats] = useState<number>(0);
  const [totalUsersCount, setTotalUsersCount] = useState<number>(0);

  // Users
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUserRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [usersLoading, setUsersLoading] = useState(false);

  // AI Model Traffic
  const [modelTraffic, setModelTraffic] = useState<ModelTrafficItem[]>([]);

  // Activity Feed
  const [activityFeed, setActivityFeed] = useState<ActivityEvent[]>([]);

  // Peak Hours
  const [peakHours, setPeakHours] = useState<number[]>(new Array(24).fill(0));

  // Provider Analytics
  const [providerStats, setProviderStats] = useState({ google: 0, email: 0 });

  // Top Users
  const [topUsers, setTopUsers] = useState<TopUserItem[]>([]);

  // Announcement
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");
  const [annType, setAnnType] = useState<AnnouncementType>("info");
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState<string | null>(null);

  // Online status
  const [onlineEmails, setOnlineEmails] = useState<Set<string>>(new Set());

  // ─── Fetch Real Users ──────────────────────────────────────────────
  const fetchRealUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        const users: RegisteredUserRecord[] = (data.users || []).map((u: {
          id: string; email: string; name: string; avatar: string;
          provider: "Google" | "Email"; createdAt: string; lastSignIn: string | null;
        }) => ({
          id: u.id,
          email: u.email,
          name: u.name,
          avatar: u.avatar || getEffectiveAvatarUrl(u.email),
          provider: u.provider,
          createdAt: new Date(u.createdAt).toLocaleDateString("en-GB", {
            weekday: "short", day: "numeric", month: "short", year: "numeric",
          }),
          lastSignIn: u.lastSignIn,
        }));
        setRegisteredUsers(users);
        setTotalUsersCount(users.length);
        let google = 0, email = 0;
        users.forEach((u: RegisteredUserRecord) => {
          if (u.provider === "Google") google++; else email++;
        });
        setProviderStats({ google, email });
      }
    } catch (err) {
      console.warn("Failed to fetch users:", err);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  // ─── Compute Analytics ─────────────────────────────────────────────
  const computeModelTraffic = useCallback((chats: { model_used: string; created_at: string; user_id: string }[]) => {
    const modelCounts: Record<string, number> = {};
    chats.forEach((c) => { const m = c.model_used || "unknown"; modelCounts[m] = (modelCounts[m] || 0) + 1; });
    const total = chats.length || 1;
    const trafficList: ModelTrafficItem[] = Object.entries(modelCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([modelId, count]) => ({
        modelId, displayName: modelDisplayName(modelId), count,
        percent: Math.round((count / total) * 100),
      }));
    setModelTraffic(trafficList);

    const hours = new Array(24).fill(0);
    chats.forEach((c) => { hours[new Date(c.created_at).getHours()]++; });
    setPeakHours(hours);

    const userChatCounts: Record<string, number> = {};
    chats.forEach((c) => { userChatCounts[c.user_id] = (userChatCounts[c.user_id] || 0) + 1; });
    const sorted = Object.entries(userChatCounts).sort(([, a], [, b]) => b - a).slice(0, 10);
    setTopUsers(sorted.map(([userId, chatCount]) => {
      const found = registeredUsers.find((u) => u.id === userId);
      return {
        userId, email: found?.email || userId.slice(0, 8) + "...",
        name: found?.name || "Unknown User",
        avatar: found?.avatar || getEffectiveAvatarUrl(""), chatCount,
      };
    }));
  }, [registeredUsers]);

  const addActivity = useCallback((event: ActivityEvent) => {
    setActivityFeed((prev) => [event, ...prev].slice(0, 50));
  }, []);

  // ─── Init ──────────────────────────────────────────────────────────
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
          if (!authorized) { setLoading(false); return; }
        } else { setIsAdmin(false); setLoading(false); return; }

        const { count: chatsCount } = await supabaseClient.from("chats").select("*", { count: "exact", head: true });
        if (chatsCount !== null) setTotalChats(chatsCount);

        const { data: allChats } = await supabaseClient
          .from("chats").select("model_used, created_at, user_id, title, updated_at")
          .order("created_at", { ascending: false });

        if (allChats && allChats.length > 0) {
          computeModelTraffic(allChats);
          const recentChats = allChats.slice(0, 15);
          setActivityFeed(recentChats.map((c) => ({
            id: `init_${c.created_at}_${Math.random()}`,
            type: "chat_created" as const,
            description: `New chat "${(c.title || "Untitled").slice(0, 50)}" · ${modelDisplayName(c.model_used)}`,
            timestamp: c.created_at, modelUsed: c.model_used,
          })));
        }

        await fetchRealUsers();

        // Realtime: chats
        const chatsDbChannel = supabaseClient.channel("admin-chats-realtime-v3")
          .on("postgres_changes", { event: "*", schema: "public", table: "chats" }, async (payload) => {
            const { count } = await supabaseClient.from("chats").select("*", { count: "exact", head: true });
            if (count !== null) setTotalChats(count);
            const { data: updatedChats } = await supabaseClient.from("chats")
              .select("model_used, created_at, user_id, title, updated_at")
              .order("created_at", { ascending: false });
            if (updatedChats) computeModelTraffic(updatedChats);

            if (payload.eventType === "INSERT") {
              const nc = payload.new as { title?: string; model_used?: string; created_at?: string };
              addActivity({ id: `evt_${Date.now()}`, type: "chat_created",
                description: `New chat "${(nc.title || "Untitled").slice(0, 50)}" · ${modelDisplayName(nc.model_used || "unknown")}`,
                timestamp: nc.created_at || new Date().toISOString(), modelUsed: nc.model_used });
            } else if (payload.eventType === "DELETE") {
              addActivity({ id: `evt_${Date.now()}`, type: "chat_deleted",
                description: "A conversation was deleted", timestamp: new Date().toISOString() });
            } else if (payload.eventType === "UPDATE") {
              const uc = payload.new as { title?: string; model_used?: string };
              addActivity({ id: `evt_${Date.now()}`, type: "chat_updated",
                description: `Chat "${(uc.title || "Untitled").slice(0, 50)}" updated`,
                timestamp: new Date().toISOString(), modelUsed: uc.model_used });
            }
          }).subscribe();

        // Realtime: presence
        const presenceChannel = supabaseClient.channel("online-presence");
        presenceChannel.on("presence", { event: "sync" }, () => {
          const state = presenceChannel.presenceState<PresenceItem>();
          const presences = Object.values(state).flat();
          setRealtimeCount(Math.max(1, presences.length));
          const emails = new Set<string>();
          presences.forEach((p: PresenceItem) => { if (p.email) emails.add(p.email.toLowerCase()); });
          setOnlineEmails(emails);
        }).subscribe();

        return () => {
          supabaseClient.removeChannel(chatsDbChannel);
          supabaseClient.removeChannel(presenceChannel);
        };
      } catch (err) { console.warn("Admin init error:", err);
      } finally { setLoading(false); }
    }
    initAdminDashboard();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (registeredUsers.length > 0 && topUsers.length > 0) {
      setTopUsers((prev) => prev.map((tu) => {
        const found = registeredUsers.find((u) => u.id === tu.userId);
        return found ? { ...tu, name: found.name, email: found.email, avatar: found.avatar || getEffectiveAvatarUrl(found.email) } : tu;
      }));
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
        id: `ann_${Date.now()}`, title: annTitle.trim(), content: annContent.trim(),
        type: annType, createdAt: new Date().toISOString(), author: userEmail || "LucidChat Admin",
      };
      await fetch("/api/announcements", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newAnn) }).catch(console.warn);
      const supabase = createClient();
      const channel = supabase.channel("global-announcements");
      await channel.subscribe();
      await channel.send({ type: "broadcast", event: "new_announcement", payload: newAnn });
      saveAnnouncementLocally(newAnn);
      setBroadcastSuccess("✅ Announcement broadcasted live!");
      setAnnTitle(""); setAnnContent("");
      setTimeout(() => setBroadcastSuccess(null), 5000);
    } catch (err) { console.error("Broadcast failed:", err);
    } finally { setBroadcasting(false); }
  };

  const filteredUsers = registeredUsers.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const peakMax = Math.max(...peakHours, 1);

  // ─── Loading / Unauthorized ────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#090a0f] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-white/20 border-t-emerald-400 rounded-full animate-spin mx-auto" />
          <p className="text-xs text-white/50 font-mono">Initializing Control Center...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#090a0f] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900/60 border border-red-500/20 rounded-2xl p-8 text-center space-y-5 backdrop-blur-xl">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-bold text-white">Access Restricted</h1>
          <p className="text-xs text-white/50">This dashboard is restricted to authorized administrators.</p>
          <Link href="/chat" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black font-semibold text-xs">
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Chat
          </Link>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // ─── MAIN LAYOUT: SIDEBAR + CONTENT ───────────────────────────────
  // ═══════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex font-sans antialiased selection:bg-emerald-500/30">

      {/* ═══ Mobile Overlay ═══ */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ═══ SIDEBAR ═══ */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen w-[240px] shrink-0
        bg-[#0c0d14] border-r border-white/[0.06]
        flex flex-col transition-transform duration-300 ease-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        {/* Sidebar Header */}
        <div className="px-5 pt-5 pb-4 border-b border-white/[0.06]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white leading-tight">LucidChat</h1>
                <p className="text-[10px] text-white/40 font-mono">Control Center</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded-lg text-white/40 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Stats Mini Cards */}
        <div className="px-4 py-3 border-b border-white/[0.06] space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-white/50 font-medium">Live Stats</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-2 text-center">
              <p className="text-sm font-extrabold text-white">{totalUsersCount}</p>
              <p className="text-[8px] text-white/40 uppercase tracking-wider">Users</p>
            </div>
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-2 text-center">
              <p className="text-sm font-extrabold text-emerald-400">{realtimeCount}</p>
              <p className="text-[8px] text-emerald-400/60 uppercase tracking-wider">Online</p>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-2 text-center">
              <p className="text-sm font-extrabold text-white">{totalChats}</p>
              <p className="text-[8px] text-white/40 uppercase tracking-wider">Chats</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          <p className="px-2 text-[9px] uppercase tracking-widest text-white/30 font-semibold mb-2">Navigation</p>
          {SIDEBAR_ITEMS.map((item) => {
            const IconComp = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActivePage(item.id); setSidebarOpen(false); playClickSound(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group ${
                  isActive
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-white"
                    : "text-white/50 hover:bg-white/[0.04] hover:text-white/80 border border-transparent"
                }`}
              >
                <IconComp className={`w-4 h-4 shrink-0 ${isActive ? "text-emerald-400" : "text-white/40 group-hover:text-white/60"}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold ${isActive ? "text-white" : ""}`}>{item.label}</p>
                  <p className="text-[9px] text-white/30 truncate">{item.description}</p>
                </div>
                {isActive && <ChevronRight className="w-3 h-3 text-emerald-400/60 shrink-0" />}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="px-4 py-3 border-t border-white/[0.06] space-y-2">
          <div className="flex items-center gap-2 px-1">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-[10px] font-bold">
              {(userEmail || "A")[0].toUpperCase()}
            </div>
            <p className="text-[10px] text-white/50 font-mono truncate flex-1">{userEmail}</p>
          </div>
          <div className="flex gap-1.5">
            <FloatingLanguagePicker variant="compact" />
            <Link href="/chat"
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/10 border border-white/[0.06] text-[10px] font-medium text-white/60 hover:text-white transition-all"
            >
              <ArrowLeft className="w-3 h-3" /> Chat
            </Link>
          </div>
        </div>
      </aside>

      {/* ═══ MAIN CONTENT AREA ═══ */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {/* Mobile Top Bar */}
        <div className="lg:hidden sticky top-0 z-30 bg-[#090a0f]/95 backdrop-blur-xl border-b border-white/[0.06] px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg bg-white/[0.05] text-white/60">
            <Menu className="w-4 h-4" />
          </button>
          <h2 className="text-sm font-bold text-white capitalize">{activePage}</h2>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-emerald-400 font-mono">{realtimeCount} online</span>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 max-w-[1200px]">

          {/* ═══════════════════════════════════════════════════════ */}
          {/* PAGE: OVERVIEW */}
          {/* ═══════════════════════════════════════════════════════ */}
          {activePage === "overview" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Dashboard Overview</h2>
                <p className="text-xs text-white/40 mt-0.5">Real-time platform analytics at a glance</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard label="Registered Users" value={totalUsersCount} suffix="users" icon={Users} color="emerald" pulse />
                <StatCard label="Active Online" value={realtimeCount} suffix="online" icon={Radio} color="emerald" pulse />
                <StatCard label="Total Chats" value={totalChats} suffix="conversations" icon={MessageSquare} color="purple" pulse />
                <StatCard label="AI Models Active" value={modelTraffic.length} suffix="models" icon={Zap} color="amber" />
              </div>

              {/* 2-col: Peak Hours + Provider Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Peak Hours */}
                <div className="bg-slate-900/50 border border-white/[0.06] p-5 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <h3 className="text-sm font-bold text-white">Peak Hours</h3>
                    <span className="text-[9px] text-white/30 font-mono ml-auto">24h distribution</span>
                  </div>
                  <div className="flex items-end gap-[3px] h-24">
                    {peakHours.map((count, hour) => {
                      const pct = (count / peakMax) * 100;
                      const isPeak = count === peakMax && count > 0;
                      return (
                        <div key={hour} className="flex-1 flex flex-col items-center gap-1 group relative">
                          <div
                            className={`w-full rounded-t-sm transition-all ${
                              isPeak ? "bg-emerald-400" : pct > 60 ? "bg-emerald-500/70" : pct > 30 ? "bg-emerald-500/40" : "bg-white/10"
                            }`}
                            style={{ height: `${Math.max(pct, 3)}%` }}
                          />
                          {hour % 6 === 0 && <span className="text-[7px] text-white/25 font-mono">{hour}</span>}
                          <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block px-1.5 py-0.5 rounded bg-slate-800 border border-white/10 text-[8px] text-white whitespace-nowrap z-10">
                            {hour}:00 — {count}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Provider Analytics */}
                <div className="bg-slate-900/50 border border-white/[0.06] p-5 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-blue-400" />
                    <h3 className="text-sm font-bold text-white">Auth Providers</h3>
                  </div>
                  <div className="flex h-3 rounded-full overflow-hidden bg-white/10">
                    {(providerStats.google + providerStats.email) > 0 && (
                      <>
                        <div className="bg-blue-500 transition-all duration-700" style={{ width: `${(providerStats.google / (providerStats.google + providerStats.email)) * 100}%` }} />
                        <div className="bg-emerald-500 transition-all duration-700" style={{ width: `${(providerStats.email / (providerStats.google + providerStats.email)) * 100}%` }} />
                      </>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Globe className="w-3 h-3 text-blue-400" />
                        <span className="text-[10px] font-semibold text-blue-300">Google</span>
                      </div>
                      <p className="text-lg font-extrabold text-white">{providerStats.google}</p>
                      <p className="text-[9px] text-white/40">{totalUsersCount > 0 ? Math.round((providerStats.google / totalUsersCount) * 100) : 0}%</p>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Mail className="w-3 h-3 text-emerald-400" />
                        <span className="text-[10px] font-semibold text-emerald-300">Email</span>
                      </div>
                      <p className="text-lg font-extrabold text-white">{providerStats.email}</p>
                      <p className="text-[9px] text-white/40">{totalUsersCount > 0 ? Math.round((providerStats.email / totalUsersCount) * 100) : 0}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Active Users */}
              <div className="bg-slate-900/50 border border-white/[0.06] p-5 rounded-2xl space-y-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">Top Active Users</h3>
                  <span className="text-[9px] text-white/30 font-mono ml-auto">by chat count</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                  {topUsers.length === 0 ? (
                    <p className="text-xs text-white/30 col-span-full text-center py-4">Loading...</p>
                  ) : (
                    topUsers.slice(0, 10).map((u, idx) => (
                      <div key={u.userId} className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold shrink-0 ${
                          idx === 0 ? "bg-amber-500/20 text-amber-400" : idx === 1 ? "bg-slate-400/20 text-slate-300" : idx === 2 ? "bg-orange-500/20 text-orange-400" : "bg-white/10 text-white/40"
                        }`}>{idx + 1}</span>
                        <img src={u.avatar} alt="" className="w-5 h-5 rounded-full object-cover bg-slate-800 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-semibold text-white truncate">{u.name}</p>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-400 shrink-0">{u.chatCount}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════ */}
          {/* PAGE: AI TRAFFIC */}
          {/* ═══════════════════════════════════════════════════════ */}
          {activePage === "traffic" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-amber-400" /> AI Model Traffic
                </h2>
                <p className="text-xs text-white/40 mt-0.5">Real usage distribution from database — updates live</p>
              </div>

              {/* Summary badges */}
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-[11px] text-white/60">
                  <strong className="text-white">{totalChats}</strong> total conversations
                </span>
                <span className="px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-[11px] text-white/60">
                  <strong className="text-white">{modelTraffic.length}</strong> distinct models used
                </span>
                {modelTraffic[0] && (
                  <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400">
                    🏆 Most popular: <strong>{modelTraffic[0].displayName}</strong>
                  </span>
                )}
              </div>

              {/* Traffic List */}
              <div className="space-y-2">
                {modelTraffic.length === 0 ? (
                  <p className="text-xs text-white/30 text-center py-12">No chat data yet</p>
                ) : (
                  modelTraffic.map((m, idx) => (
                    <div key={m.modelId} className="bg-slate-900/50 border border-white/[0.06] p-4 rounded-xl flex items-center gap-4">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                        idx === 0 ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                        idx === 1 ? "bg-slate-400/20 text-slate-300 border border-slate-400/30" :
                        idx === 2 ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" :
                        "bg-white/10 text-white/40 border border-white/10"
                      }`}>#{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-sm font-bold text-white">{m.displayName}</span>
                          <span className={`px-1.5 py-0.5 rounded-md border text-[9px] font-semibold ${modelBadgeColor(m.modelId)}`}>
                            {m.modelId.split("/")[0]}
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700"
                            style={{ width: `${m.percent}%` }} />
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-extrabold text-emerald-400">{m.percent}%</p>
                        <p className="text-[10px] text-white/40 font-mono">{m.count} chats</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════ */}
          {/* PAGE: USERS */}
          {/* ═══════════════════════════════════════════════════════ */}
          {activePage === "users" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-400" /> Users Directory
                  </h2>
                  <p className="text-xs text-white/40 mt-0.5">{totalUsersCount} registered from Supabase Auth {usersLoading && "— refreshing..."}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-white/40 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search name or email..."
                      className="pl-7 pr-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.06] text-xs text-white placeholder-white/30 outline-none focus:border-white/20 w-full sm:w-56" />
                  </div>
                  <button onClick={fetchRealUsers}
                    className="p-1.5 rounded-lg bg-white/[0.05] border border-white/[0.06] text-white/50 hover:text-white hover:bg-white/10 transition-all"
                    title="Refresh">
                    <RefreshCw className={`w-3.5 h-3.5 ${usersLoading ? "animate-spin" : ""}`} />
                  </button>
                </div>
              </div>

              <div className="bg-slate-900/50 border border-white/[0.06] rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/[0.06] bg-white/[0.02] text-white/40 uppercase text-[9px] tracking-wider">
                        <th className="py-3 px-4 font-semibold">User</th>
                        <th className="py-3 px-4 font-semibold">Email</th>
                        <th className="py-3 px-4 font-semibold">Provider</th>
                        <th className="py-3 px-4 font-semibold">Registered</th>
                        <th className="py-3 px-4 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {filteredUsers.map((u) => {
                        const isOnline = onlineEmails.has(u.email.toLowerCase());
                        return (
                          <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className="relative shrink-0">
                                  <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover bg-slate-800 border border-white/10" />
                                  {isOnline && <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0c0d14]" />}
                                </div>
                                <span className="font-semibold text-white text-[11px] truncate max-w-[140px]">{u.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-white/60 font-mono text-[10px]">{u.email}</td>
                            <td className="py-3 px-4">
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
                            <td className="py-3 px-4 text-white/40 text-[10px] whitespace-nowrap">{u.createdAt}</td>
                            <td className="py-3 px-4">
                              {isOnline ? (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-semibold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online
                                </span>
                              ) : (
                                <span className="text-[9px] text-white/25">Offline</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {filteredUsers.length === 0 && (
                    <p className="text-xs text-white/30 text-center py-8">{searchQuery ? "No matches" : "Loading users..."}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════ */}
          {/* PAGE: ACTIVITY */}
          {/* ═══════════════════════════════════════════════════════ */}
          {activePage === "activity" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" /> Live Activity Feed
                </h2>
                <p className="text-xs text-white/40 mt-0.5">Real-time database events — auto-updates without refresh</p>
              </div>

              <div className="space-y-2">
                {activityFeed.length === 0 ? (
                  <div className="text-center py-16">
                    <Activity className="w-8 h-8 text-white/10 mx-auto mb-3" />
                    <p className="text-xs text-white/30">Waiting for events...</p>
                  </div>
                ) : (
                  activityFeed.map((evt) => (
                    <div key={evt.id} className="bg-slate-900/50 border border-white/[0.06] p-3.5 rounded-xl flex items-start gap-3">
                      <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        evt.type === "chat_created" ? "bg-emerald-500/10 text-emerald-400" :
                        evt.type === "chat_deleted" ? "bg-red-500/10 text-red-400" :
                        evt.type === "user_joined" ? "bg-blue-500/10 text-blue-400" :
                        "bg-amber-500/10 text-amber-400"
                      }`}>
                        {evt.type === "chat_created" && <Plus className="w-3.5 h-3.5" />}
                        {evt.type === "chat_deleted" && <Trash2 className="w-3.5 h-3.5" />}
                        {evt.type === "chat_updated" && <RefreshCw className="w-3.5 h-3.5" />}
                        {evt.type === "user_joined" && <Users className="w-3.5 h-3.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/80 leading-relaxed">{evt.description}</p>
                        <p className="text-[10px] text-white/30 mt-0.5">{relativeTime(evt.timestamp)}</p>
                      </div>
                      {evt.modelUsed && (
                        <span className={`px-1.5 py-0.5 rounded-md border text-[8px] font-semibold shrink-0 ${modelBadgeColor(evt.modelUsed)}`}>
                          {modelDisplayName(evt.modelUsed).split(" ").slice(0, 2).join(" ")}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════ */}
          {/* PAGE: BROADCAST */}
          {/* ═══════════════════════════════════════════════════════ */}
          {activePage === "broadcast" && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-emerald-400" /> Broadcast Studio
                </h2>
                <p className="text-xs text-white/40 mt-0.5">Send real-time announcements to all online & visiting users</p>
              </div>

              <div className="bg-slate-900/50 border border-white/[0.06] p-6 rounded-2xl space-y-5">
                {broadcastSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                    {broadcastSuccess}
                  </div>
                )}

                <form onSubmit={handleSendAnnouncement} className="space-y-4">
                  <div>
                    <label className="text-[11px] font-medium text-white/60 mb-1.5 block">Title</label>
                    <input type="text" required value={annTitle} onChange={(e) => setAnnTitle(e.target.value)}
                      placeholder="e.g. 🚀 Platform Update"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.06] text-sm text-white placeholder-white/30 outline-none focus:border-white/20 transition-colors" />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-white/60 mb-1.5 block">Priority Level</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: "info", label: "Info", icon: Info, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
                        { id: "success", label: "Success", icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
                        { id: "warning", label: "Warning", icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
                        { id: "urgent", label: "Urgent", icon: Flame, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
                      ].map((item) => {
                        const IconComp = item.icon;
                        const selected = annType === item.id;
                        return (
                          <button type="button" key={item.id}
                            onClick={() => setAnnType(item.id as AnnouncementType)}
                            className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all ${
                              selected ? `${item.bg} ${item.color} font-bold` : "bg-white/[0.02] border-white/[0.06] text-white/40 hover:bg-white/[0.05]"
                            }`}>
                            <IconComp className="w-4 h-4" />
                            <span className="text-[10px]">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-white/60 mb-1.5 block">Content</label>
                    <textarea required rows={4} value={annContent} onChange={(e) => setAnnContent(e.target.value)}
                      placeholder="Type your broadcast message here..."
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.06] text-sm text-white placeholder-white/30 outline-none focus:border-white/20 transition-colors resize-none" />
                  </div>

                  <button type="submit" disabled={broadcasting}
                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" />
                    <span>{broadcasting ? "Broadcasting..." : "Broadcast to All Users"}</span>
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

// ─── Reusable Stat Card ──────────────────────────────────────────────
function StatCard({ label, value, suffix, icon: Icon, color, pulse }: {
  label: string; value: number; suffix: string;
  icon: React.ElementType; color: "emerald" | "purple" | "amber"; pulse?: boolean;
}) {
  const colors = {
    emerald: { card: "border-emerald-500/20", icon: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", text: "text-emerald-400", dot: "bg-emerald-400" },
    purple: { card: "border-white/[0.06]", icon: "bg-purple-500/10 text-purple-400 border-purple-500/20", text: "text-purple-400", dot: "bg-purple-400" },
    amber: { card: "border-white/[0.06]", icon: "bg-amber-500/10 text-amber-400 border-amber-500/20", text: "text-amber-400", dot: "bg-amber-400" },
  }[color];

  return (
    <div className={`bg-slate-900/50 border ${colors.card} p-4 rounded-2xl space-y-2`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium text-white/50">{label}</span>
        <div className={`p-1.5 rounded-lg border ${colors.icon}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-extrabold text-white">{value}</span>
        <span className={`text-[10px] font-medium ${colors.text}`}>{suffix}</span>
      </div>
      {pulse && (
        <p className="text-[9px] text-white/30 flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} animate-pulse`} /> Live
        </p>
      )}
    </div>
  );
}
