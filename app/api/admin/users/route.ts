import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerSupabase } from "@/lib/supabase/server";

const AUTHORIZED_ADMIN_EMAILS = [
  "putrarawr18@gmail.com",
  "uyungoke58@gmail.com",
  "lucidchat18@gmail.com",
];

export async function GET() {
  try {
    // Verify the caller is an authorized admin
    const serverClient = await createServerSupabase();
    const { data: { user } } = await serverClient.auth.getUser();

    if (!user || !AUTHORIZED_ADMIN_EMAILS.includes((user.email || "").toLowerCase())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Use service role key to access auth.admin.listUsers()
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Fetch all users (paginated — fetch up to 1000)
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (error) {
      console.error("Admin listUsers error:", error);
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }

    // Sanitize and return user data
    const users = (data?.users || []).map((u) => {
      const meta = u.user_metadata || {};
      const provider = u.app_metadata?.provider || "email";
      const isGoogle = provider === "google" || provider === "google-one-tap";

      return {
        id: u.id,
        email: u.email || "",
        name: meta.full_name || meta.name || meta.display_name || (u.email ? u.email.split("@")[0] : "User"),
        avatar: meta.avatar_url || meta.picture || "",
        provider: isGoogle ? "Google" : "Email",
        createdAt: u.created_at,
        lastSignIn: u.last_sign_in_at || null,
      };
    });

    return NextResponse.json({
      users,
      totalCount: users.length,
    });
  } catch (err) {
    console.error("Admin users API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
