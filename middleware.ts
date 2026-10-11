import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isIpBlacklisted } from "@/lib/security";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // 1. IP Blacklist Check: immediately bounce blacklisted IPs to /login?banned=1
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  const clientIp = (forwardedFor ? forwardedFor.split(",")[0].trim() : null) || realIp || cfConnectingIp || "127.0.0.1";

  if (isIpBlacklisted(clientIp) && !request.nextUrl.pathname.startsWith("/login")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("banned", "1");
    url.searchParams.set("reason", "Alamat IP Anda telah diblacklist oleh administrator.");
    const redirectRes = NextResponse.redirect(url);
    request.cookies.getAll().forEach((cookie) => {
      if (cookie.name.includes("sb-") || cookie.name.includes("supabase")) {
        redirectRes.cookies.delete(cookie.name);
      }
    });
    return redirectRes;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase environment variables are missing on Vercel deployment, allow request to pass gracefully
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.trim() === "") {
    return supabaseResponse;
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Check if the user is banned
    const isBanned = Boolean(
      (user?.banned_until && new Date(user.banned_until).getTime() > Date.now()) ||
      user?.app_metadata?.is_banned
    );

    // If user is banned, revoke access, clear session, and redirect to /login
    if (user && isBanned) {
      const banReason = (user.app_metadata?.ban_reason as string) || "Akun Anda telah dinonaktifkan oleh administrator.";
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("banned", "1");
      url.searchParams.set("reason", banReason);
      const redirectRes = NextResponse.redirect(url);
      request.cookies.getAll().forEach((cookie) => {
        if (cookie.name.includes("sb-") || cookie.name.includes("supabase")) {
          redirectRes.cookies.delete(cookie.name);
        }
      });
      return redirectRes;
    }

    // Public routes that don't require authentication
    const isPublicRoute =
      request.nextUrl.pathname === "/" ||
      request.nextUrl.pathname.startsWith("/login") ||
      request.nextUrl.pathname.startsWith("/register") ||
      request.nextUrl.pathname.startsWith("/privacy") ||
      request.nextUrl.pathname.startsWith("/terms") ||
      request.nextUrl.pathname.startsWith("/auth") ||
      request.nextUrl.pathname.startsWith("/share") ||
      request.nextUrl.pathname === "/robots.txt" ||
      request.nextUrl.pathname === "/sitemap.xml" ||
      request.nextUrl.pathname === "/manifest.json" ||
      request.nextUrl.pathname === "/sw.js" ||
      request.nextUrl.pathname.startsWith("/google");

    // Protected routes: redirect to login if not authenticated
    if (!user && !isPublicRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // If user is logged in and tries to access /login or /register, redirect to /chat
    if (
      user &&
      (request.nextUrl.pathname.startsWith("/login") ||
        request.nextUrl.pathname.startsWith("/register"))
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/chat";
      return NextResponse.redirect(url);
    }
  } catch (err) {
    console.warn("Middleware Auth Check Exception:", err);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots\\.txt|sitemap\\.xml|manifest\\.json|sw\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|json|html)$).*)",
  ],
};
