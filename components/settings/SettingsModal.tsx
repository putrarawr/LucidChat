"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  User,
  Sliders,
  Volume2,
  VolumeX,
  Shield,
  X,
  Check,
  RotateCcw,
  MessageSquare,
  Code,
  Globe,
  Bug,
  Mail,
  ExternalLink,
  Key,
  Zap,
  Cpu,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { playClickSound } from "@/lib/sound";
import { useI18n } from "@/lib/i18n/I18nContext";

import { FloatingLanguagePicker } from "@/components/ui/FloatingLanguagePicker";

import { createClient } from "@/lib/supabase/client";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  onUpdateUserName?: (newName: string) => void;
  userAvatar?: string;
  onUpdateUserAvatar?: (newAvatar: string) => void;
  customSystemPrompt?: string;
  onUpdateCustomSystemPrompt?: (prompt: string) => void;
  onSaveSuccess?: (message: string) => void;
  initialTab?: "profile" | "persona" | "interface" | "byok" | "data" | "support";
}

export function SettingsModal({
  isOpen,
  onClose,
  userName = "",
  onUpdateUserName,
  userAvatar = "",
  onUpdateUserAvatar,
  customSystemPrompt = "",
  onUpdateCustomSystemPrompt,
  onSaveSuccess,
  initialTab,
}: SettingsModalProps) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<"profile" | "persona" | "interface" | "byok" | "data" | "support">(initialTab || "profile");

  const [displayName, setDisplayName] = useState(userName);
  const [avatarUrl, setAvatarUrl] = useState(userAvatar);
  const [systemPrompt, setSystemPrompt] = useState(customSystemPrompt);
  const [userBio, setUserBio] = useState("");
  const [responsePref, setResponsePref] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [autoOpenPreview, setAutoOpenPreview] = useState(true);

  // BYOK Custom Keys & Endpoint State
  const [openRouterKey, setOpenRouterKey] = useState("");
  const [groqKey, setGroqKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [customEndpointUrl, setCustomEndpointUrl] = useState("");
  const [customEndpointKey, setCustomEndpointKey] = useState("");

  // BYOK UI States
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const [quotaInfo, setQuotaInfo] = useState<{ used: number; max: number; resetInMs: number }>({
    used: 0,
    max: 50,
    resetInMs: 0,
  });

  useEffect(() => {
    if (isOpen) {
      if (initialTab) {
        setActiveTab(initialTab);
      }
      setDisplayName(userName);
      setAvatarUrl(userAvatar);
      setSystemPrompt(customSystemPrompt);

      if (typeof window !== "undefined") {
        const storedSound = localStorage.getItem("lucidchat_sound_enabled") !== "false";
        const storedScroll = localStorage.getItem("lucidchat_autoscroll") !== "false";
        const storedPreview = localStorage.getItem("lucidchat_auto_code_preview") !== "false";
        setSoundEnabled(storedSound);
        setAutoScroll(storedScroll);
        setAutoOpenPreview(storedPreview);

        // Load User Memory
        setUserBio(localStorage.getItem("lucidchat_user_bio") || "");
        setResponsePref(localStorage.getItem("lucidchat_user_response_pref") || "");

        // Load BYOK Keys
        setOpenRouterKey(localStorage.getItem("lucidchat_custom_openrouter_key") || "");
        setGroqKey(localStorage.getItem("lucidchat_custom_groq_key") || "");
        setGeminiKey(localStorage.getItem("lucidchat_custom_gemini_key") || "");
        setCustomEndpointUrl(localStorage.getItem("lucidchat_custom_base_url") || "");
        setCustomEndpointKey(localStorage.getItem("lucidchat_custom_endpoint_key") || "");
      }

      // Fetch current quota status
      fetch("/api/user/quota")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.quota) {
            setQuotaInfo(data.quota);
          }
        })
        .catch(() => {});
    }
  }, [isOpen, userName, userAvatar, customSystemPrompt, initialTab]);


  if (!isOpen) return null;

  const handleTestKey = async (provider: string, apiKey: string, baseUrl?: string) => {
    if (!apiKey.trim() && provider !== "custom") return;
    playClickSound();
    setTestingProvider(provider);
    setTestResults((prev) => {
      const next = { ...prev };
      delete next[provider];
      return next;
    });

    try {
      const res = await fetch("/api/byok/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, apiKey: apiKey.trim(), baseUrl: baseUrl?.trim() }),
      });
      const data = await res.json();
      setTestResults((prev) => ({
        ...prev,
        [provider]: {
          success: Boolean(data.success),
          message: data.message || data.error || (data.success ? "Koneksi berhasil!" : "Gagal terhubung."),
        },
      }));
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setTestResults((prev) => ({
        ...prev,
        [provider]: {
          success: false,
          message: `Network error: ${errMsg}`,
        },
      }));
    } finally {
      setTestingProvider(null);
    }
  };

  const handleSaveSettings = async () => {
    playClickSound();

    const trimmedName = displayName.trim();
    const trimmedAvatar = avatarUrl.trim();
    const trimmedPrompt = systemPrompt.trim();
    const trimmedBio = userBio.trim();
    const trimmedPref = responsePref.trim();

    // Synthesize personalized system prompt with User Memory
    const promptSections: string[] = [];
    if (trimmedBio) promptSections.push(`[PROFIL PENGGUNA & LATAR BELAKANG]\n${trimmedBio}`);
    if (trimmedPref) promptSections.push(`[PREFERENSI GAYA RESPON]\n${trimmedPref}`);
    if (trimmedPrompt) promptSections.push(`[INSTRUKSI KHUSUS]\n${trimmedPrompt}`);
    const finalPrompt = promptSections.length > 0 ? promptSections.join("\n\n") : trimmedPrompt;

    if (onUpdateUserName) onUpdateUserName(trimmedName);
    if (onUpdateUserAvatar) onUpdateUserAvatar(trimmedAvatar);
    if (onUpdateCustomSystemPrompt) onUpdateCustomSystemPrompt(finalPrompt);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (typeof window !== "undefined") {
        if (user) {
          localStorage.setItem(`lucidchat_${user.id}_user_name`, trimmedName);
          localStorage.setItem(`lucidchat_${user.id}_user_avatar`, trimmedAvatar);
          localStorage.setItem(`lucidchat_${user.id}_custom_system_prompt`, finalPrompt);
        }
        localStorage.setItem("lucidchat_user_bio", trimmedBio);
        localStorage.setItem("lucidchat_user_response_pref", trimmedPref);
        localStorage.setItem("lucidchat_sound_enabled", soundEnabled ? "true" : "false");
        localStorage.setItem("lucidchat_autoscroll", autoScroll ? "true" : "false");
        localStorage.setItem("lucidchat_auto_code_preview", autoOpenPreview ? "true" : "false");

        // Save BYOK Keys
        localStorage.setItem("lucidchat_custom_openrouter_key", openRouterKey.trim());
        localStorage.setItem("lucidchat_custom_groq_key", groqKey.trim());
        localStorage.setItem("lucidchat_custom_gemini_key", geminiKey.trim());
        localStorage.setItem("lucidchat_custom_base_url", customEndpointUrl.trim());
        localStorage.setItem("lucidchat_custom_endpoint_key", customEndpointKey.trim());

        if (user) {
          await supabase.auth.updateUser({
            data: {
              full_name: trimmedName,
              display_name: trimmedName,
              avatar_url: trimmedAvatar,
              picture: trimmedAvatar,
            },
          });
        }
      }
    } catch (e) {
      console.warn("Could not sync user metadata:", e);
    }

    if (onSaveSuccess) {
      onSaveSuccess(t("settings.saveSuccess", "Settings saved successfully"));
    }

    onClose();
  };

  const handleResetSettings = () => {
    playClickSound();
    if (confirm(t("settings.confirmReset", "Are you sure you want to restore all settings to defaults?"))) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("lucidchat_user_name");
        localStorage.removeItem("lucidchat_user_avatar");
        localStorage.removeItem("lucidchat_custom_system_prompt");
        localStorage.setItem("lucidchat_sound_enabled", "true");
        localStorage.setItem("lucidchat_autoscroll", "true");
        localStorage.setItem("lucidchat_auto_code_preview", "true");
      }

      setDisplayName("");
      setAvatarUrl("");
      setSystemPrompt("");
      setSoundEnabled(true);
      setAutoScroll(true);
      setAutoOpenPreview(true);

      if (onUpdateUserName) onUpdateUserName("");
      if (onUpdateUserAvatar) onUpdateUserAvatar("");
      if (onUpdateCustomSystemPrompt) onUpdateCustomSystemPrompt("");

      if (onSaveSuccess) {
        onSaveSuccess(t("settings.saveSuccess", "Settings saved successfully"));
      }

      onClose();
    }
  };

  const applyPromptPreset = (presetText: string) => {
    playClickSound();
    setSystemPrompt((prev) => (prev ? `${prev}\n${presetText}` : presetText));
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#0a0a0e] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <Settings className="w-4 h-4 text-white/70" />
            <h3 className="text-sm font-semibold text-white tracking-wide">{t("settings.title", "Application Settings")}</h3>
          </div>
          <button
            type="button"
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="p-1 rounded-lg text-white/40 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Minimal Tab Switcher Bar */}
        <div className="flex items-center gap-4 px-5 pt-3 pb-2 border-b border-white/10 text-xs font-medium overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => {
              playClickSound();
              setActiveTab("profile");
            }}
            className={`flex items-center gap-1.5 py-1.5 transition-all border-b-2 ${
              activeTab === "profile"
                ? "border-white text-white font-semibold"
                : "border-transparent text-white/40 hover:text-white/80"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{t("settings.profileTab", "User Profile")}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playClickSound();
              setActiveTab("persona");
            }}
            className={`flex items-center gap-1.5 py-1.5 transition-all border-b-2 ${
              activeTab === "persona"
                ? "border-white text-white font-semibold"
                : "border-transparent text-white/40 hover:text-white/80"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{t("settings.personaTab", "Custom AI Persona")}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playClickSound();
              setActiveTab("interface");
            }}
            className={`flex items-center gap-1.5 py-1.5 transition-all border-b-2 ${
              activeTab === "interface"
                ? "border-white text-white font-semibold"
                : "border-transparent text-white/40 hover:text-white/80"
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{t("settings.interfaceTab", "Interface & Sound")}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playClickSound();
              setActiveTab("byok");
            }}
            className={`flex items-center gap-1.5 py-1.5 transition-all border-b-2 ${
              activeTab === "byok"
                ? "border-amber-400 text-amber-300 font-semibold"
                : "border-transparent text-white/40 hover:text-white/80"
            }`}
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>API Keys & BYOK</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playClickSound();
              setActiveTab("data");
            }}
            className={`flex items-center gap-1.5 py-1.5 transition-all border-b-2 ${
              activeTab === "data"
                ? "border-white text-white font-semibold"
                : "border-transparent text-white/40 hover:text-white/80"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{t("settings.dataTab", "Data & Privacy")}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playClickSound();
              setActiveTab("support");
            }}
            className={`flex items-center gap-1.5 py-1.5 transition-all border-b-2 ${
              activeTab === "support"
                ? "border-white text-white font-semibold"
                : "border-transparent text-white/40 hover:text-white/80"
            }`}
          >
            <Bug className="w-3.5 h-3.5 text-rose-400" />
            <span>{t("settings.supportTab", "Developer & Bug Report")}</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 scrollbar-thin">
          {/* TAB 1: PROFIL */}
          {activeTab === "profile" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1.5">
                  {t("settings.displayName", "Display Name")}
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={t("settings.displayNamePlaceholder", "Enter your display name...")}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/30 outline-none focus:border-white/30 transition-all"
                />
                <p className="text-[10px] text-white/40 mt-1">
                  {t("settings.displayNameHint", "This name will be saved permanently in your browser and used for your chat profile.")}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/80 mb-1.5">
                  {t("settings.avatarUrl", "Avatar / Profile Picture URL")}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder={t("settings.avatarUrlPlaceholder", "https://...")}
                    className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/30 outline-none focus:border-white/30 transition-all"
                  />
                  {avatarUrl && (
                    <div className="w-8 h-8 rounded-xl border border-white/15 overflow-hidden shrink-0 bg-white/5">
                      <img src={avatarUrl} alt="Preview Avatar" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PERSONA & MEMORI PENGGUNA */}
          {activeTab === "persona" && (
            <div className="space-y-4">
              {/* Field 1: User Context Memory */}
              <div>
                <label className="block text-xs font-semibold text-white/90 mb-1">
                  1. Tentang Anda (User Context Memory)
                </label>
                <p className="text-[10px] text-white/40 mb-1.5">
                  Informasi latar belakang yang ingin Anda agar AI ingat secara permanen di setiap percakapan.
                </p>
                <textarea
                  value={userBio}
                  onChange={(e) => setUserBio(e.target.value)}
                  rows={2}
                  placeholder="Contoh: Saya siswa SMK jurusan RPL di Bondowoso, sedang PKL, fokus pada Fullstack Next.js & TypeScript..."
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-white/30 outline-none focus:border-white/30 transition-all resize-none"
                />
              </div>

              {/* Field 2: Response Style */}
              <div>
                <label className="block text-xs font-semibold text-white/90 mb-1">
                  2. Gaya Respon Favorit (Preferred Response Style)
                </label>
                <p className="text-[10px] text-white/40 mb-1.5">
                  Bagaimana Anda ingin AI merespons gaya bicara dan format jawabannya.
                </p>
                <textarea
                  value={responsePref}
                  onChange={(e) => setResponsePref(e.target.value)}
                  rows={2}
                  placeholder="Contoh: Bahasa Indonesia santai dan lugas, to the point, kode lengkap tanpa singkatan, jelaskan error secara terstruktur..."
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-white/30 outline-none focus:border-white/30 transition-all resize-none"
                />
              </div>

              {/* Field 3: Advanced System Prompt */}
              <div>
                <label className="block text-xs font-semibold text-white/90 mb-1">
                  3. Instruksi Persona Tambahan (Advanced Prompt)
                </label>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={3}
                  placeholder={t("settings.systemPromptPlaceholder", "Contoh: Bertindaklah sebagai Lead Software Architect yang berpengalaman...")}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-white/30 outline-none focus:border-white/30 transition-all resize-none"
                />
              </div>

              <div>
                <span className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">
                  {t("chat.presetQuick", "Quick Presets")}
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setResponsePref("Jawab secara padat, ringkas, langsung ke intisari, dan hindari basa-basi.");
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-xs text-white/80 transition-all cursor-pointer"
                  >
                    ⚡ Ringkas & To-the-Point
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSystemPrompt("Bertindaklah sebagai Senior Software Architect & Security Engineer. Terapkan Clean Architecture dan kode defensif.");
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-xs text-white/80 transition-all cursor-pointer"
                  >
                    🛠️ Senior Architect
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setResponsePref("Jelaskan setiap konsep langkah-demi-langkah seperti tutorial praktis dengan analogi sederhana.");
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-xs text-white/80 transition-all cursor-pointer"
                  >
                    📚 Guru / Mentor Edukatif
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ANTARMUKA & SUARA */}
          {activeTab === "interface" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10">
                <div className="flex items-center gap-2.5">
                  {soundEnabled ? <Volume2 className="w-4 h-4 text-white/70" /> : <VolumeX className="w-4 h-4 text-white/40" />}
                  <div>
                    <h4 className="text-xs font-semibold text-white">{t("settings.soundEffects", "Interactive Sound Effects")}</h4>
                    <p className="text-[10px] text-white/40">{t("settings.soundEffectsDesc", "Play audio cues for message send, button clicks, and AI completion")}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSoundEnabled((prev) => !prev)}
                  className={`w-9 h-5 rounded-full transition-all duration-200 p-0.5 relative ${
                    soundEnabled ? "bg-white" : "bg-white/10"
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full transition-transform duration-200 ${
                      soundEnabled ? "translate-x-4 bg-black" : "translate-x-0 bg-white/50"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10">
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4 text-white/70" />
                  <div>
                    <h4 className="text-xs font-semibold text-white">{t("settings.autoScroll", "Auto Scroll Messages")}</h4>
                    <p className="text-[10px] text-white/40">{t("settings.autoScrollDesc", "Automatically scroll to bottom while AI streams responses")}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoScroll((prev) => !prev)}
                  className={`w-9 h-5 rounded-full transition-all duration-200 p-0.5 relative ${
                    autoScroll ? "bg-white" : "bg-white/10"
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full transition-transform duration-200 ${
                      autoScroll ? "translate-x-4 bg-black" : "translate-x-0 bg-white/50"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10">
                <div className="flex items-center gap-2.5">
                  <Code className="w-4 h-4 text-white/70" />
                  <div>
                    <h4 className="text-xs font-semibold text-white">{t("settings.autoCodePreview", "Auto Open Code Preview")}</h4>
                    <p className="text-[10px] text-white/40">{t("settings.autoCodePreviewDesc", "Automatically open code preview tab when AI outputs HTML/CSS")}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoOpenPreview((prev) => !prev)}
                  className={`w-9 h-5 rounded-full transition-all duration-200 p-0.5 relative ${
                    autoOpenPreview ? "bg-white" : "bg-white/10"
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full transition-transform duration-200 ${
                      autoOpenPreview ? "translate-x-4 bg-black" : "translate-x-0 bg-white/50"
                    }`}
                  />
                </button>
              </div>

              {/* Language Selector Card (i18n Multi-Language Grid) */}
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-amber-300" />
                  <div>
                    <h4 className="text-xs font-semibold text-white">{t("settings.language", "Interface Language")}</h4>
                    <p className="text-[10px] text-white/40">{t("settings.languageDesc", "Choose display language for LucidChat platform")}</p>
                  </div>
                </div>

                <FloatingLanguagePicker variant="grid" className="pt-2" />
              </div>
            </div>
          )}

          {/* TAB 4: API KEYS & BYOK (Bring Your Own Key) */}
          {activeTab === "byok" && (
            <div className="space-y-4">
              {/* Daily Quota Status Card */}
              <div className="p-4 rounded-xl border border-white/12 bg-gradient-to-br from-white/[0.05] to-white/[0.02] space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2 text-white">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Kuota Server Gratis Hari Ini</span>
                  </div>
                  <span className="text-white/80 font-mono text-[11px] px-2 py-0.5 rounded-md bg-white/10">
                    {quotaInfo.used} / {quotaInfo.max} Chat
                  </span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      quotaInfo.used >= quotaInfo.max ? "bg-rose-500" : "bg-emerald-400"
                    }`}
                    style={{ width: `${Math.min(100, (quotaInfo.used / quotaInfo.max) * 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-white/60 leading-relaxed">
                  💡 <strong>Bypass Kuota &amp; Anti Rate-Limit:</strong> Pasang API Key gratis milik Anda di bawah untuk menikmati <strong>Akses Unlimited tanpa Batas Harian</strong> dan respons lebih cepat langsung dari provider!
                </p>
              </div>

              {/* Interactive Free API Key Guide Accordion */}
              <div className="rounded-xl border border-amber-400/20 bg-amber-500/[0.04] p-3.5 space-y-3">
                <div
                  onClick={() => setIsGuideOpen(!isGuideOpen)}
                  className="flex items-center justify-between cursor-pointer select-none group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-300">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <span>Panduan Dapatkan API Key Gratis</span>
                        <span className="text-[10px] font-medium px-1.5 py-0.5 bg-amber-400/20 text-amber-200 rounded-full">100% Free • No CC</span>
                      </h5>
                      <p className="text-[10px] text-white/50">Langkah mudah membuat key pribadi tanpa kartu kredit dalam 1 menit</p>
                    </div>
                  </div>
                  <button type="button" className="text-white/40 group-hover:text-white transition-colors">
                    {isGuideOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {isGuideOpen && (
                  <div className="space-y-3 pt-2 border-t border-amber-400/15 text-xs text-white/80">
                    {/* Step 1: Gemini */}
                    <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 space-y-1.5">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <span className="font-semibold text-white flex items-center gap-1.5 text-xs">
                          <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 text-[10px] flex items-center justify-center font-bold">1</span>
                          Google Gemini (AI Studio) - Paling Direkomendasikan
                        </span>
                        <a
                          href="https://aistudio.google.com/app/apikey"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 hover:underline font-medium"
                        >
                          <span>Buka Google AI Studio</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <ol className="text-[11px] text-white/60 space-y-1 list-decimal list-inside pl-1 leading-relaxed">
                        <li>Buka <strong>aistudio.google.com/app/apikey</strong> lalu login dengan akun Google Anda.</li>
                        <li>Klik tombol <strong>&quot;Create API Key&quot;</strong> (pilih Google Cloud project baru atau default).</li>
                        <li>Salin API Key (diawali <code className="text-blue-300 bg-white/5 px-1 rounded font-mono">AIzaSy...</code>) dan tempel pada input Google Gemini di bawah.</li>
                      </ol>
                      <p className="text-[10px] text-emerald-400 font-medium pt-0.5">
                        ✨ Keuntungan: Bypass server limit &amp; kuota gratis pribadi dari Google setiap hari.
                      </p>
                    </div>

                    {/* Step 2: Groq */}
                    <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 space-y-1.5">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <span className="font-semibold text-white flex items-center gap-1.5 text-xs">
                          <span className="w-4 h-4 rounded-full bg-orange-500/20 text-orange-400 text-[10px] flex items-center justify-center font-bold">2</span>
                          Groq Cloud - Kecepatan Kilat (300+ token/detik)
                        </span>
                        <a
                          href="https://console.groq.com/keys"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[11px] text-orange-400 hover:text-orange-300 hover:underline font-medium"
                        >
                          <span>Buka Groq Console</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <ol className="text-[11px] text-white/60 space-y-1 list-decimal list-inside pl-1 leading-relaxed">
                        <li>Buka <strong>console.groq.com/keys</strong> lalu daftar/login dengan akun Google atau GitHub.</li>
                        <li>Klik <strong>&quot;Create API Key&quot;</strong>, beri nama misalnya &quot;LucidChat&quot;, lalu klik Submit.</li>
                        <li>Salin kuncinya (diawali <code className="text-orange-300 bg-white/5 px-1 rounded font-mono">gsk_...</code>) dan tempel pada input Groq di bawah.</li>
                      </ol>
                      <p className="text-[10px] text-emerald-400 font-medium pt-0.5">
                        ⚡ Keuntungan: Sangat cepat (Qwen 3.8 / Llama 3.3) &amp; kuota hingga 14.400 request per hari tanpa biaya.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* API Keys Form Fields */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-white tracking-wide flex items-center gap-2">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>Kunci API Pribadi (Bring Your Own Key)</span>
                </h4>

                {/* Google Gemini */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-white/90 flex items-center gap-1.5">
                      <span>Google Gemini API Key</span>
                      <span className="text-[10px] text-emerald-400 font-semibold px-1.5 py-0.2 bg-emerald-500/10 rounded">Rekomendasi</span>
                    </label>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <span>Dapatkan Gratis</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="relative flex-1">
                      <input
                        type={showKeys["gemini"] ? "text" : "password"}
                        value={geminiKey}
                        onChange={(e) => setGeminiKey(e.target.value)}
                        placeholder="AIzaSy... (atau GCP key)"
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-3.5 pr-8 py-2 text-xs text-white placeholder-white/30 outline-none focus:border-amber-400/60 font-mono transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKeys((p) => ({ ...p, gemini: !p["gemini"] }))}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                        title={showKeys["gemini"] ? "Sembunyikan" : "Tampilkan"}
                      >
                        {showKeys["gemini"] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTestKey("gemini", geminiKey)}
                      disabled={!geminiKey.trim() || testingProvider === "gemini"}
                      className="px-3 py-2 rounded-xl text-xs font-medium bg-white/[0.08] hover:bg-white/15 disabled:opacity-40 disabled:cursor-not-allowed text-white/90 border border-white/10 transition-all flex items-center gap-1.5 shrink-0"
                    >
                      {testingProvider === "gemini" ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                      ) : (
                        <span>Uji Kunci</span>
                      )}
                    </button>
                  </div>
                  {testResults["gemini"] && (
                    <div className={`text-[11px] p-2 rounded-lg flex items-center gap-1.5 ${
                      testResults["gemini"].success ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20" : "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                    }`}>
                      {testResults["gemini"].success ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                      <span className="leading-tight">{testResults["gemini"].message}</span>
                    </div>
                  )}
                </div>

                {/* Groq API Key */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-white/90 flex items-center gap-1.5">
                      <span>Groq API Key</span>
                      <span className="text-[10px] text-amber-400 font-semibold px-1.5 py-0.2 bg-amber-500/10 rounded">Ultra Cepat</span>
                    </label>
                    <a
                      href="https://console.groq.com/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-orange-400 hover:underline flex items-center gap-1"
                    >
                      <span>Dapatkan Gratis</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="relative flex-1">
                      <input
                        type={showKeys["groq"] ? "text" : "password"}
                        value={groqKey}
                        onChange={(e) => setGroqKey(e.target.value)}
                        placeholder="gsk_..."
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-3.5 pr-8 py-2 text-xs text-white placeholder-white/30 outline-none focus:border-amber-400/60 font-mono transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKeys((p) => ({ ...p, groq: !p["groq"] }))}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                        title={showKeys["groq"] ? "Sembunyikan" : "Tampilkan"}
                      >
                        {showKeys["groq"] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTestKey("groq", groqKey)}
                      disabled={!groqKey.trim() || testingProvider === "groq"}
                      className="px-3 py-2 rounded-xl text-xs font-medium bg-white/[0.08] hover:bg-white/15 disabled:opacity-40 disabled:cursor-not-allowed text-white/90 border border-white/10 transition-all flex items-center gap-1.5 shrink-0"
                    >
                      {testingProvider === "groq" ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                      ) : (
                        <span>Uji Kunci</span>
                      )}
                    </button>
                  </div>
                  {testResults["groq"] && (
                    <div className={`text-[11px] p-2 rounded-lg flex items-center gap-1.5 ${
                      testResults["groq"].success ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20" : "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                    }`}>
                      {testResults["groq"].success ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                      <span className="leading-tight">{testResults["groq"].message}</span>
                    </div>
                  )}
                </div>

                {/* OpenRouter API Key */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-white/90">
                      OpenRouter API Key
                    </label>
                    <a
                      href="https://openrouter.ai/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-white/50 hover:underline flex items-center gap-1"
                    >
                      <span>openrouter.ai/keys</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="relative flex-1">
                      <input
                        type={showKeys["openrouter"] ? "text" : "password"}
                        value={openRouterKey}
                        onChange={(e) => setOpenRouterKey(e.target.value)}
                        placeholder="sk-or-v1-..."
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-3.5 pr-8 py-2 text-xs text-white placeholder-white/30 outline-none focus:border-amber-400/60 font-mono transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKeys((p) => ({ ...p, openrouter: !p["openrouter"] }))}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                        title={showKeys["openrouter"] ? "Sembunyikan" : "Tampilkan"}
                      >
                        {showKeys["openrouter"] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTestKey("openrouter", openRouterKey)}
                      disabled={!openRouterKey.trim() || testingProvider === "openrouter"}
                      className="px-3 py-2 rounded-xl text-xs font-medium bg-white/[0.08] hover:bg-white/15 disabled:opacity-40 disabled:cursor-not-allowed text-white/90 border border-white/10 transition-all flex items-center gap-1.5 shrink-0"
                    >
                      {testingProvider === "openrouter" ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                      ) : (
                        <span>Uji Kunci</span>
                      )}
                    </button>
                  </div>
                  {testResults["openrouter"] && (
                    <div className={`text-[11px] p-2 rounded-lg flex items-center gap-1.5 ${
                      testResults["openrouter"].success ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20" : "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                    }`}>
                      {testResults["openrouter"].success ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                      <span className="leading-tight">{testResults["openrouter"].message}</span>
                    </div>
                  )}
                </div>

                {/* Custom OpenAI-Compatible BaseURL */}
                <div className="pt-3 border-t border-white/10 space-y-3">
                  <h4 className="text-xs font-bold text-white tracking-wide flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Custom AI Endpoint / Proxy (Ollama / LiteLLM / Custom Server)</span>
                  </h4>

                  <div>
                    <label className="block text-xs font-medium text-white/80 mb-1">
                      Custom OpenAI BaseURL
                    </label>
                    <input
                      type="text"
                      value={customEndpointUrl}
                      onChange={(e) => setCustomEndpointUrl(e.target.value)}
                      placeholder="http://localhost:11434/v1 atau https://api.proxy.com/v1"
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/30 outline-none focus:border-emerald-400/60 font-mono transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/80 mb-1">
                      Custom Endpoint API Key (Optional)
                    </label>
                    <div className="flex items-center gap-1.5">
                      <div className="relative flex-1">
                        <input
                          type={showKeys["custom"] ? "text" : "password"}
                          value={customEndpointKey}
                          onChange={(e) => setCustomEndpointKey(e.target.value)}
                          placeholder="Custom API Key jika diperlukan..."
                          className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-3.5 pr-8 py-2 text-xs text-white placeholder-white/30 outline-none focus:border-emerald-400/60 font-mono transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowKeys((p) => ({ ...p, custom: !p["custom"] }))}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                          title={showKeys["custom"] ? "Sembunyikan" : "Tampilkan"}
                        >
                          {showKeys["custom"] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleTestKey("custom", customEndpointKey, customEndpointUrl)}
                        disabled={!customEndpointUrl.trim() || testingProvider === "custom"}
                        className="px-3 py-2 rounded-xl text-xs font-medium bg-white/[0.08] hover:bg-white/15 disabled:opacity-40 disabled:cursor-not-allowed text-white/90 border border-white/10 transition-all flex items-center gap-1.5 shrink-0"
                      >
                        {testingProvider === "custom" ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                        ) : (
                          <span>Uji Endpoint</span>
                        )}
                      </button>
                    </div>
                    {testResults["custom"] && (
                      <div className={`mt-1.5 text-[11px] p-2 rounded-lg flex items-center gap-1.5 ${
                        testResults["custom"].success ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20" : "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                      }`}>
                        {testResults["custom"].success ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                        <span className="leading-tight">{testResults["custom"].message}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* TAB 5: DATA */}
          {activeTab === "data" && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-white/70" />
                  <h4 className="text-xs font-semibold text-white">{t("settings.localDataTitle", "Local Storage")}</h4>
                </div>
                <p className="text-[10px] text-white/40">
                  {t("settings.localDataDesc", "Session data and user preferences are safely stored in your browser.")}
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleResetSettings}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/10 text-xs text-white/80 transition-all border border-white/10"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{t("settings.resetDefault", "Reset Defaults")}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DEVELOPER & BUG REPORT */}
          {activeTab === "support" && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
                    <Bug className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      {t("settings.reportBugTitle", "Report Bug & Feedback")}
                    </h4>
                    <p className="text-[10px] text-white/50">
                      {t("settings.reportBugDesc", "Found a bug or have feature suggestions? Contact the developer directly via Email or open an issue on GitHub.")}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 pt-2">
                  {/* EMAIL CARD */}
                  <a
                    href="mailto:putrarawr18@gmail.com"
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/80 group-hover:scale-105 transition-transform">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-white/40 block">Email Direct Contact</span>
                        <span className="text-xs font-semibold text-white font-mono">putrarawr18@gmail.com</span>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-white/30 group-hover:text-white transition-colors" />
                  </a>

                  {/* GITHUB REPO CARD */}
                  <a
                    href="https://github.com/putrarawr/LucidChat"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/80 group-hover:scale-105 transition-transform">
                        <GithubIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-white/40 block">GitHub Repository & Issues</span>
                        <span className="text-xs font-semibold text-white font-mono">github.com/putrarawr/LucidChat</span>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-white/30 group-hover:text-white transition-colors" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-white/10 bg-white/[0.02]">
          <button
            type="button"
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            {t("sidebar.cancel", "Cancel")}
          </button>
          <button
            type="button"
            onClick={handleSaveSettings}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-white text-black hover:bg-white/90 shadow-sm transition-all"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{t("settings.saveChanges", "Save Settings")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}
