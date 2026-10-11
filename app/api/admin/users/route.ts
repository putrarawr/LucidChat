import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { blacklistIp } from "@/lib/security";

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

    // Sanitize and return user data including ban status
    const users = (data?.users || []).map((u) => {
      const meta = u.user_metadata || {};
      const provider = u.app_metadata?.provider || "email";
      const isGoogle = provider === "google" || provider === "google-one-tap";
      
      const isBanned = Boolean(
        (u.banned_until && new Date(u.banned_until).getTime() > Date.now()) ||
        u.app_metadata?.is_banned
      );
      const banReason = (u.app_metadata?.ban_reason as string) || (isBanned ? "Akun dinonaktifkan oleh administrator" : "");

      return {
        id: u.id,
        email: u.email || "",
        name: meta.full_name || meta.name || meta.display_name || (u.email ? u.email.split("@")[0] : "User"),
        avatar: meta.avatar_url || meta.picture || "",
        provider: isGoogle ? "Google" : "Email",
        createdAt: u.created_at,
        lastSignIn: u.last_sign_in_at || null,
        isBanned,
        banReason,
        bannedUntil: u.banned_until || null,
        bannedAt: u.app_metadata?.banned_at || null,
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

export async function POST(req: Request) {
  try {
    const serverClient = await createServerSupabase();
    const { data: { user: adminUser } } = await serverClient.auth.getUser();

    if (!adminUser || !AUTHORIZED_ADMIN_EMAILS.includes((adminUser.email || "").toLowerCase())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { userId, action, reason, ipToBlacklist } = body;

    if (!userId || !action || !["ban", "unban"].includes(action)) {
      return NextResponse.json({ error: "Parameter tidak lengkap atau tidak valid" }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Get the target user to check identity
    const { data: targetUserData, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (getUserError || !targetUserData?.user) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
    }

    const targetUser = targetUserData.user;
    const targetEmail = (targetUser.email || "").toLowerCase();

    // Guard: Dilarang memblokir sesama administrator!
    if (AUTHORIZED_ADMIN_EMAILS.includes(targetEmail)) {
      return NextResponse.json(
        { error: "Dilarang memblokir akun sesama administrator!" },
        { status: 400 }
      );
    }

    if (action === "ban") {
      const banReason = reason?.trim() || "Pelanggaran terhadap ketentuan layanan LucidChat";
      
      const { error: banError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        ban_duration: "876000h", // ~100 tahun (permanen)
        app_metadata: {
          ...targetUser.app_metadata,
          is_banned: true,
          ban_reason: banReason,
          banned_at: new Date().toISOString(),
          banned_by: adminUser.email,
        },
      });

      if (banError) {
        console.error("Error banning user:", banError);
        return NextResponse.json({ error: banError.message || "Gagal memblokir pengguna" }, { status: 500 });
      }

      // If IP to blacklist was provided, add it to the active blacklist
      if (ipToBlacklist && typeof ipToBlacklist === "string" && ipToBlacklist.trim()) {
        blacklistIp(ipToBlacklist.trim(), `Akun ${targetEmail} diban (${banReason})`);
      }

      return NextResponse.json({
        success: true,
        action: "ban",
        userId,
        isBanned: true,
        banReason,
        blacklistedIp: ipToBlacklist?.trim() || null,
      });
    } else {
      // Unban
      const { error: unbanError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        ban_duration: "none",
        app_metadata: {
          ...targetUser.app_metadata,
          is_banned: false,
          ban_reason: null,
          unbanned_at: new Date().toISOString(),
          unbanned_by: adminUser.email,
        },
      });

      if (unbanError) {
        console.error("Error unbanning user:", unbanError);
        return NextResponse.json({ error: unbanError.message || "Gagal membuka blokir pengguna" }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        action: "unban",
        userId,
        isBanned: false,
        banReason: "",
      });
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    console.error("Admin user ban API error:", err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
