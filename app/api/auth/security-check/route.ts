import { NextRequest, NextResponse } from "next/server";
import {
  isIpBlacklisted,
  isDisposableEmail,
  checkAuthRateLimit,
  recordFailedAuthAttempt,
  resetAuthRateLimit,
} from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const forwardedFor = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const cfConnectingIp = req.headers.get("cf-connecting-ip");
    const clientIp = (forwardedFor ? forwardedFor.split(",")[0].trim() : null) || realIp || cfConnectingIp || "127.0.0.1";

    const body = await req.json().catch(() => ({}));
    const { email, fingerprint, action } = body as {
      email?: string;
      fingerprint?: string;
      action?: "check" | "fail" | "success";
    };

    const fpKey = fingerprint ? `fp:${fingerprint}` : null;
    const ipKey = `ip:${clientIp}`;

    // Handle recording outcomes
    if (action === "fail") {
      recordFailedAuthAttempt(ipKey);
      if (fpKey) recordFailedAuthAttempt(fpKey);
      return NextResponse.json({ recorded: true });
    }

    if (action === "success") {
      resetAuthRateLimit(ipKey);
      if (fpKey) resetAuthRateLimit(fpKey);
      return NextResponse.json({ recorded: true });
    }

    // 1. IP Blacklist Verification
    if (isIpBlacklisted(clientIp)) {
      return NextResponse.json(
        {
          allowed: false,
          isBanned: true,
          reason: "Alamat IP Anda telah diblokir oleh administrator karena terdeteksi aktivitas mencurigakan atau pelanggaran ketentuan.",
        },
        { status: 403 }
      );
    }

    // 2. Strict Rate Limiting (per IP & Fingerprint)
    const ipRate = checkAuthRateLimit(ipKey);
    if (!ipRate.allowed) {
      return NextResponse.json(
        {
          allowed: false,
          isRateLimited: true,
          reason: ipRate.reason,
          retryAfterSec: ipRate.retryAfterSec,
        },
        { status: 429 }
      );
    }

    if (fpKey) {
      const fpRate = checkAuthRateLimit(fpKey);
      if (!fpRate.allowed) {
        return NextResponse.json(
          {
            allowed: false,
            isRateLimited: true,
            reason: fpRate.reason,
            retryAfterSec: fpRate.retryAfterSec,
          },
          { status: 429 }
        );
      }
    }

    // 3. Disposable Email Verification (for registration or login checks)
    if (email && typeof email === "string" && isDisposableEmail(email)) {
      return NextResponse.json(
        {
          allowed: false,
          isDisposable: true,
          reason: "Domain email sementara / sekali pakai (disposable email) tidak diizinkan. Harap gunakan akun email resmi permanen (Gmail, Outlook, Yahoo, atau email institusi).",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      allowed: true,
      remainingAttempts: ipRate.remaining,
      clientIp,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal Security Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
