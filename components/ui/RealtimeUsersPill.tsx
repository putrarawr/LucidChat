"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getEffectiveAvatarUrl } from "@/lib/avatar";
import { Users, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nContext";

interface ActiveUserPresence {
  user_id: string;
  name: string;
  avatar: string;
  online_at: string;
}

interface RealtimeUsersPillProps {
  variant?: "floating" | "inline";
  className?: string;
}

export function RealtimeUsersPill({
  variant = "floating",
  className = "",
}: RealtimeUsersPillProps) {
  const { t } = useI18n();
  const [onlineCount, setOnlineCount] = useState<number>(1);
  const [userAvatars, setUserAvatars] = useState<string[]>([]);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  useEffect(() => {
    const supabase = createClient();
    const randomId = Math.random().toString(36).substring(2, 9);
    let currentUserId = `guest_${randomId}`;
    let currentName = "Guest User";
    let currentAvatar = getEffectiveAvatarUrl(currentUserId);

    // Fetch logged in user if available
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        currentUserId = user.id;
        const meta = user.user_metadata || {};
        currentName = meta.full_name || meta.name || user.email?.split("@")[0] || "Lucid User";
        currentAvatar = getEffectiveAvatarUrl(user.email, meta.avatar_url || meta.picture);
      }

      const channel = supabase.channel("online-presence", {
        config: {
          presence: {
            key: currentUserId,
          },
        },
      });

      channel
        .on("presence", { event: "sync" }, () => {
          const state = channel.presenceState<ActiveUserPresence>();
          const presences = Object.values(state).flat();
          const count = Math.max(1, presences.length);
          setOnlineCount(count);

          const avatars = presences
            .map((p) => p.avatar || getEffectiveAvatarUrl(p.name))
            .filter(Boolean)
            .slice(0, 4);

          setUserAvatars(avatars.length > 0 ? avatars : [currentAvatar]);
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            await channel.track({
              user_id: currentUserId,
              name: currentName,
              avatar: currentAvatar,
              online_at: new Date().toISOString(),
            });
          }
        });

      return () => {
        supabase.removeChannel(channel);
      };
    });
  }, []);

  if (variant === "inline") {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-xs text-white/80 shadow-sm ${className}`}>
        <div className="relative flex items-center justify-center w-2.5 h-2.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </div>
        <span className="font-semibold text-white">{onlineCount}</span>
        <span className="text-white/60">{t("pill.onlineNow", "Online Realtime")}</span>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-5 right-5 z-30 pointer-events-auto group ${className}`}>
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-black/60 hover:bg-black/80 border border-white/15 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer text-white"
      >
        {/* Live Pulse Dot */}
        <div className="relative flex items-center justify-center w-3 h-3">
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-black/50" />
        </div>

        {/* Stacked Avatar Circles */}
        <div className="flex -space-x-1.5 overflow-hidden">
          {userAvatars.map((url, idx) => (
            <img
              key={idx}
              src={url}
              alt="Active user"
              className="inline-block w-5 h-5 rounded-full ring-1 ring-black object-cover bg-slate-800"
            />
          ))}
        </div>

        {/* Live Active Counter */}
        <div className="flex items-center gap-1.5 text-[11px] font-medium tracking-tight">
          <span className="font-bold text-emerald-400">{onlineCount}</span>
          <span className="text-white/70">{t("pill.usersActive", "Active Now")}</span>
        </div>

        <Sparkles className="w-3.5 h-3.5 text-amber-300 opacity-70 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Tooltip Hover Box */}
      {showTooltip && (
        <div className="absolute bottom-full left-0 mb-2 p-2.5 rounded-xl bg-slate-950/90 border border-white/15 shadow-xl backdrop-blur-md text-[11px] text-white/80 whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center gap-1.5 font-semibold text-white mb-1">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t("pill.realtimeCommunity", "LucidChat Realtime Community")}</span>
          </div>
          <p className="text-white/50 text-[10px]">
            {onlineCount} {t("pill.activeConnections", "active connection(s) currently chatting & exploring.")}
          </p>
        </div>
      )}
    </div>
  );
}
