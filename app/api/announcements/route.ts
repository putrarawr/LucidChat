import { NextResponse } from "next/server";
import { Announcement } from "@/lib/announcements";

// In-memory store for global latest announcement (persisted across requests)
let globalLatestAnnouncement: Announcement | null = {
  id: "ann_welcome_1",
  title: "🚀 Welcome to LucidChat Platform AI!",
  content: "Access 15+ free multi-model AI engines, scan documents, generate AI images, and experience hands-free voice calls.",
  type: "info",
  createdAt: new Date().toISOString(),
  author: "LucidChat Admin",
};

export async function GET() {
  return NextResponse.json({ announcement: globalLatestAnnouncement });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content, type, author } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content required" }, { status: 400 });
    }

    const newAnnouncement: Announcement = {
      id: `ann_${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      type: type || "info",
      createdAt: new Date().toISOString(),
      author: author || "LucidChat Admin",
    };

    globalLatestAnnouncement = newAnnouncement;

    return NextResponse.json({ success: true, announcement: newAnnouncement });
  } catch (err) {
    return NextResponse.json({ error: "Failed to post announcement" }, { status: 500 });
  }
}
