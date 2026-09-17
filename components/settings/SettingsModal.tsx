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
  const { lang, setLang, t } = useI18n();
  const [activeTab, setActiveTab] = useState<"profile" | "persona" | "interface" | "data" | "support">("profile");

  const [displayName, setDisplayName] = useState(userName);
  const [avatarUrl, setAvatarUrl] = useState(userAvatar);
  const [systemPrompt, setSystemPrompt] = useState(customSystemPrompt);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [autoOpenPreview, setAutoOpenPreview] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("lucidchat_user_name") ?? userName;
      const storedAvatar = localStorage.getItem("lucidchat_user_avatar") ?? userAvatar;
      const storedPrompt = localStorage.getItem("lucidchat_custom_system_prompt") ?? customSystemPrompt;
      const storedSound = localStorage.getItem("lucidchat_sound_enabled") !== "false";
      const storedScroll = localStorage.getItem("lucidchat_autoscroll") !== "false";
      const storedPreview = localStorage.getItem("lucidchat_auto_code_preview") !== "false";

      setDisplayName(storedName);
      setAvatarUrl(storedAvatar);
      setSystemPrompt(storedPrompt);
      setSoundEnabled(storedSound);
      setAutoScroll(storedScroll);
      setAutoOpenPreview(storedPreview);
    }
  }, [isOpen, userName, userAvatar, customSystemPrompt]);

  if (!isOpen) return null;

  const handleSaveSettings = () => {
    playClickSound();

    const trimmedName = displayName.trim();
    const trimmedAvatar = avatarUrl.trim();
    const trimmedPrompt = systemPrompt.trim();

    if (typeof window !== "undefined") {
      localStorage.setItem("lucidchat_user_name", trimmedName);
      localStorage.setItem("lucidchat_user_avatar", trimmedAvatar);
      localStorage.setItem("lucidchat_custom_system_prompt", trimmedPrompt);
      localStorage.setItem("lucidchat_sound_enabled", soundEnabled ? "true" : "false");
      localStorage.setItem("lucidchat_autoscroll", autoScroll ? "true" : "false");
      localStorage.setItem("lucidchat_auto_code_preview", autoOpenPreview ? "true" : "false");
    }

    if (onUpdateUserName) onUpdateUserName(trimmedName);
    if (onUpdateUserAvatar) onUpdateUserAvatar(trimmedAvatar);
    if (onUpdateCustomSystemPrompt) onUpdateCustomSystemPrompt(trimmedPrompt);

    if (onSaveSuccess) {
      onSaveSuccess(t("settings.saveSuccess", "Pengaturan berhasil disimpan"));
    }

    onClose();
  };

  const handleResetSettings = () => {
    playClickSound();
    if (confirm("Apakah Anda yakin ingin mengembalikan semua pengaturan ke default?")) {
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
        onSaveSuccess("Pengaturan berhasil di-reset");
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
            <h3 className="text-sm font-semibold text-white tracking-wide">Pengaturan</h3>
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
            <span>Profil</span>
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
            <span>Instruksi AI</span>
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
            <span>Antarmuka & Suara</span>
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
            <span>Data</span>
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
            <span>{t("settings.supportTab", "Pengembang & Lapor Bug")}</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 scrollbar-thin">
          {/* TAB 1: PROFIL */}
          {activeTab === "profile" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1.5">
                  Nama Tampilan (Display Name)
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Masukkan nama Anda (contoh: Putra)..."
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/30 outline-none focus:border-white/30 transition-all"
                />
                <p className="text-[10px] text-white/40 mt-1">
                  Nama ini akan tersimpan permanen di browser Anda dan digunakan untuk profil bubble chat.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/80 mb-1.5">
                  URL Avatar (Opsional)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
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
                  Instruksi System Tambahan (Global Persona Prompt)
                </label>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={4}
                  placeholder="Jawab selalu dalam Bahasa Indonesia terstruktur, berikan contoh kode bersih jika diminta..."
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-white/30 outline-none focus:border-white/30 transition-all resize-none"
                />
                <p className="text-[10px] text-white/40 mt-1">
                  Instruksi ini disisipkan ke seluruh model AI secara otomatis.
                </p>
              </div>

              <div>
                <span className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">
                  Preset Cepat
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => applyPromptPreset("Jawablah secara singkat, padat, dan langsung pada inti masalah.")}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-xs text-white/80 transition-all"
                  >
                    Ringkas & Direct
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPromptPreset("Bertindaklah sebagai Senior Code Architect. Berikan kode modular, clean code, dan penjelasan terstruktur.")}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-xs text-white/80 transition-all"
                  >
                    Senior Code Architect
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
                    <h4 className="text-xs font-semibold text-white">Efek Suara UI</h4>
                    <p className="text-[10px] text-white/40">Suara klik tombol & audio kirim pesan</p>
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
                    <h4 className="text-xs font-semibold text-white">Auto-Scroll Percakapan</h4>
                    <p className="text-[10px] text-white/40">Geser otomatis ke pesan terbaru saat AI merespons</p>
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
                    <h4 className="text-xs font-semibold text-white">{t("settings.autoCodePreview", "Preview Kode Otomatis")}</h4>
                    <p className="text-[10px] text-white/40">{t("settings.autoCodePreviewDesc", "Buka panel split saat AI membuatkan kode HTML/JS")}</p>
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

              {/* Language Selector Card (i18n) */}
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-amber-300" />
                  <div>
                    <h4 className="text-xs font-semibold text-white">{t("settings.language", "Bahasa Antarmuka (Language)")}</h4>
                    <p className="text-[10px] text-white/40">{t("settings.languageDesc", "Pilih bahasa tampilan platform LucidChat")}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setLang("id");
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all border ${
                      lang === "id"
                        ? "bg-white/15 border-white/30 text-white shadow-sm"
                        : "bg-white/[0.03] border-white/10 text-zinc-400 hover:text-white hover:bg-white/[0.06]"
                    }`}
                  >
                    <span>🇮🇩 Bahasa Indonesia</span>
                    {lang === "id" && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setLang("en");
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all border ${
                      lang === "en"
                        ? "bg-white/15 border-white/30 text-white shadow-sm"
                        : "bg-white/[0.03] border-white/10 text-zinc-400 hover:text-white hover:bg-white/[0.06]"
                    }`}
                  >
                    <span>🇬🇧 English</span>
                    {lang === "en" && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DATA */}
          {activeTab === "data" && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-white/70" />
                  <h4 className="text-xs font-semibold text-white">Penyimpanan Lokal</h4>
                </div>
                <p className="text-[10px] text-white/40">
                  Data sesi dan preferensi pengguna tersimpan secara aman di peramban browser Anda.
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleResetSettings}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/10 text-xs text-white/80 transition-all border border-white/10"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Pengaturan</span>
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
                      {t("settings.reportBugTitle", "Lapor Bug & Beri Saran")}
                    </h4>
                    <p className="text-[10px] text-white/50">
                      {t("settings.reportBugDesc", "Punya saran fitur atau menemukan kendala teknis? Hubungi pengembang langsung via Email atau buat issue di GitHub.")}
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
            Batal
          </button>
          <button
            type="button"
            onClick={handleSaveSettings}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-white text-black hover:bg-white/90 shadow-sm transition-all"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Simpan Pengaturan</span>
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
