/**
 * Generates an effective profile avatar URL for users.
 * If a custom avatarUrl is provided, it uses that.
 * Otherwise, it generates a unique, high-quality avatar based on the user's email address
 * using Dicebear Bottts / Identicon API.
 */
export function getEffectiveAvatarUrl(
  email?: string | null,
  avatarUrl?: string | null
): string {
  if (avatarUrl && avatarUrl.trim()) {
    return avatarUrl.trim();
  }

  if (email && email.trim()) {
    const cleanEmail = email.trim().toLowerCase();
    // High-resolution neutral bot / identicon avatar SVG seed
    return `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(cleanEmail)}&radius=50&backgroundColor=0f172a,1e293b,334155`;
  }

  // Generic fallback if neither avatarUrl nor email is available
  return `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=LucidUser&radius=50&backgroundColor=0f172a`;
}
