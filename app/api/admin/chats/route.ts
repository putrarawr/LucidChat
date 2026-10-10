import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerSupabase } from "@/lib/supabase/server";

const AUTHORIZED_ADMIN_EMAILS = [
  "putrarawr18@gmail.com",
  "uyungoke58@gmail.com",
  "lucidchat18@gmail.com",
];

export async function GET(req: NextRequest) {
  try {
    // 1. Verify that the caller is an authorized administrator
    const serverClient = await createServerSupabase();
    const { data: { user } } = await serverClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = (user.email || "").toLowerCase();
    const isAuthorized = AUTHORIZED_ADMIN_EMAILS.includes(email) || user.user_metadata?.is_admin === true;

    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    // 2. Initialize Supabase Admin with Service Role Key (bypasses RLS for admin)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get("chatId");

    // Case A: Fetch specific chat and its full message history
    if (chatId) {
      const { data: chat, error: chatErr } = await supabaseAdmin
        .from("chats")
        .select("id, user_id, title, model_used, created_at, updated_at")
        .eq("id", chatId)
        .single();

      if (chatErr || !chat) {
        return NextResponse.json({ error: "Chat not found" }, { status: 404 });
      }

      const { data: messages, error: msgErr } = await supabaseAdmin
        .from("messages")
        .select("id, chat_id, role, content, has_code, created_at")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

      if (msgErr) {
        console.error("Admin fetch messages error:", msgErr);
        return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
      }

      // Fetch user info for this chat's author
      let author = {
        id: chat.user_id,
        email: "unknown",
        name: "Anonymous / Deleted User",
        avatar: "",
        provider: "Email",
      };

      try {
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(chat.user_id);
        if (userData?.user) {
          const u = userData.user;
          const meta = u.user_metadata || {};
          const isGoogle = u.app_metadata?.provider === "google" || meta.iss?.includes("google");
          author = {
            id: u.id,
            email: u.email || "",
            name: meta.full_name || meta.name || meta.display_name || (u.email ? u.email.split("@")[0] : "User"),
            avatar: meta.avatar_url || meta.picture || "",
            provider: isGoogle ? "Google" : "Email",
          };
        }
      } catch (err) {
        console.warn("Failed to lookup user metadata for chat author:", err);
      }

      return NextResponse.json({
        chat: {
          ...chat,
          author,
        },
        messages: messages || [],
      });
    }

    // Case B: Fetch all chats, message counts, user preferences, and aggregated stats
    // A. Fetch all registered users
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    const userMap = new Map<string, { id: string; email: string; name: string; avatar: string; provider: "Google" | "Email" }>();
    (usersData?.users || []).forEach((u) => {
      const meta = u.user_metadata || {};
      const isGoogle = u.app_metadata?.provider === "google" || meta.iss?.includes("google");
      userMap.set(u.id, {
        id: u.id,
        email: u.email || "",
        name: meta.full_name || meta.name || meta.display_name || (u.email ? u.email.split("@")[0] : "User"),
        avatar: meta.avatar_url || meta.picture || "",
        provider: isGoogle ? "Google" : "Email",
      });
    });

    // B. Fetch all chats
    const { data: allChats, error: allChatsErr } = await supabaseAdmin
      .from("chats")
      .select("id, user_id, title, model_used, created_at, updated_at")
      .order("created_at", { ascending: false })
      .limit(1000);

    if (allChatsErr) {
      console.error("Admin all chats query error:", allChatsErr);
      return NextResponse.json({ error: "Failed to fetch chats" }, { status: 500 });
    }

    // C. Fetch all messages count by chat_id
    const { data: allMessages, error: msgsErr } = await supabaseAdmin
      .from("messages")
      .select("id, chat_id, role, created_at");

    if (msgsErr) {
      console.warn("Admin messages query warning:", msgsErr);
    }

    const messagesCountByChat: Record<string, number> = {};
    const messagesCountByUser: Record<string, number> = {};
    const messagesCountByModel: Record<string, number> = {};

    // Map chat_id to model_used and user_id
    const chatMetaMap = new Map<string, { model: string; userId: string }>();
    (allChats || []).forEach((c) => {
      chatMetaMap.set(c.id, { model: c.model_used || "unknown", userId: c.user_id || "unknown" });
    });

    (allMessages || []).forEach((m) => {
      messagesCountByChat[m.chat_id] = (messagesCountByChat[m.chat_id] || 0) + 1;
      const meta = chatMetaMap.get(m.chat_id);
      if (meta) {
        messagesCountByModel[meta.model] = (messagesCountByModel[meta.model] || 0) + 1;
        messagesCountByUser[meta.userId] = (messagesCountByUser[meta.userId] || 0) + 1;
      }
    });

    // D. Model usage aggregations
    const modelChatCounts: Record<string, number> = {};
    const userModelMatrix: Record<string, Record<string, number>> = {};
    const userChatCounts: Record<string, number> = {};
    const peakHours = new Array(24).fill(0);

    (allChats || []).forEach((c) => {
      const model = c.model_used || "unknown";
      const uId = c.user_id || "unknown";

      modelChatCounts[model] = (modelChatCounts[model] || 0) + 1;
      userChatCounts[uId] = (userChatCounts[uId] || 0) + 1;

      if (!userModelMatrix[uId]) userModelMatrix[uId] = {};
      userModelMatrix[uId][model] = (userModelMatrix[uId][model] || 0) + 1;

      if (c.created_at) {
        const hour = new Date(c.created_at).getHours();
        peakHours[hour]++;
      }
    });

    const totalChatsCount = (allChats || []).length;
    const totalMessagesCount = (allMessages || []).length;
    const totalRegisteredUsers = userMap.size || 1;

    // Model ranking by chats
    const modelTraffic = Object.entries(modelChatCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([modelId, count]) => ({
        modelId,
        count,
        percent: totalChatsCount > 0 ? Math.round((count / totalChatsCount) * 100) : 0,
        messagesCount: messagesCountByModel[modelId] || 0,
      }));

    // User preferences & favorite model per registered user
    const userPreferences = Array.from(userMap.values()).map((user) => {
      const chatCount = userChatCounts[user.id] || 0;
      const messageCount = messagesCountByUser[user.id] || 0;
      const modelBreakdown = userModelMatrix[user.id] || {};

      let favoriteModel = "None yet";
      let maxModelCount = 0;
      Object.entries(modelBreakdown).forEach(([m, count]) => {
        if (count > maxModelCount) {
          maxModelCount = count;
          favoriteModel = m;
        }
      });

      return {
        ...user,
        chatCount,
        messageCount,
        favoriteModel: maxModelCount > 0 ? favoriteModel : "Belum ada chat",
        favoriteModelCount: maxModelCount,
      };
    }).sort((a, b) => b.chatCount - a.chatCount);

    // Format chat list with user info and message count
    const enrichedChats = (allChats || []).map((c) => {
      const author = userMap.get(c.user_id) || {
        id: c.user_id,
        email: "user-" + (c.user_id || "").slice(0, 8),
        name: "User " + (c.user_id || "").slice(0, 6),
        avatar: "",
        provider: "Email" as const,
      };

      return {
        id: c.id,
        title: c.title || "Untitled Conversation",
        model_used: c.model_used || "unknown",
        created_at: c.created_at,
        updated_at: c.updated_at,
        message_count: messagesCountByChat[c.id] || 0,
        user: author,
      };
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalChats: totalChatsCount,
        totalMessages: totalMessagesCount,
        averageChatsPerUser: Number((totalChatsCount / totalRegisteredUsers).toFixed(1)),
        averageMessagesPerChat: totalChatsCount > 0 ? Number((totalMessagesCount / totalChatsCount).toFixed(1)) : 0,
        averageMessagesPerUser: Number((totalMessagesCount / totalRegisteredUsers).toFixed(1)),
        modelTraffic,
        peakHours,
      },
      chats: enrichedChats,
      userPreferences,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("Admin chats API error:", err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
