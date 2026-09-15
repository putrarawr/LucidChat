"use client";

import { useEffect, useRef, useCallback } from "react";
import Script from "next/script";
import { createClient } from "@/lib/supabase/client";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          prompt: (notification?: (n: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => void) => void;
          cancel: () => void;
        };
      };
    };
  }
}

interface GoogleOneTapProps {
  onSuccess?: () => void;
  onError?: (msg: string) => void;
  buttonText?: string;
  className?: string;
}

export default function GoogleOneTap({
  onSuccess,
  onError,
  buttonText = "Masuk dengan Google",
  className = "",
}: GoogleOneTapProps) {
  const supabase = createClient();
  const scriptLoaded = useRef(false);
  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    "726090738249-06s21bivvepcg0snns3tfcocoksu4p2r.apps.googleusercontent.com";

  const initGoogleAuth = useCallback(() => {
    if (!window.google?.accounts?.id) return;

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: { credential?: string }) => {
          if (!response.credential) {
            if (onError) onError("Gagal mendapatkan kredensial Google.");
            return;
          }

          try {
            const { error } = await supabase.auth.signInWithIdToken({
              provider: "google",
              token: response.credential,
            });

            if (error) {
              await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                  redirectTo: `${window.location.origin}/auth/callback`,
                },
              });
            } else if (onSuccess) {
              onSuccess();
            } else {
              window.location.href = "/chat";
            }
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Terjadi kesalahan saat masuk dengan Google.";
            if (onError) onError(message);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Attempt one tap prompt on load
      window.google.accounts.id.prompt();
    } catch (e) {
      console.warn("Google One Tap initialization error:", e);
    }
  }, [clientId, onError, onSuccess, supabase.auth]);

  const handleGoogleClick = async () => {
    // Directly launch OAuth flow on explicit user click so it works EVERY time without cooldown limits
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error && onError) {
        onError(error.message);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal mengalihkan ke Google.";
      if (onError) onError(message);
    }
  };

  useEffect(() => {
    if (scriptLoaded.current && window.google) {
      initGoogleAuth();
    }
  }, [initGoogleAuth]);

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => {
          scriptLoaded.current = true;
          initGoogleAuth();
        }}
      />
      <button
        type="button"
        onClick={handleGoogleClick}
        className={
          className ||
          "w-full flex items-center justify-center gap-3 py-3 px-6 rounded-xl bg-white/[0.06] border border-white/15 text-xs text-white font-medium hover:bg-white/10 hover:border-white/25 active:scale-95 transition-all duration-200 cursor-pointer"
        }
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
        <span>{buttonText}</span>
      </button>
    </>
  );
}
