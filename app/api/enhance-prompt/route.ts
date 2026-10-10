import { NextRequest } from "next/server";
import { googleAI } from "@/lib/ai-clients";
import { runGuardrail, sanitizePromptDelimiters } from "@/lib/guardrail";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return new Response(JSON.stringify({ error: "Prompt tidak boleh kosong." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 1. Guardrail inspection on input prompt
    const guardrailVerdict = await runGuardrail(prompt);
    if (!guardrailVerdict.safe) {
      return new Response(JSON.stringify({ error: guardrailVerdict.reason }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const cleanPrompt = sanitizePromptDelimiters(prompt.trim());

    const geminiModel = googleAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      systemInstruction: "Anda adalah Prompt Engineering Expert tingkat tinggi yang bertanggung jawab menghasilkan instruksi terstruktur, spesifik, faktual, dan aman.",
    });

    const enhancementInstruction = `Ubah prompt pengguna di bawah ini menjadi prompt yang JAUH LEBIH SPESIFIK, TERSTRUKTUR, DAN BERKUALITAS TINGGI dalam Bahasa Indonesia.

PEDOMAN MUTLAK:
1. Pahami dan pertahankan maksud inti asli dari pengguna. DILARANG mengubah tujuan atau menambahkan asumsi palsu/halusinasi yang bertentangan dengan maksud pengguna.
2. Tambahkan elemen penting: konteks tujuan, batasan teknis/kualitas, ekspektasi format keluaran, dan instruksi presisi.
3. KEAMANAN: DILARANG KERAS menyisipkan persona jailbreak, bypass batasan keamanan, manipulasi roleplay terlarang, atau kata-kata pembatalan aturan.
4. HANYA kembalikan teks prompt hasil perbaikan secara langsung, tanpa kata pengantar, tanpa tanda kutip pembungkus, dan tanpa penjelasan tambahan.

Prompt Asli Pengguna:
"${cleanPrompt}"`;

    const result = await geminiModel.generateContent(enhancementInstruction);
    const enhancedPrompt = result.response.text().trim();

    return new Response(JSON.stringify({ enhancedPrompt }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal Error";
    console.error("Enhance Prompt API Error:", err);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
