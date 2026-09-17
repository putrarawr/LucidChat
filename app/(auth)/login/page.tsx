"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import GoogleOneTap from "@/components/auth/GoogleOneTap";

import { useI18n } from "@/lib/i18n/I18nContext";
import { FloatingLanguagePicker } from "@/components/ui/FloatingLanguagePicker";

export default function LoginPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showResendButton, setShowResendButton] = useState(false);

  const supabase = createClient();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setShowResendButton(false);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const msg = error.message?.toLowerCase() || "";
        if (msg.includes("email not confirmed") || msg.includes("not confirmed")) {
          setErrorMessage(t("auth.emailUnconfirmed", "Email Anda belum dikonfirmasi. Silakan cek inbox email Anda untuk link aktivasi."));
          setShowResendButton(true);
        } else if (msg.includes("invalid login credentials") || msg.includes("invalid credentials")) {
          setErrorMessage(t("auth.invalidCreds", "Email atau kata sandi salah. Periksa kembali atau buat akun baru."));
        } else {
          setErrorMessage(error.message || t("auth.loginError", "Gagal masuk. Periksa email & password Anda."));
        }
      } else {
        setSuccessMessage(t("auth.processing", "Berhasil masuk! Mengalihkan..."));
        setTimeout(() => {
          window.location.href = "/chat";
        }, 800);
      }
    } catch {
      setErrorMessage(t("auth.loginError", "Terjadi kesalahan saat masuk."));
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      setErrorMessage(t("auth.emailLabel", "Email"));
      return;
    }
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setErrorMessage("Failed to resend email: " + error.message);
      } else {
        setSuccessMessage(t("auth.resendSuccess", "📧 Email konfirmasi telah dikirim ulang ke ") + email);
        setShowResendButton(false);
      }
    } catch {
      setErrorMessage(t("auth.loginError", "Terjadi kesalahan saat mengirim ulang email konfirmasi."));
    } finally {
      setResending(false);
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
            <span>{t("nav.backHome", "Back to Home")}</span>
          </Link>
          <div className="flex items-center gap-3">
            <FloatingLanguagePicker variant="compact" />
            <Link
              href="/register"
              className="text-xs text-white/50 hover:text-white transition-colors"
            >
              {t("auth.noAccount", "Don't have an account?")} <span className="text-white font-semibold">{t("auth.signUpNow", "Register")}</span>
            </Link>
          </div>
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
              <h1 className="text-[24px] font-bold tracking-[-0.03em] text-white">{t("auth.loginTitle", "Sign In")}</h1>
              <p className="text-[12px] text-white/40 leading-relaxed max-w-[260px]">
                {t("auth.loginSubtitle", "Sign in to access multi-model AI chat")}
              </p>
            </div>
          </div>

          {/* Error / Success Messages */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 text-left space-y-2">
              <p>{errorMessage}</p>
              {showResendButton && (
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  disabled={resending}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-amber-300 text-[11px] font-semibold transition-all border border-white/10"
                >
                  {resending ? t("auth.resendSending", "Sending...") : t("auth.resendEmail", "📧 Resend Confirmation Email")}
                </button>
              )}
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
              <label className="text-[11px] font-medium text-white/60 mb-1.5 block">{t("auth.emailLabel", "Email Address")}</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@email.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-xs text-white placeholder-white/30 outline-none focus:border-white/40 transition-colors"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-white/60 mb-1.5 block">{t("auth.passwordLabel", "Password")}</label>
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
              {loading ? t("auth.processing", "Processing...") : t("auth.loginBtn", "Sign In Now")}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[10px] text-white/30">{t("auth.or", "or")}</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Google OAuth */}
          <GoogleOneTap
            buttonText={t("auth.googleLogin", "Continue with Google")}
            onSuccess={() => {
              setSuccessMessage(t("auth.processing", "Berhasil masuk! Mengalihkan..."));
              setTimeout(() => {
                window.location.href = "/chat";
              }, 600);
            }}
            onError={(msg) => setErrorMessage(msg)}
          />

          {/* Register Link */}
          <div className="pt-1">
            <Link
              href="/register"
              className="text-[11px] text-white/40 hover:text-white transition-colors"
            >
              {t("auth.noAccount", "Don't have an account?")} <span className="text-white/70 font-semibold underline underline-offset-2 decoration-white/20 hover:decoration-white/50">{t("auth.signUpNow", "Register now")}</span>
            </Link>
          </div>

          {/* Footer */}
          <p className="text-[10px] text-white/20 leading-relaxed">
            {t("auth.securityNote", "Data secured with Supabase Row-Level Security")}
          </p>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
    </div>
  );
}
