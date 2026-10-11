/**
 * LucidChat Security & Threat Mitigation Engine
 * - Disposable & burner email domain blocker
 * - In-memory & environment-based IP blacklist manager
 * - Strict auth rate limiting per IP & browser fingerprint
 */

// ─── 1. Comprehensive Disposable Email Domains List ─────────────────────────
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  // Popular temporary email services
  "mailinator.com",
  "tempmail.com",
  "temp-mail.org",
  "10minutemail.com",
  "10minutemail.net",
  "10minutemail.org",
  "guerrillamail.com",
  "guerrillamail.net",
  "guerrillamail.biz",
  "guerrillamail.org",
  "guerrillamailblock.com",
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net",
  "throwawaymail.com",
  "trashmail.com",
  "trashmail.net",
  "trashmail.me",
  "trash-mail.com",
  "dispostable.com",
  "sharklasers.com",
  "getairmail.com",
  "mohmal.com",
  "mohmal.im",
  "fakemail.net",
  "tempmailo.com",
  "generator.email",
  "inboxkitten.com",
  "nada.ltd",
  "dropmail.me",
  "crazymailing.com",
  "armyspy.com",
  "cuvox.de",
  "dayrep.com",
  "fleckens.hu",
  "gustr.com",
  "jourrapide.com",
  "rhyta.com",
  "superrito.com",
  "teleworm.us",
  "emailondeck.com",
  "burnermail.io",
  "burnermail.com",
  "mytemp.email",
  "mytempemail.com",
  "byom.de",
  "tempr.email",
  "discard.email",
  "spambog.com",
  "mailnesia.com",
  "maildrop.cc",
  "mintemail.com",
  "harakirimail.com",
  "tmailor.com",
  "internxt.com",
  "tempinbox.com",
  "10mail.org",
  "clipmail.eu",
  "drdrb.net",
  "fakeinbox.com",
  "filzmail.com",
  "incognitomail.org",
  "mailsac.com",
  "nowmymail.com",
  "objectmail.com",
  "oneoffmail.com",
  "owlpic.com",
  "pookmail.com",
  "safe-mail.net",
  "shortmail.com",
  "tempmailaddress.com",
  "trashymail.com",
  "zoemail.org",
  "jetable.org",
  "kasmail.com",
  "crazymail.net",
  "deadaddress.com",
  "fastacura.com",
  "getnada.com",
  "inboxclean.com",
  "instantemailaddress.com",
  "meltmail.com",
  "mytrashmail.com",
  "nobulk.com",
  "notsharingmy.info",
  "ondemandmail.com",
  "pookmail.net",
  "receivemail.com",
  "safersignup.com",
  "sneakemail.com",
  "spamfree24.org",
  "spamgourmet.com",
  "tempemail.net",
  "tempemail.co",
  "temporaryemail.net",
  "thankyou2010.com",
  "whyspam.me",
  "willselfdestruct.com",
  "yomail.info",
  "zillamail.com",
  "0-mail.com",
  "10minutemail.co.uk",
  "20minutemail.com",
  "33mail.com",
  "anonaddy.com",
  "anonaddy.me",
  "simplelogin.com",
  "duck.com",
  "relay.firefox.com",
  "proton.me", // Note: kept if users allow proton, but standard free disposable providers are blocked
]);

// Pattern to catch dynamically-generated or obscure disposable domain names
const DISPOSABLE_DOMAIN_REGEX = /^(temp|dispos|throwaway|burner|fake|trash|guerrilla|mailinator|yopmail|10min|minute|mytemp|spambog|fastmail\d*|anon)/i;

/**
 * Checks whether an email address uses a disposable/temporary domain.
 */
export function isDisposableEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const parts = email.trim().toLowerCase().split("@");
  if (parts.length !== 2) return false;

  const domain = parts[1];
  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return true;
  }

  // Check pattern on base domain
  const domainParts = domain.split(".");
  if (domainParts.length >= 2) {
    const mainDomain = domainParts[domainParts.length - 2];
    if (DISPOSABLE_DOMAIN_REGEX.test(mainDomain)) {
      return true;
    }
  }

  return false;
}

// ─── 2. In-Memory & Persistent IP Blacklist Store ────────────────────────────
interface BlacklistEntry {
  ip: string;
  reason: string;
  createdAt: string;
}

const blacklistedIpsMap = new Map<string, BlacklistEntry>();

// Initialize blacklist from environment variable if configured
if (process.env.BLACKLISTED_IPS) {
  const envIps = process.env.BLACKLISTED_IPS.split(",").map((ip) => ip.trim());
  for (const ip of envIps) {
    if (ip) {
      blacklistedIpsMap.set(ip, {
        ip,
        reason: "Configured via environment blacklist",
        createdAt: new Date().toISOString(),
      });
    }
  }
}

/**
 * Checks if a given IP address is blacklisted.
 */
export function isIpBlacklisted(ip: string): boolean {
  if (!ip || typeof ip !== "string") return false;
  const cleanIp = ip.trim();
  return blacklistedIpsMap.has(cleanIp);
}

/**
 * Adds an IP address to the active blacklist.
 */
export function blacklistIp(ip: string, reason: string = "Aktivitas mencurigakan atau pelanggaran ketentuan"): void {
  if (!ip || typeof ip !== "string") return;
  const cleanIp = ip.trim();
  blacklistedIpsMap.set(cleanIp, {
    ip: cleanIp,
    reason,
    createdAt: new Date().toISOString(),
  });
}

/**
 * Removes an IP address from the active blacklist.
 */
export function unblacklistIp(ip: string): void {
  if (!ip || typeof ip !== "string") return;
  blacklistedIpsMap.delete(ip.trim());
}

/**
 * Returns all currently blacklisted IP addresses.
 */
export function getBlacklistedIps(): BlacklistEntry[] {
  return Array.from(blacklistedIpsMap.values());
}

// ─── 3. Strict Auth Rate Limiter (IP & Browser Fingerprint) ──────────────────
// Max 5 attempts within 5 minutes for login / register to prevent credential stuffing & bot registration
const AUTH_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const MAX_AUTH_ATTEMPTS = 5;

interface AuthAttemptRecord {
  timestamps: number[];
  lockedUntil?: number;
}

const authAttemptsMap = new Map<string, AuthAttemptRecord>();

/**
 * Validates whether an authentication attempt is allowed under strict rate limits.
 */
export function checkAuthRateLimit(identifier: string): {
  allowed: boolean;
  remaining: number;
  retryAfterSec: number;
  reason?: string;
} {
  if (!identifier) return { allowed: true, remaining: MAX_AUTH_ATTEMPTS, retryAfterSec: 0 };

  const now = Date.now();
  const record = authAttemptsMap.get(identifier) || { timestamps: [] };

  // Check if currently locked
  if (record.lockedUntil && record.lockedUntil > now) {
    const retryAfterSec = Math.ceil((record.lockedUntil - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSec,
      reason: `Terlalu banyak percobaan autentikasi dari perangkat/jaringan ini. Harap tunggu ${retryAfterSec} detik sebelum mencoba kembali.`,
    };
  }

  // Filter timestamps within window
  const validTimestamps = record.timestamps.filter((ts) => now - ts < AUTH_WINDOW_MS);
  record.timestamps = validTimestamps;

  if (validTimestamps.length >= MAX_AUTH_ATTEMPTS) {
    // Lock for 5 minutes
    const lockDuration = 5 * 60 * 1000;
    record.lockedUntil = now + lockDuration;
    authAttemptsMap.set(identifier, record);

    return {
      allowed: false,
      remaining: 0,
      retryAfterSec: 300,
      reason: "Batas percobaan login/registrasi terlampaui (Maksimal 5 kali per 5 menit). Perangkat Anda dikunci sementara selama 5 menit untuk alasan keamanan.",
    };
  }

  return {
    allowed: true,
    remaining: MAX_AUTH_ATTEMPTS - validTimestamps.length,
    retryAfterSec: 0,
  };
}

/**
 * Records a failed authentication attempt against an identifier (IP or browser fingerprint).
 */
export function recordFailedAuthAttempt(identifier: string): void {
  if (!identifier) return;
  const now = Date.now();
  const record = authAttemptsMap.get(identifier) || { timestamps: [] };
  const validTimestamps = record.timestamps.filter((ts) => now - ts < AUTH_WINDOW_MS);
  validTimestamps.push(now);
  record.timestamps = validTimestamps;
  authAttemptsMap.set(identifier, record);
}

/**
 * Resets authentication attempts upon successful sign in.
 */
export function resetAuthRateLimit(identifier: string): void {
  if (!identifier) return;
  authAttemptsMap.delete(identifier);
}
