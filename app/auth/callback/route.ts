import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next");

  const supabase = await createClient();

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const isBanned = Boolean(
        (data?.user?.banned_until && new Date(data.user.banned_until).getTime() > Date.now()) ||
        data?.user?.app_metadata?.is_banned
      );
      if (data?.user && isBanned) {
        const banReason = (data.user.app_metadata?.ban_reason as string) || "Akun Anda telah dinonaktifkan oleh administrator.";
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/login?banned=1&reason=${encodeURIComponent(banReason)}`);
      }

      const isAdminEmail = data?.user?.email?.toLowerCase() === "putrarawr18@gmail.com";
      const target = next || (isAdminEmail ? "/admin" : (data?.user?.email ? `/login?verified=true&email=${encodeURIComponent(data.user.email)}` : "/login?verified=true"));
      return NextResponse.redirect(`${origin}${target}`);
    }
  }

  if (token_hash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      const isBanned = Boolean(
        (data?.user?.banned_until && new Date(data.user.banned_until).getTime() > Date.now()) ||
        data?.user?.app_metadata?.is_banned
      );
      if (data?.user && isBanned) {
        const banReason = (data.user.app_metadata?.ban_reason as string) || "Akun Anda telah dinonaktifkan oleh administrator.";
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/login?banned=1&reason=${encodeURIComponent(banReason)}`);
      }

      const isAdminEmail = data?.user?.email?.toLowerCase() === "putrarawr18@gmail.com";
      const target = next || (isAdminEmail ? "/admin" : (data?.user?.email ? `/login?verified=true&email=${encodeURIComponent(data.user.email)}` : "/login?verified=true"));
      return NextResponse.redirect(`${origin}${target}`);
    }
  }

  // Fallback redirect to login as verified (email is already confirmed in Supabase when link is clicked)
  return NextResponse.redirect(`${origin}/login?verified=true`);
}


