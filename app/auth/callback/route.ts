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
      const target = next || (data?.user?.email ? `/login?verified=true&email=${encodeURIComponent(data.user.email)}` : "/login?verified=true");
      return NextResponse.redirect(`${origin}${target}`);
    }
  }

  if (token_hash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      const target = next || (data?.user?.email ? `/login?verified=true&email=${encodeURIComponent(data.user.email)}` : "/login?verified=true");
      return NextResponse.redirect(`${origin}${target}`);
    }
  }

  // Fallback redirect to login as verified (email is already confirmed in Supabase when link is clicked)
  return NextResponse.redirect(`${origin}/login?verified=true`);
}


