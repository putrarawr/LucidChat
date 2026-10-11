import { groq } from "@/lib/ai-clients";

export const INJECTION_PATTERNS = [
  // 1. System Prompt Override & Instruction Wipes (Bilingual ID & EN)
  /ignore\s+(all\s+|any\s+)?(previous|prior|above|initial|system)\s+(instructions?|prompts?|rules?|directives?|commands?)/i,
  /abaikan\s+(semua\s+|seluruh\s+)?(instruksi|aturan|prompt|perintah|pedoman)\s+(sebelumnya|di\s*atas|awal|sistem)/i,
  /forget\s+(everything|all|your|prior)\s+(instructions?|rules?|training|guidelines?)/i,
  /lupakan\s+(semua\s+|seluruh\s+)?(instruksi|aturan|perintah|pelatihan)\s*(kamu|anda)?/i,
  /disregard\s+(the\s+|all\s+|any\s+)?(system\s+prompt|guidelines?|safety\s+rules?|constraints?)/i,
  /kesampingkan\s+(semua\s+)?(aturan|filter|batasan|instruksi\s+sistem)/i,
  /reset\s+your\s+(instructions|programming|safety\s+filters|alignment)/i,

  // 2. Persona, Roleplay & Jailbreak Exploitation (Targeting unrestricted/uncensored evasion)
  /\b(DAN|AIM|STAN|Mongo|DUDE|Jailbreak|DeveloperMode)\b.*?(mode|jailbreak|unrestricted|uncensored|bypass|do\s+anything)/i,
  /(enter|enable|activate|switch\s+to)\s+(jailbreak|developer|god|unrestricted|uncensored|chaos|omega|dan)\s*mode/i,
  /(aktifkan|masuk\s+ke)\s+mode\s*(developer|pengembang|tanpa\s+sensor|tanpa\s+filter|bebas|jailbreak)/i,
  /developer\s*mode\s*[:=]?\s*(is\s+)?(enabled|on|active|activated)/i,
  /(you\s+are\s+now|act\s+as|pretend\s+to\s+be|roleplay\s+as)\s+(an?\s+)?(unrestricted|unfiltered|uncensored|jailbroken|evil|unaligned|illegal|boundless|lawless)\s*(ai|assistant|model|bot|entity|character)?/i,
  /(kamu\s+sekarang\s+adalah|berperanlah\s+sebagai|jadilah|beraktinglah\s+sebagai)\s+(sebuah\s+)?(ai|asisten|bot|karakter|entitas)?\s*(tanpa\s+(sensor|filter|aturan|batasan|etika|moral)|jahat|kebal\s+aturan)/i,
  /pretend\s+(there\s+are\s+no|you\s+have\s+no)\s+(rules|boundaries|filters|ethics|safety\s+guidelines|constraints)/i,
  /pura-pura(lah)?\s+(tidak\s+ada|kamu\s+tidak\s+punya)\s+(aturan|filter|sensor|batasan|etika)/i,
  /stay\s+in\s+character\s+as\s+(an?\s+)?(unfiltered|uncensored|evil|jailbroken|lawless)/i,
  /tetaplah\s+dalam\s+karakter\s+(tanpa\s+filter|tanpa\s+sensor|jahat|bebas\s+aturan)/i,

  // 3. Simulation, Hypothetical & Fictional Framing Evasion
  /(purely\s+|just\s+a\s+)?hypothetical\s*(scenario|world|situation|question|conversation).*?(rules|safety|ethics|filters|guidelines).*?(disabled|ignored|bypassed|do\s+not\s+apply|dont\s+apply|none)/i,
  /(skenario|situasi|kondisi)\s*hipotetis.*?(aturan|filter|etika|keamanan).*?(tidak\s+berlaku|dimatikan|diabaikan|tidak\s+ada)/i,
  /(in\s+a|write\s+a)\s+fictional\s*(story|novel|scene|script|universe).*?(no\s+(rules|filters|morals)|filters\s+are\s+turned\s+off|unfiltered\s+ai|unrestricted)/i,
  /(dalam|tuliskan)\s*(sebuah\s+)?(cerita|kisah|novel|skenario)\s*fiktif.*?(tidak\s+terikat\s+aturan|filter\s+dimatikan|ai\s+tanpa\s+moral|tanpa\s+sensor)/i,
  /(let'?s|lets)\s*play\s*a\s*(game|roleplay).*?(no\s+rules|safety\s+is\s+disabled|rules\s+are\s+lifted|unrestricted)/i,
  /mari\s*bermain\s*(game|peran|roleplay).*?(bebas\s+aturan|filter\s+mati|aturan\s+dihapus)/i,
  /for\s*(academic|research|educational|hypothetical)\s*purposes?\s*only.*?,\s*(ignore|bypass|disable|override)\s*(safety|filters|rules)/i,
  /hanya\s*untuk\s*(tujuan\s+)?(riset|penelitian|akademis|edukasi).*?,\s*(abaikan|bypass|matikan)\s*(keamanan|filter|aturan)/i,

  // 4. Dual-Persona / Split Response Attacks
  /(respond|answer|generate)\s*(with|in)\s*two\s*(modes|responses|answers|personas):?[\s\S]*?(standard|normal|safe)[\s\S]*?(unrestricted|jailbreak|developer|unfiltered|evil)/i,
  /(berikan|buatkan)\s*dua\s*(jawaban|respon):?[\s\S]*?(normal|baku|standar)[\s\S]*?(bebas|tanpa\s+sensor|developer|uncensored)/i,
  /\[\s*(standard|normal|classic)\s*response\s*\][\s\S]*?\[\s*(jailbreak|unfiltered|developer|evil)\s*response\s*\]/i,
  /\[\s*normal\s*mode\s*\][\s\S]*?\[\s*(developer|uncensored)\s*mode\s*\]/i,

  // 5. System Prompt Extraction & Leak Attempts
  /(print|reveal|show|display|output|echo|leak|dump)\s+(your\s+)?(initial|original|entire|full|complete|hidden|secret|system)\s+(instructions?|prompt|rules?|directives?)/i,
  /(tampilkan|bocorkan|tuliskan|cetak|perlihatkan|salin)\s+(seluruh|semua)?\s*(system\s+prompt|instruksi\s+sistem|instruksi\s+awal|aturan\s+sistem|prompt\s+rahasia)/i,
  /repeat\s+(all\s+)?(the\s+)?(words?|text)\s+(above|from\s+the\s+beginning|preceding\s+this)/i,
  /ulangi\s+(semua\s+)?(kata|teks)\s+(di\s+atas|dari\s+awal)/i,
  /what\s+are\s+your\s+(initial|original|system|internal)\s+(instructions?|guidelines?|rules?)/i,
  /apa\s+(saja\s+)?(instruksi|aturan|prompt)\s+(awal|asli|internal|sistem)\s*(kamu|anda)?/i,
  /translate\s+(your\s+)?(system\s+prompt|initial\s+instructions)\s+(in|to|into)/i,
  /terjemahkan\s+(instruksi\s+sistem|system\s+prompt)\s+kamu\s+ke/i,

  // 6. Delimiter Hijacking & Masquerading
  /<\/?\s*(system_instructions|user_input|system_prompt|sys|system)\s*>/i,
  /\[\s*(SYSTEM|SYSTEM_OVERRIDE|SYSTEM_MESSAGE|SYS|INST|INSTRUCTION)\s*\]/i,
  /<<\s*SYS\s*>>/i,
  /<\|\s*(im_start|im_end|system)\s*\|>/i,
  /###\s*(System|Instruction|Assistant)\s*:/i,
  /```system\b/i,

  // 7. Master Prompt, Canon Roleplay & Fictional Story/RPG Simulator Hijackings
  /\b(master|ultimate)\s+prompt\b.*?(roleplay|simulator|rpg|canon|npc|character|anime|cerita)/i,
  /\b(canon\s+roleplay\s+simulator|roleplay\s+simulator|anime\s+roleplay\s+simulator|text\s+rpg\s+simulator|game\s+master\s+simulator)\b/i,
  /(mulai\s+sekarang|mulai\s+saat\s+ini|dari\s+sekarang)\s*,?\s*(kamu\s+adalah|jadilah)\s+.*?(roleplay|simulator|npc|mesin\s+rpg|canon\s+simulator|game\s+master)/i,
  /(from\s+now\s+on|starting\s+now)\s*,?\s*(you\s+are|act\s+as)\s+.*?(roleplay|simulator|npc|rpg\s+engine|canon\s+simulator|game\s+master)/i,
  /(tugasmu|tujuanmu|fungsi\s+kamu)\s+adalah\s+(membangun\s+dunia|mengendalikan\s+npc|menjalankan\s+simulasi\s+roleplay|menjadi\s+game\s+master)/i,
  /(your\s+(task|job|duty|purpose)\s+is\s+to\s+(build\s+a\s+world|control\s+npcs|run\s+a\s+roleplay\s+simulation|act\s+as\s+a\s+game\s+master))/i,
  /\b(dunia\s+dan\s+npc\s+dikendalikan\s+ai|tindakan\s+penting\s+oc\s+wajib\s+berada\s+di\s+tangan\s+pengguna)\b/i,
  /\b(original\s+character\s*\(?oc\)?|karakter\s+original\s*\(?oc\)?).*?(alur\s+canon|dunia\s+(anime|manga|donghua|novel|film)|kepatuhan\s+canon|mengendalikan\s+npc)/i,
  /(bagian|tahap)\s*\d+\s*[-—:]\s*(pengaturan\s+awal\s+roleplay|pembuatan\s+karakter\s+oc|setup\s+roleplay)/i,
  /sebelum\s+cerita\s+dimulai\s*,\s*tanyakan\s+informasi\s+berikut\s+kepada\s+pengguna/i,
  /(tingkat\s+kesulitan\s+simulasi|mode\s+kepatuhan\s+canon|kecepatan\s+perkembangan\s+karakter)/i,
];

export const ROLEPLAY_SIMULATOR_PATTERNS = [
  /\b(master|ultimate)\s+prompt\b.*?(roleplay|simulator|rpg|canon|npc|character|anime|cerita)/i,
  /\b(canon\s+roleplay\s+simulator|roleplay\s+simulator|anime\s+roleplay\s+simulator|text\s+rpg\s+simulator|game\s+master\s+simulator)\b/i,
  /(mulai\s+sekarang|mulai\s+saat\s+ini|dari\s+sekarang)\s*,?\s*(kamu\s+adalah|jadilah)\s+.*?(roleplay|simulator|npc|mesin\s+rpg|canon\s+simulator|game\s+master)/i,
  /(from\s+now\s+on|starting\s+now)\s*,?\s*(you\s+are|act\s+as)\s+.*?(roleplay|simulator|npc|rpg\s+engine|canon\s+simulator|game\s+master)/i,
  /(tugasmu|tujuanmu|fungsi\s+kamu)\s+adalah\s+(membangun\s+dunia|mengendalikan\s+npc|menjalankan\s+simulasi\s+roleplay|menjadi\s+game\s+master)/i,
  /(your\s+(task|job|duty|purpose)\s+is\s+to\s+(build\s+a\s+world|control\s+npcs|run\s+a\s+roleplay\s+simulation|act\s+as\s+a\s+game\s+master))/i,
  /\b(dunia\s+dan\s+npc\s+dikendalikan\s+ai|tindakan\s+penting\s+oc\s+wajib\s+berada\s+di\s+tangan\s+pengguna)\b/i,
  /\b(original\s+character\s*\(?oc\)?|karakter\s+original\s*\(?oc\)?).*?(alur\s+canon|dunia\s+(anime|manga|donghua|novel|film)|kepatuhan\s+canon|mengendalikan\s+npc)/i,
  /(bagian|tahap)\s*\d+\s*[-—:]\s*(pengaturan\s+awal\s+roleplay|pembuatan\s+karakter\s+oc|setup\s+roleplay)/i,
  /sebelum\s+cerita\s+dimulai\s*,\s*tanyakan\s+informasi\s+berikut\s+kepada\s+pengguna/i,
  /(tingkat\s+kesulitan\s+simulasi|mode\s+kepatuhan\s+canon|kecepatan\s+perkembangan\s+karakter)/i,
];

/**
 * Escapes/neutralizes delimiter tags in user content to prevent prompt delimiter breakouts.
 */
export function sanitizePromptDelimiters(input: string): string {
  if (!input) return "";
  return input
    .replace(/<\/?\s*system_instructions\s*>/gi, (match) => `&lt;${match.slice(1, -1)}&gt;`)
    .replace(/<\/?\s*user_input\s*>/gi, (match) => `&lt;${match.slice(1, -1)}&gt;`)
    .replace(/<\/?\s*(system|sys)\s*>/gi, (match) => `&lt;${match.slice(1, -1)}&gt;`)
    .replace(/\[\s*(SYSTEM|SYSTEM_OVERRIDE|SYS|INST|INSTRUCTION)\s*\]/gi, (match) => `[ESCAPED_${match.slice(1, -1).trim()}]`)
    .replace(/<<\s*SYS\s*>>/gi, "&lt;&lt;SYS&gt;&gt;")
    .replace(/<\|\s*(im_start|im_end|system)\s*\|>/gi, (match) => `&lt;|${match.slice(2, -2)}|&gt;`);
}

/**
 * Fast pattern-based injection and jailbreak detector with obfuscation inspection.
 */
export function checkPatternInjection(input: string): { safe: boolean; reason?: string } {
  if (!input || typeof input !== "string") return { safe: true };

  // Strip zero-width characters and invisible control chars
  const normalized = input
    .replace(/[\u200B-\u200D\uFEFF\u00A0\u200E\u200F]/g, "")
    .replace(/\r\n/g, "\n");

  // 1. Roleplay Simulator Specific Check
  for (const pattern of ROLEPLAY_SIMULATOR_PATTERNS) {
    if (pattern.test(normalized)) {
      return {
        safe: false,
        reason: "Permintaan ditolak: LucidChat difokuskan untuk produktivitas, analisis kode, riset, dan penalaran teknis. Master prompt simulasi roleplay fiksi mendalam (RPG/NPC/Canon simulator) tidak didukung pada sistem ini.",
      };
    }
  }

  // 2. Direct Pattern Check
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(normalized)) {
      return {
        safe: false,
        reason: "Pesan terdeteksi mengandung upaya manipulasi prompt, jailbreak, simulasi/roleplay override, atau kebocoran instruksi sistem.",
      };
    }
  }

  // 2. Base64 payload inspection (detect obfuscated injection chunks)
  const base64Regex = /([A-Za-z0-9+/]{20,}={0,2})/g;
  let match;
  while ((match = base64Regex.exec(normalized)) !== null) {
    try {
      const decoded = Buffer.from(match[1], "base64").toString("utf-8");
      if (/^[\x20-\x7E\s]+$/.test(decoded)) {
        for (const pattern of INJECTION_PATTERNS) {
          if (pattern.test(decoded)) {
            return {
              safe: false,
              reason: "Pesan terdeteksi mengandung payload terselubung (Base64) yang melanggar kebijakan keamanan sistem.",
            };
          }
        }
      }
    } catch {
      // Ignore decode error
    }
  }

  return { safe: true };
}

/**
 * Multi-layer guardrail inspection covering current message, conversation history, attachments, and optional Llama Guard.
 */
export async function runGuardrail(
  message: string,
  options?: {
    history?: { role: string; content: string }[];
    attachments?: { name?: string; content?: string; type?: string }[];
  }
): Promise<{ safe: boolean; reason?: string }> {
  // Step 1: Check primary user input
  const mainCheck = checkPatternInjection(message);
  if (!mainCheck.safe) return mainCheck;

  // Step 2: Check attachments (if any text/code attachment contains jailbreaks)
  if (options?.attachments && Array.isArray(options.attachments)) {
    for (const att of options.attachments) {
      if (att.content && typeof att.content === "string") {
        const attCheck = checkPatternInjection(att.content);
        if (!attCheck.safe) {
          return {
            safe: false,
            reason: `Lampiran file (${att.name || "lampiran"}) terdeteksi mengandung instruksi yang melanggar kebijakan keamanan.`,
          };
        }
      }
    }
  }

  // Step 3: Check recent conversation turns (anti-split jailbreaks)
  if (options?.history && Array.isArray(options.history)) {
    const recentTurns = options.history
      .filter((m) => m.role === "user")
      .slice(-2)
      .map((m) => m.content)
      .join(" \n ");
    if (recentTurns) {
      const combined = `${recentTurns} \n ${message}`;
      const splitCheck = checkPatternInjection(combined);
      if (!splitCheck.safe) return splitCheck;
    }
  }

  // Step 4: Model-based check via Llama Guard (if enabled in env and key available)
  if (process.env.ENABLE_LLAMA_GUARD === "true" && process.env.GROQ_API_KEY) {
    try {
      const response = await groq.chat.completions.create({
        model: "llama-guard-3-8b",
        messages: [{ role: "user", content: message }],
      });
      const verdict = response.choices[0]?.message?.content ?? "";
      if (verdict.toLowerCase().startsWith("unsafe")) {
        return {
          safe: false,
          reason: "Konten dinilai tidak aman oleh model pengawas keselamatan AI.",
        };
      }
    } catch (err) {
      console.warn("Llama Guard check skipped or fallback to pattern check:", err);
    }
  }

  return { safe: true };
}
