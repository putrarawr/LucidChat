import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserQuotaStatus } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const forwardedFor = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const cfConnectingIp = req.headers.get("cf-connecting-ip");
    const clientIp = (forwardedFor ? forwardedFor.split(",")[0].trim() : null) || realIp || cfConnectingIp || "127.0.0.1";
    const guestIdentifier = `guest:${clientIp.replace(/[^a-zA-Z0-9]/g, "_")}`;

    const userId = user?.id || guestIdentifier;
    const quota = getUserQuotaStatus(userId);

    return NextResponse.json({
      success: true,
      quota,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
