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
  Code
} from "lucide-react";
import { playClickSound } from "@/lib/sound";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  onUpdateUserName?: (newName: string) => void;
  userAvatar?: string;
  onUpdateUserAvatar?: (newAvatar: string) => void;
  customSystemPrompt?: string;
  onUpdateCustomSystemPrompt?: (prompt: string) => void;
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
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "persona" | "interface" | "data">("profile");
  
  // Local state for settings form
  const [displayName, setDisplayName] = useState(userName);
  const [avatarUrl, setAvatarUrl] = useState(userAvatar);
  const [systemPrompt, setSystemPrompt] = useState(customSystemPrompt);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [autoOpenPreview, setAutoOpenPreview] = useState(true);
  const [savedNotice, setSavedNotice] = useState(false);

  // Sync props and localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("lucidchat_user_name") || userName;
      const storedAvatar = localStorage.getItem("lucidchat_user_avatar") || userAvatar;
      const storedPrompt = localStorage.getItem("lucidchat_custom_system_prompt") || customSystemPrompt;
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

    if (typeof window !== "undefined") {
      localStorage.setItem("lucidchat_user_name", displayName.trim());
      localStorage.setItem("lucidchat_user_avatar", avatarUrl.trim());
      localStorage.setItem("lucidchat_custom_system_prompt", systemPrompt.trim());
      localStorage.setItem("lucidchat_sound_enabled", soundEnabled ? "true" : "false");
      localStorage.setItem("lucidchat_autoscroll", autoScroll ? "true" : "false");
      localStorage.setItem("lucidchat_auto_code_preview", autoOpenPreview ? "true" : "false");
    }

    if (onUpdateUserName) onUpdateUserName(displayName.trim());
    if (onUpdateUserAvatar) onUpdateUserAvatar(avatarUrl.trim());
    if (onUpdateCustomSystemPrompt) onUpdateCustomSystemPrompt(systemPrompt.trim());

    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
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

      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2000);
    }
  };

  const applyPromptPreset = (presetText: string) => {
    playClickSound();
    setSystemPrompt((prev) => (prev ? `${prev}\n${presetText}` : presetText));
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-2xl animate-fade-in">
      <div className="w-full max-w-2xl rounded-3xl border border-white/20 bg-[#0e0e14]/95 shadow-[0_0_80px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/[0.03]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 border border-white/15 text-white">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wide">Pengaturan Aplikasi & Profil</h3>
              <p className="text-[11px] text-white/50">Atur identitas tampilan, preferensi AI, dan kontrol sistem</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher Bar */}
        <div className="flex items-center gap-1 px-4 pt-3 pb-2 border-b border-white/10 bg-white/[0.01] overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => {
              playClickSound();
              setActiveTab("profile");
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all shrink-0 ${
              activeTab === "profile"
                ? "bg-white/15 text-white border border-white/20 shadow-sm"
                : "text-white/40 hover:text-white/80 hover:bg-white/[0.05]"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profil & Identitas</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playClickSound();
              setActiveTab("persona");
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all shrink-0 ${
              activeTab === "persona"
                ? "bg-white/15 text-white border border-white/20 shadow-sm"
                : "text-white/40 hover:text-white/80 hover:bg-white/[0.05]"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Instruksi AI Global</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playClickSound();
              setActiveTab("interface");
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all shrink-0 ${
              activeTab === "interface"
                ? "bg-white/15 text-white border border-white/20 shadow-sm"
                : "text-white/40 hover:text-white/80 hover:bg-white/[0.05]"
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
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all shrink-0 ${
              activeTab === "data"
                ? "bg-white/15 text-white border border-white/20 shadow-sm"
                : "text-white/40 hover:text-white/80 hover:bg-white/[0.05]"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Manajemen Data</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 scrollbar-thin">
          {/* TAB 1: PROFIL & IDENTITAS */}
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
                  placeholder="Masukkan nama Anda (contoh: Putra, Alex)..."
                  className="w-full bg-white/[0.06] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 outline-none focus:border-white/40 transition-all"
                />
                <p className="text-[10px] text-white/40 mt-1">
                  Nama ini akan ditampilkan pada balasan percakapan dan tersimpan permanen di setiap sesi chat Anda.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/80 mb-1.5">
                  URL Avatar Pengguna (Opsional)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="flex-1 bg-white/[0.06] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 outline-none focus:border-white/40 transition-all"
                  />
                  {avatarUrl && (
                    <div className="w-9 h-9 rounded-xl border border-white/20 overflow-hidden shrink-0 bg-white/5">
                      <img src={avatarUrl} alt="Preview Avatar" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-white/40 mt-1">
                  Masukkan tautan gambar langsung untuk mengganti foto profil bubble chat pengguna.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: INSTRUKSI AI GLOBAL */}
          {activeTab === "persona" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1.5">
                  Instruksi System Tambahan (Global Persona Prompt)
                </label>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={5}
                  placeholder="Contoh: Jawab selalu dalam Bahasa Indonesia terstruktur, gunakan poin-poin penting, dan berikan kode bersih jika diminta..."
                  className="w-full bg-white/[0.06] border border-white/15 rounded-xl p-3 text-xs text-white placeholder-white/30 outline-none focus:border-white/40 transition-all resize-none"
                />
                <p className="text-[10px] text-white/40 mt-1">
                  Instruksi ini akan disisipkan secara otomatis ke seluruh model AI di setiap percakapan.
                </p>
              </div>

              {/* Quick Presets */}
              <div>
                <span className="block text-[11px] font-semibold text-white/50 tracking-wider uppercase mb-2">
                  Preset Instruksi Cepat
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => applyPromptPreset("Jawablah secara singkat, padat, dan langsung pada inti masalah.")}
                    className="text-left p-2.5 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-xs text-white/80 transition-all"
                  >
                    <div className="font-semibold text-white">Ringkas & Direct</div>
                    <div className="text-[10px] text-white/40 mt-0.5">Jawab langsung tanpa pendahuluan panjang</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPromptPreset("Bertindaklah sebagai Senior Code Architect. Berikan kode modular, clean code, dan penjelasan arsitektur.")}
                    className="text-left p-2.5 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-xs text-white/80 transition-all"
                  >
                    <div className="font-semibold text-white">Senior Code Architect</div>
                    <div className="text-[10px] text-white/40 mt-0.5">Fokus pada kualitas kode & arsitektur</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ANTARMUKA & SUARA */}
          {activeTab === "interface" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/10 text-white">
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">Efek Suara UI</h4>
                    <p className="text-[10px] text-white/40">Suara taktil saat mengklik tombol & mengirim pesan</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSoundEnabled((prev) => !prev)}
                  className={`w-11 h-6 rounded-full transition-all duration-200 p-1 relative ${
                    soundEnabled ? "bg-white" : "bg-white/10"
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full transition-transform duration-200 ${
                      soundEnabled ? "translate-x-5 bg-black" : "translate-x-0 bg-white/50"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/10 text-white">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">Auto-Scroll Percakapan</h4>
                    <p className="text-[10px] text-white/40">Geser otomatis ke pesan terbaru saat AI merespons</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoScroll((prev) => !prev)}
                  className={`w-11 h-6 rounded-full transition-all duration-200 p-1 relative ${
                    autoScroll ? "bg-white" : "bg-white/10"
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full transition-transform duration-200 ${
                      autoScroll ? "translate-x-5 bg-black" : "translate-x-0 bg-white/50"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/10 text-white">
                    <Code className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">Preview Kode Otomatis</h4>
                    <p className="text-[10px] text-white/40">Buka panel split saat AI membuatkan kode HTML/JS</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoOpenPreview((prev) => !prev)}
                  className={`w-11 h-6 rounded-full transition-all duration-200 p-1 relative ${
                    autoOpenPreview ? "bg-white" : "bg-white/10"
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full transition-transform duration-200 ${
                      autoOpenPreview ? "translate-x-5 bg-black" : "translate-x-0 bg-white/50"
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: MANAJEMEN DATA */}
          {activeTab === "data" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/10 text-white">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">Penyimpanan & Keamanan Lokal</h4>
                    <p className="text-[10px] text-white/40">Data sesi tersimpan secara terenkripsi di browser Anda</p>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleResetSettings}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs text-white/80 transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Pengaturan</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Bar with Action Buttons */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-white/10 bg-white/[0.03]">
          <div className="flex items-center gap-2">
            {savedNotice && (
              <span className="flex items-center gap-1.5 text-xs text-white font-medium animate-fade-in">
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Pengaturan Tersimpan</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                playClickSound();
                onClose();
              }}
              className="px-4 py-2 rounded-xl text-xs font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handleSaveSettings}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white text-black hover:bg-white/90 shadow-md transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Simpan Pengaturan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
