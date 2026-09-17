import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const target = next || (data?.user?.email ? `/login?verified=true&email=${encodeURIComponent(data.user.email)}` : "/login?verified=true");
      return NextResponse.redirect(`${origin}${target}`);
    } else {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
    }
  }

  // Fallback redirect to login
  return NextResponse.redirect(`${origin}/login?verified=true`);
}

