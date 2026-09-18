export type AnnouncementType = "info" | "success" | "warning" | "urgent";

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: AnnouncementType;
  createdAt: string;
  author?: string;
}

const ANNOUNCEMENTS_KEY = "lucidchat_global_announcements";
const DISMISSED_KEY = "lucidchat_dismissed_announcements";

export function getStoredAnnouncements(): Announcement[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ANNOUNCEMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAnnouncementLocally(announcement: Announcement): void {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredAnnouncements();
    const updated = [announcement, ...current.filter((a) => a.id !== announcement.id)].slice(0, 10);
    localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Could not save announcement locally:", err);
  }
}

export function getDismissedAnnouncementIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function dismissAnnouncementId(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = getDismissedAnnouncementIds();
    if (!current.includes(id)) {
      localStorage.setItem(DISMISSED_KEY, JSON.stringify([...current, id]));
    }
  } catch (err) {
    console.warn("Could not dismiss announcement:", err);
  }
}
