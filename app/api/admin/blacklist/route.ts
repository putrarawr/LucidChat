import { NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { getBlacklistedIps, blacklistIp, unblacklistIp } from "@/lib/security";

const AUTHORIZED_ADMIN_EMAILS = [
  "putrarawr18@gmail.com",
  "uyungoke58@gmail.com",
  "lucidchat18@gmail.com",
];

async function verifyAdmin() {
  const serverClient = await createServerSupabase();
  const { data: { user } } = await serverClient.auth.getUser();
  if (!user || !AUTHORIZED_ADMIN_EMAILS.includes((user.email || "").toLowerCase())) {
    return false;
  }
  return true;
}

export async function GET() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const list = getBlacklistedIps();
  return NextResponse.json({ blacklistedIps: list, count: list.length });
}

export async function POST(req: Request) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { ip, reason } = await req.json();
    if (!ip || typeof ip !== "string") {
      return NextResponse.json({ error: "Alamat IP wajib diisi" }, { status: 400 });
    }

    blacklistIp(ip.trim(), reason || "Diblokir secara manual oleh administrator");
    return NextResponse.json({ success: true, ip: ip.trim() });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { ip } = await req.json();
    if (!ip || typeof ip !== "string") {
      return NextResponse.json({ error: "Alamat IP wajib diisi" }, { status: 400 });
    }

    unblacklistIp(ip.trim());
    return NextResponse.json({ success: true, unblacklisted: ip.trim() });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
