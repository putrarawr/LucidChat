"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Announcement,
  getStoredAnnouncements,
  getDismissedAnnouncementIds,
  dismissAnnouncementId,
  saveAnnouncementLocally,
} from "@/lib/announcements";
import { Bell, Info, AlertTriangle, CheckCircle2, Flame, X } from "lucide-react";
import { playClickSound } from "@/lib/sound";

export function GlobalAnnouncementBanner() {
  const [activeAnnouncement, setActiveAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    const dismissed = getDismissedAnnouncementIds();

    // 1. Fetch latest server announcement for new logins / fresh browser sessions
    fetch("/api/announcements")
      .then((res) => res.json())
      .then((data) => {
        if (data?.announcement) {
          const ann = data.announcement as Announcement;
          saveAnnouncementLocally(ann);
          if (!dismissed.includes(ann.id)) {
            setActiveAnnouncement(ann);
          }
        }
      })
      .catch((err) => console.warn("Could not fetch server announcement:", err));

    // 2. Subscribe to Supabase Realtime Broadcast for live mass announcements
    const supabase = createClient();
    const channel = supabase.channel("global-announcements");

    channel
      .on("broadcast", { event: "new_announcement" }, (payload) => {
        if (payload.payload) {
          const ann = payload.payload as Announcement;
          saveAnnouncementLocally(ann);
          setActiveAnnouncement(ann);
          playClickSound();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!activeAnnouncement) return null;

  const handleDismiss = () => {
    playClickSound();
    dismissAnnouncementId(activeAnnouncement.id);
    setActiveAnnouncement(null);
  };

  const getIcon = () => {
    switch (activeAnnouncement.type) {
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
      case "urgent":
        return <Flame className="w-5 h-5 text-red-400 shrink-0 animate-bounce" />;
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
      case "info":
      default:
        return <Info className="w-5 h-5 text-cyan-400 shrink-0" />;
    }
  };

  const getBorderColor = () => {
    switch (activeAnnouncement.type) {
      case "warning":
        return "border-amber-500/30 bg-amber-500/10";
      case "urgent":
        return "border-red-500/40 bg-red-500/15";
      case "success":
        return "border-emerald-500/30 bg-emerald-500/10";
      case "info":
      default:
        return "border-cyan-500/30 bg-cyan-500/10";
    }
  };

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className={`p-4 rounded-2xl border backdrop-blur-2xl shadow-2xl flex items-start gap-3.5 text-white ${getBorderColor()}`}>
        {/* Type Icon */}
        <div className="p-2 rounded-xl bg-white/10 border border-white/10 shrink-0 mt-0.5">
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/15 text-white/90">
              <Bell className="w-3 h-3 text-amber-300" />
              Global Announcement
            </span>
            <span className="text-[10px] text-white/40">
              {new Date(activeAnnouncement.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>

          <h4 className="text-sm font-bold tracking-tight text-white">{activeAnnouncement.title}</h4>
          <p className="text-xs text-white/80 leading-relaxed break-words">{activeAnnouncement.content}</p>
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all shrink-0 active:scale-95"
          title="Dismiss Announcement"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
