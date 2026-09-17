"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, ShieldCheck, Check, X, Mail, Loader2, User } from "lucide-react";
import GoogleOneTap from "@/components/auth/GoogleOneTap";

import { useI18n } from "@/lib/i18n/I18nContext";
import { FloatingLanguagePicker } from "@/components/ui/FloatingLanguagePicker";

interface StrengthRule {
  key: string;
  fallback: string;
  test: (pw: string) => boolean;
}

const STRENGTH_RULES: StrengthRule[] = [
  { key: "auth.passwordMin8", fallback: "Minimal 8 karakter", test: (pw) => pw.length >= 8 },
  { key: "auth.passwordUpper", fallback: "Huruf besar (A-Z)", test: (pw) => /[A-Z]/.test(pw) },
  { key: "auth.passwordLower", fallback: "Huruf kecil (a-z)", test: (pw) => /[a-z]/.test(pw) },
  { key: "auth.passwordNumber", fallback: "Angka (0-9)", test: (pw) => /[0-9]/.test(pw) },
  { key: "auth.passwordSymbol", fallback: "Simbol (!@#$...)", test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

function getStrengthLevel(score: number, t: (k: string, f: string) => string): {
  label: string;
  color: string;
  barColor: string;
} {
  if (score <= 1) return { label: t("auth.strengthWeak", "Sangat Lemah"), color: "text-red-400", barColor: "bg-red-500" };
  if (score === 2) return { label: t("auth.strengthWeak", "Lemah"), color: "text-orange-400", barColor: "bg-orange-500" };
  if (score === 3) return { label: t("auth.strengthMedium", "Sedang"), color: "text-amber-400", barColor: "bg-amber-500" };
  if (score === 4) return { label: t("auth.strengthStrong", "Kuat"), color: "text-emerald-400", barColor: "bg-emerald-500" };
  return { label: t("auth.strengthVeryStrong", "Sangat Kuat"), color: "text-cyan-400", barColor: "bg-cyan-400" };
}

export default function RegisterPage() {
  const { t } = useI18n();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Verification popup modal states
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [isAutoVerified, setIsAutoVerified] = useState(false);

  const supabase = createClient();

  // Password strength
  const strengthScore = useMemo(
    () => STRENGTH_RULES.filter((r) => r.test(password)).length,
    [password]
  );
  const strengthInfo = getStrengthLevel(strengthScore, t);
  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const canSubmit = displayName.trim().length > 0 && strengthScore >= 4 && passwordsMatch && email.length > 0;

  // Auto-polling verification status while modal is open
  useEffect(() => {
    if (!isVerificationModalOpen || !registeredEmail) return;

    const interval = setInterval(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && (user.email_confirmed_at || user.confirmed_at)) {
          setIsAutoVerified(true);
          clearInterval(interval);
          setTimeout(() => {
            window.location.href = `/login?verified=true&email=${encodeURIComponent(registeredEmail)}`;
          }, 1000);
        }
      } catch (err) {
        console.warn("Error polling user verification status:", err);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [isVerificationModalOpen, registeredEmail, supabase]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanName = displayName.trim();

    try {
      // Save display name locally immediately
      if (typeof window !== "undefined" && cleanName) {
        localStorage.setItem("lucidchat_user_name", cleanName);
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: cleanName,
            name: cleanName,
            display_name: cleanName,
          },
        },
      });

      if (error) {
        if (error.message?.toLowerCase().includes("already registered")) {
          setErrorMessage("Email is already registered. Please sign in.");
        } else {
          setErrorMessage(error.message || "Failed to create account.");
        }
      } else if (data?.user?.identities?.length === 0) {
        setErrorMessage("Email is already registered. Please sign in.");
      } else if (data?.session) {
        setSuccessMessage("Account created successfully! Redirecting...");
        setTimeout(() => {
          window.location.href = "/chat";
        }, 1000);
      } else {
        // Confirmation email sent -> Show interactive popup modal!
        setRegisteredEmail(email);
        setIsVerificationModalOpen(true);
      }
    } catch {
      setErrorMessage("An error occurred while creating your account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[var(--surface-0)] font-sans">
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
            <span>{t("nav.backHome", "Back to Home")}</span>
          </Link>
          <div className="flex items-center gap-3">
            <FloatingLanguagePicker variant="compact" />
            <Link
              href="/login"
              className="text-xs text-white/50 hover:text-white transition-colors"
            >
              {t("auth.haveAccount", "Already have an account?")} <span className="text-white font-semibold">{t("auth.signInNow", "Sign In")}</span>
            </Link>
          </div>
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
              <h1 className="text-[22px] font-bold tracking-[-0.03em] text-white">{t("auth.registerTitle", "Create New Account")}</h1>
              <p className="text-[11px] text-white/40 leading-relaxed max-w-[280px]">
                {t("auth.registerSubtitle", "Register to access all features of LucidChat AI Platform")}
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
            {/* Display Name Column */}
            <div>
              <label className="text-[11px] font-medium text-white/60 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-white/40" />
                <span>{t("settings.displayName", "Display Name")}</span>
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={t("settings.displayNamePlaceholder", "Enter your display name (e.g. Putra)...")}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-xs text-white placeholder-white/30 outline-none focus:border-white/40 transition-colors"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-[11px] font-medium text-white/60 mb-1.5 block">
                {t("auth.emailLabel", "Email Address")}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@email.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-xs text-white placeholder-white/30 outline-none focus:border-white/40 transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-[11px] font-medium text-white/60 mb-1.5 block">
                {t("auth.passwordLabel", "Password")}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
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
                          <span>{t(rule.key, rule.fallback)}</span>
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
                {t("auth.confirmPasswordLabel", "Confirm Password")}
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
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
                  {t("auth.matchError", "Passwords do not match")}
                </p>
              )}
              {passwordsMatch && (
                <p className="mt-1.5 text-[10px] text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  {t("auth.matchSuccess", "Passwords match")}
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
              {loading ? t("auth.processing", "Processing...") : t("auth.registerBtn", "Create Account")}
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
            buttonText={t("auth.googleRegister", "Sign up with Google")}
            onSuccess={() => {
              setSuccessMessage(t("auth.processing", "Berhasil mendaftar! Mengalihkan..."));
              setTimeout(() => {
                window.location.href = "/chat";
              }, 600);
            }}
            onError={(msg) => setErrorMessage(msg)}
          />

          {/* Footer */}
          <p className="text-[10px] text-white/20 leading-relaxed">
            {t("auth.securityNote", "Data secured with Supabase Row-Level Security")}
          </p>
        </div>
      </div>

      {/* Verification Email Interactive Glass Popup Modal */}
      {isVerificationModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-fade-in font-sans">
          <div className="w-full max-w-md rounded-3xl border border-white/20 bg-[#0e0e16]/95 p-7 sm:p-8 shadow-[0_0_90px_rgba(0,0,0,0.9)] text-center space-y-5 relative">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-950/40 animate-pulse">
              <Mail className="w-8 h-8 text-emerald-400" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white tracking-tight">{t("auth.verifyTitle", "Check Your Email")}</h3>
              <p className="text-xs text-zinc-300 leading-relaxed max-w-sm mx-auto">
                {t("auth.verifyDesc", "We sent a confirmation link to")}{" "}
                <span className="font-semibold text-emerald-300 break-all">{registeredEmail}</span>.{" "}
                {t("auth.verifySub", "Please click the link in your email to activate your account.")}
              </p>
            </div>

            {/* Status Indicator Bar */}
            <div className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-xs text-zinc-300">
              {isAutoVerified ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-medium text-emerald-400">
                    {t("auth.verifiedSuccess", "Email verified successfully! Redirecting...")}
                  </span>
                </>
              ) : (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400 shrink-0" />
                  <span>{t("auth.waitingVerification", "Waiting for email verification...")}</span>
                </>
              )}
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  window.location.href = `/login?email=${encodeURIComponent(registeredEmail)}`;
                }}
                className="w-full py-3 rounded-xl bg-white text-black font-semibold text-xs hover:bg-white/90 transition-all shadow-lg active:scale-95"
              >
                {t("auth.goToLogin", "Go to Login Page")}
              </button>
              <button
                type="button"
                onClick={() => setIsVerificationModalOpen(false)}
                className="text-xs text-white/40 hover:text-white/80 transition-colors py-1"
              >
                {t("sidebar.cancel", "Close")}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
    </div>
  );
}

