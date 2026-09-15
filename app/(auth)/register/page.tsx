"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Check, X, ShieldCheck } from "lucide-react";

interface StrengthRule {
  label: string;
  test: (pw: string) => boolean;
}

const STRENGTH_RULES: StrengthRule[] = [
  { label: "Minimal 8 karakter", test: (pw) => pw.length >= 8 },
  { label: "Huruf besar (A-Z)", test: (pw) => /[A-Z]/.test(pw) },
  { label: "Huruf kecil (a-z)", test: (pw) => /[a-z]/.test(pw) },
  { label: "Angka (0-9)", test: (pw) => /[0-9]/.test(pw) },
  { label: "Simbol (!@#$...)", test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

function getStrengthLevel(score: number): {
  label: string;
  color: string;
  barColor: string;
} {
  if (score <= 1) return { label: "Sangat Lemah", color: "text-red-400", barColor: "bg-red-500" };
  if (score === 2) return { label: "Lemah", color: "text-orange-400", barColor: "bg-orange-500" };
  if (score === 3) return { label: "Sedang", color: "text-amber-400", barColor: "bg-amber-500" };
  if (score === 4) return { label: "Kuat", color: "text-emerald-400", barColor: "bg-emerald-500" };
  return { label: "Sangat Kuat", color: "text-cyan-400", barColor: "bg-cyan-400" };
}

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const supabase = createClient();

  // Password strength
  const strengthScore = useMemo(
    () => STRENGTH_RULES.filter((r) => r.test(password)).length,
    [password]
  );
  const strengthInfo = getStrengthLevel(strengthScore);
  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const canSubmit = strengthScore >= 4 && passwordsMatch && email.length > 0;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message || "Gagal membuat akun. Coba lagi.");
      } else {
        setSuccessMessage("Akun berhasil dibuat! Mengalihkan ke chat...");
        setTimeout(() => {
          window.location.href = "/chat";
        }, 1200);
      }
    } catch {
      setErrorMessage("Terjadi kesalahan saat membuat akun.");
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

      <div className="relative z-10 w-full max-w-[440px] animate-glass-appear">
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
            href="/login"
            className="text-xs text-white/50 hover:text-white transition-colors"
          >
            Sudah punya akun? <span className="text-white font-semibold">Masuk</span>
          </Link>
        </div>

        {/* Register Card */}
        <div className="liquid-glass-elevated p-8 sm:p-9 text-center space-y-6 border border-white/[0.14]">
          {/* Brand */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-[60px] h-[60px] rounded-[18px] bg-white/[0.06] border border-white/[0.14] flex items-center justify-center p-1.5 animate-pulse-glow overflow-hidden">
                <img src="/logo.png" alt="LucidChat Logo" className="w-full h-full object-cover rounded-[12px]" />
              </div>
            </div>
            <div className="space-y-1">
              <h1 className="text-[22px] font-bold tracking-[-0.03em] text-white">Buat Akun Baru</h1>
              <p className="text-[11px] text-white/40 leading-relaxed max-w-[280px]">
                Daftar untuk mengakses semua fitur LucidChat AI Platform
              </p>
            </div>
          </div>

          {/* Error / Success */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 text-left">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 text-left flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              {successMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-4 text-left">
            {/* Email */}
            <div>
              <label className="text-[11px] font-medium text-white/60 mb-1.5 block">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-xs text-white placeholder-white/30 outline-none focus:border-white/40 transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-[11px] font-medium text-white/60 mb-1.5 block">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Buat kata sandi yang kuat"
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

              {/* Password Strength Meter */}
              {password.length > 0 && (
                <div className="mt-3 space-y-2.5 animate-glass-appear">
                  {/* Strength Bar */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                            i <= strengthScore
                              ? strengthInfo.barColor
                              : "bg-white/10"
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`text-[10px] font-semibold ${strengthInfo.color} whitespace-nowrap`}>
                      {strengthInfo.label}
                    </span>
                  </div>

                  {/* Rules Checklist */}
                  <div className="grid grid-cols-1 gap-1">
                    {STRENGTH_RULES.map((rule, idx) => {
                      const passed = rule.test(password);
                      return (
                        <div
                          key={idx}
                          className={`flex items-center gap-2 text-[10px] transition-colors ${
                            passed ? "text-emerald-400" : "text-white/30"
                          }`}
                        >
                          {passed ? (
                            <Check className="w-3 h-3 shrink-0" />
                          ) : (
                            <X className="w-3 h-3 shrink-0" />
                          )}
                          <span>{rule.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-[11px] font-medium text-white/60 mb-1.5 block">
                Konfirmasi Kata Sandi
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi"
                  className={`w-full px-3.5 py-2.5 pr-10 rounded-xl bg-white/[0.06] border text-xs text-white placeholder-white/30 outline-none transition-colors ${
                    passwordsMismatch
                      ? "border-red-500/40 focus:border-red-500/60"
                      : passwordsMatch
                      ? "border-emerald-500/40 focus:border-emerald-500/60"
                      : "border-white/15 focus:border-white/40"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              {passwordsMismatch && (
                <p className="mt-1.5 text-[10px] text-red-400 flex items-center gap-1">
                  <X className="w-3 h-3" />
                  Kata sandi tidak cocok
                </p>
              )}
              {passwordsMatch && (
                <p className="mt-1.5 text-[10px] text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Kata sandi cocok
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!canSubmit || loading}
              className={`w-full py-3 rounded-xl font-semibold text-xs shadow-lg transition-all duration-200 mt-2 ${
                canSubmit
                  ? "bg-white text-black hover:bg-white/90 active:scale-95"
                  : "bg-white/10 text-white/30 cursor-not-allowed"
              }`}
            >
              {loading ? "Memproses..." : "Buat Akun"}
            </button>

            {!canSubmit && password.length > 0 && (
              <p className="text-[10px] text-white/30 text-center">
                {strengthScore < 4
                  ? "Password belum cukup kuat (minimal Kuat)"
                  : !passwordsMatch
                  ? "Konfirmasi password harus cocok"
                  : "Lengkapi semua field"}
              </p>
            )}
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
            <span>Daftar dengan Google</span>
          </button>

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
