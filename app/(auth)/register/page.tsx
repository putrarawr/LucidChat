"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, ShieldCheck, Check, X } from "lucide-react";
import GoogleOneTap from "@/components/auth/GoogleOneTap";

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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        if (error.message?.toLowerCase().includes("already registered")) {
          setErrorMessage("Email ini sudah terdaftar. Silakan login atau gunakan email lain.");
        } else {
          setErrorMessage(error.message || "Gagal membuat akun. Coba lagi.");
        }
      } else if (data?.user?.identities?.length === 0) {
        // User already exists in Supabase but tried to sign up again
        setErrorMessage("Email ini sudah terdaftar. Silakan login atau gunakan email lain.");
      } else if (data?.session) {
        // Auto-confirm mode (no email verification required) — redirect immediately
        setSuccessMessage("Akun berhasil dibuat! Mengalihkan ke chat...");
        setTimeout(() => {
          window.location.href = "/chat";
        }, 1200);
      } else {
        // Email confirmation required — show verification message
        setSuccessMessage(
          "📧 Kami telah mengirim link konfirmasi ke " + email + ". Silakan cek inbox email Anda (dan folder spam) untuk mengaktifkan akun, lalu kembali ke halaman login."
        );
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
          <GoogleOneTap
            buttonText="Daftar dengan Google"
            onSuccess={() => {
              setSuccessMessage("Berhasil mendaftar! Mengalihkan...");
              setTimeout(() => {
                window.location.href = "/chat";
              }, 600);
            }}
            onError={(msg) => setErrorMessage(msg)}
          />

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
