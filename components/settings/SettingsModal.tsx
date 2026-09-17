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
}: SettingsModalProps) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<"profile" | "persona" | "interface" | "data" | "support">("profile");

  const [displayName, setDisplayName] = useState(userName);
  const [avatarUrl, setAvatarUrl] = useState(userAvatar);
  const [systemPrompt, setSystemPrompt] = useState(customSystemPrompt);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [autoOpenPreview, setAutoOpenPreview] = useState(true);

  useEffect(() => {
    if (isOpen) {
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
      }
    }
  }, [isOpen, userName, userAvatar, customSystemPrompt]);

  if (!isOpen) return null;

  const handleSaveSettings = async () => {
    playClickSound();

    const trimmedName = displayName.trim();
    const trimmedAvatar = avatarUrl.trim();
    const trimmedPrompt = systemPrompt.trim();

    if (onUpdateUserName) onUpdateUserName(trimmedName);
    if (onUpdateUserAvatar) onUpdateUserAvatar(trimmedAvatar);
    if (onUpdateCustomSystemPrompt) onUpdateCustomSystemPrompt(trimmedPrompt);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user && typeof window !== "undefined") {
        localStorage.setItem(`lucidchat_${user.id}_user_name`, trimmedName);
        localStorage.setItem(`lucidchat_${user.id}_user_avatar`, trimmedAvatar);
        localStorage.setItem(`lucidchat_${user.id}_custom_system_prompt`, trimmedPrompt);
        localStorage.setItem("lucidchat_sound_enabled", soundEnabled ? "true" : "false");
        localStorage.setItem("lucidchat_autoscroll", autoScroll ? "true" : "false");
        localStorage.setItem("lucidchat_auto_code_preview", autoOpenPreview ? "true" : "false");

        await supabase.auth.updateUser({
          data: {
            full_name: trimmedName,
            display_name: trimmedName,
            avatar_url: trimmedAvatar,
            picture: trimmedAvatar,
          },
        });
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

          {/* TAB 2: INSTRUKSI AI */}
          {activeTab === "persona" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1.5">
                  {t("settings.systemPrompt", "Custom System Prompt (Lucid Persona)")}
                </label>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={4}
                  placeholder={t("settings.systemPromptPlaceholder", "Example: Always answer politely, concisely, with step-by-step code samples...")}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-white/30 outline-none focus:border-white/30 transition-all resize-none"
                />
                <p className="text-[10px] text-white/40 mt-1">
                  {t("settings.systemPromptHint", "This instruction will be appended to every AI chat session.")}
                </p>
              </div>

              <div>
                <span className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">
                  {t("chat.presetQuick", "Quick Presets")}
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => applyPromptPreset("Answer concisely, clearly, and get straight to the point.")}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-xs text-white/80 transition-all"
                  >
                    {t("settings.presetShort", "Concise & Direct")}
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPromptPreset("Act as a Senior Code Architect. Provide clean, modular code with clear explanations.")}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-xs text-white/80 transition-all"
                  >
                    {t("settings.presetArchitect", "Senior Code Architect")}
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

          {/* TAB 4: DATA */}
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
