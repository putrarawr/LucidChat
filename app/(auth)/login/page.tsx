"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const supabase = createClient();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(
          error.message === "Invalid login credentials"
            ? "Email atau kata sandi salah. Periksa kembali atau buat akun baru."
            : error.message || "Gagal masuk. Periksa email & password Anda."
        );
      } else {
        setSuccessMessage("Berhasil masuk! Mengalihkan...");
        setTimeout(() => {
          window.location.href = "/chat";
        }, 800);
      }
    } catch {
      setErrorMessage("Terjadi kesalahan saat masuk.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[var(--surface-0)]">
      {/* Ambient Background */}
      <div className="bg-orbs" />
      <div className="orb-center" />
      <div className="orb-extra-1" />
      <div className="orb-extra-2" />

      <div className="relative z-10 w-full max-w-[420px] animate-glass-appear">
        {/* Top Nav */}
        <div className="flex items-center justify-between mb-5">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Beranda</span>
          </Link>
          <Link
            href="/register"
            className="text-xs text-white/50 hover:text-white transition-colors"
          >
            Belum punya akun? <span className="text-white font-semibold">Daftar</span>
          </Link>
        </div>

        {/* Login Card */}
        <div className="liquid-glass-elevated p-8 sm:p-9 text-center space-y-6 border border-white/[0.14]">
          {/* Brand Logo */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-[68px] h-[68px] rounded-[20px] bg-white/[0.06] border border-white/[0.14] flex items-center justify-center p-1.5 animate-pulse-glow overflow-hidden">
                <img src="/logo.png" alt="LucidChat Logo" className="w-full h-full object-cover rounded-[14px]" />
              </div>
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-12 h-2 rounded-full bg-white/[0.03] blur-sm" />
            </div>
            <div className="space-y-1">
              <h1 className="text-[24px] font-bold tracking-[-0.03em] text-white">Masuk</h1>
              <p className="text-[12px] text-white/40 leading-relaxed max-w-[260px]">
                Masuk ke akun LucidChat AI Platform
              </p>
            </div>
          </div>

          {/* Error / Success Messages */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 text-left">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 text-left">
              {successMessage}
            </div>
          )}

          {/* Email Login Form */}
          <form onSubmit={handleEmailLogin} className="space-y-3.5 text-left">
            <div>
              <label className="text-[11px] font-medium text-white/60 mb-1.5 block">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-xs text-white placeholder-white/30 outline-none focus:border-white/40 transition-colors"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-white/60 mb-1.5 block">Kata Sandi</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-white/[0.06] border border-white/15 text-xs text-white placeholder-white/30 outline-none focus:border-white/40 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-white text-black font-semibold text-xs shadow-lg hover:bg-white/90 active:scale-95 transition-all duration-200 mt-2"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[10px] text-white/30">atau</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Google OAuth */}
          <button
            onClick={async () => {
              setLoading(true);
              setErrorMessage(null);
              await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                  redirectTo: `${window.location.origin}/auth/callback`,
                },
              });
            }}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-xl bg-white/[0.06] border border-white/15 text-xs text-white font-medium hover:bg-white/10 hover:border-white/25 active:scale-95 transition-all duration-200"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{loading ? "Menghubungkan..." : "Masuk dengan Google"}</span>
          </button>

          {/* Register Link */}
          <div className="pt-1">
            <Link
              href="/register"
              className="text-[11px] text-white/40 hover:text-white transition-colors"
            >
              Belum punya akun? <span className="text-white/70 font-semibold underline underline-offset-2 decoration-white/20 hover:decoration-white/50">Daftar sekarang</span>
            </Link>
          </div>

          {/* Footer */}
          <p className="text-[10px] text-white/20 leading-relaxed">
            Data aman dengan Supabase Row-Level Security
          </p>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
    </div>
  );
}
