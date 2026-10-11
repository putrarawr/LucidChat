/**
 * Multi-Layer AI Moderation Engine for LucidChat
 * Integrates OpenAI Moderation API (omni-moderation-latest - free endpoint)
 * with robust bilingual custom regex safety rules as fallback/pre-filter.
 */

export interface ModerationResult {
  flagged: boolean;
  categories: string[];
  reason?: string;
  provider?: "openai" | "rule-engine";
}

// ─── Custom Zero-Latency Rule-Based Moderation Patterns ──────────────────────
const MODERATION_PATTERNS: { category: string; regex: RegExp; message: string }[] = [
  // 1. Sexual Violence, CSAM & Explicit Exploitation
  {
    category: "sexual/minors",
    regex: /\b(child\s*porn|cp\b|pedophil|pedofil|underage\s*(sex|nude)|eksploitasi\s*seksual\s*anak|lolita\s*nsfw|incest\s*(video|cerita)|perkosaan\s*nyata)\b/i,
    message: "Konten terdeteksi memuat eksploitasi seksual anak atau materi seksual terlarang.",
  },
  {
    category: "sexual/explicit",
    regex: /\b(write|generate|buatkan|tuliskan)\s+(an?\s+)?(explicit|hardcore|erotic|nsfw|pornographic|hentai)\s*(story|scene|cerita|adegan|konten|novel)\b/i,
    message: "Permintaan pembuatan konten pornografi / erotika eksplisit tidak diizinkan.",
  },

  // 2. Self-Harm, Suicide & Self-Mutilation
  {
    category: "self-harm",
    regex: /\b(how\s+to\s+(kill|hang|slits?\s*wrists?)\s*(myself|oneself)|cara\s*(bunuh\s*diri|gantung\s*diri|sayat\s*pergelangan|overdosis\s*mematikan)|panduan\s*bunuh\s*diri|cara\s*mengakhiri\s*hidup)\b/i,
    message: "Konten memuat indikasi dorongan atau instruksi melukai diri sendiri / bunuh diri. Jika Anda membutuhkan bantuan, hubungi layanan konseling atau hotline kesehatan mental.",
  },

  // 3. Violence, Explosives, Weapons & Terrorism
  {
    category: "violence/weapons",
    regex: /\b(how\s+to\s+(make|build|cook|synthesize)\s+(a\s+)?(bomb|explosive|ricin|anthrax|sarin|pipe\s*bomb|ied\b)|cara\s*(membuat|merakit)\s*(bom|bahan\s*peledak|senjata\s*(kimia|biologis)|molotov)|panduan\s*merakit\s*bom)\b/i,
    message: "Konten memuat instruksi pembuatan senjata berbahaya, bom, atau bahan peledak ilegal.",
  },
  {
    category: "violence/attack",
    regex: /\b(how\s+to\s+(commit|plan)\s+(a\s+)?(mass\s*shooting|terrorist\s*attack|assassination)|rencana\s*(penembakan\s*massal|serangan\s*teror|pembunuhan\s*berencana))\b/i,
    message: "Konten memuat perencanaan aksi kekerasan nyata atau serangan teror.",
  },

  // 4. Hate Speech & Genocide
  {
    category: "hate",
    regex: /\b(kill\s+all\s+(jews|muslims|christians|blacks|whites|asians|papuans)|habisi\s+semua\s+(yahudi|muslim|kristen|cina|papua)|genosida\s*(etnis|ras)|white\s*supremacist\s*manifesto)\b/i,
    message: "Konten memuat ujaran kebencian ekstrem, dorongan genosida, atau diskriminasi SARA.",
  },

  // 5. Cybercrime & Malicious Exploitation
  {
    category: "illicit/cyber",
    regex: /\b(write|create|buatkan|kodingkan)\s+(a\s+)?(ransomware|keylogger|trojan\s*virus|ddos\s*script\s*attack|stealer\s*malware|zero-day\s*exploit\s*payload)\b/i,
    message: "Permintaan pembuatan perangkat perusak (malware, ransomware, keylogger) dilarang.",
  },
];

/**
 * Fast pattern-based safety checker.
 */
export function checkRuleBasedModeration(text: string): ModerationResult {
  if (!text || typeof text !== "string") {
    return { flagged: false, categories: [] };
  }

  const normalized = text.replace(/\r\n/g, "\n");

  for (const item of MODERATION_PATTERNS) {
    if (item.regex.test(normalized)) {
      return {
        flagged: true,
        categories: [item.category],
        reason: item.message,
        provider: "rule-engine",
      };
    }
  }

  return { flagged: false, categories: [] };
}

/**
 * Runs OpenAI Moderation API (omni-moderation-latest) with local regex fallback.
 */
export async function checkContentModeration(text: string): Promise<ModerationResult> {
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return { flagged: false, categories: [] };
  }

  // Step 1: Instant local regex inspection
  const localCheck = checkRuleBasedModeration(text);
  if (localCheck.flagged) {
    return localCheck;
  }

  // Step 2: OpenAI Free Moderation API Check (if API key available)
  const openAiKey = process.env.OPENAI_API_KEY;
  if (openAiKey && openAiKey !== "dummy-openai-key") {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s timeout

      const res = await fetch("https://api.openai.com/v1/moderations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          input: text,
          model: "omni-moderation-latest",
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const result = data?.results?.[0];

        if (result && result.flagged) {
          const flaggedCategories: string[] = [];
          if (result.categories) {
            for (const [cat, isFlagged] of Object.entries(result.categories)) {
              if (isFlagged) {
                flaggedCategories.push(cat);
              }
            }
          }

          const categoryListStr = flaggedCategories.join(", ");
          return {
            flagged: true,
            categories: flaggedCategories,
            reason: `Pesan ditolak oleh Moderasi Keamanan Otomatis (Kategori terdeteksi: ${categoryListStr || "konten sensitif/berbahaya"}). LucidChat menerapkan kebijakan zero-tolerance terhadap ujaran kebencian, materi seksual eksplisit, kekerasan, dan konten berbahaya.`,
            provider: "openai",
          };
        }
      }
    } catch (err) {
      console.warn("OpenAI Moderation API Check bypassed due to timeout/network:", err);
    }
  }

  return { flagged: false, categories: [] };
}
