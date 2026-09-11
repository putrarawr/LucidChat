"use client";

import { createClient } from "@/lib/supabase/client";
import { Sparkles, ArrowRight, ShieldCheck, Cpu } from "lucide-react";
import { useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#080808]">
      {/* Background Ambient Blur Glows */}
      <div className="ambient-glow" />
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-white/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Glass Card */}
      <div className="relative z-10 w-full max-w-md p-8 liquid-glass-elevated border border-white/20 shadow-2xl text-center space-y-6 animate-glass-appear">
        {/* Brand Icon */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 border border-white/20 shadow-inner mb-2">
          <Sparkles className="w-7 h-7 text-white" />
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">LucidChat</h1>
          <p className="text-xs text-white/50 mt-1.5 leading-relaxed">
            Platform AI Multi-Model dengan Desain Liquid Glass Monochrome
          </p>
        </div>

        {/* Feature Badges */}
        <div className="grid grid-cols-2 gap-2 text-left pt-2">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs flex items-center gap-2">
            <Cpu className="w-4 h-4 text-white/70 shrink-0" />
            <span className="text-white/80">15+ Model AI</span>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-white/70 shrink-0" />
            <span className="text-white/80">Anti-Injection Guard</span>
          </div>
        </div>

        {/* Login Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full glass-pill py-3 px-4 flex items-center justify-center gap-3 text-sm font-semibold bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{loading ? "Menghubungkan..." : "Masuk dengan Google"}</span>
          <ArrowRight className="w-4 h-4 ml-auto" />
        </button>

        <p className="text-[11px] text-white/30 pt-2">
          Terisolasi secara aman dengan Supabase Row-Level Security
        </p>
      </div>
    </div>
  );
}
