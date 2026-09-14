import { NextRequest } from "next/server";
import { googleAI } from "@/lib/ai-clients";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return new Response(JSON.stringify({ error: "Prompt tidak boleh kosong." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const geminiModel = googleAI.getGenerativeModel({ model: "gemini-3.6-flash" });

    const enhancementInstruction = `Anda adalah Prompt Engineering Expert tingkat tinggi.
Tugas Anda: Ubah prompt pengguna yang singkat, samar, atau sederhana di bawah ini menjadi prompt yang SANGAT RINCI, SPESIFIK, TERSTRUKTUR, dan BERKUALITAS TINGGI dalam Bahasa Indonesia.

ATURAN UTAMA:
1. PERTUTURKAN maksud utama pengguna tanpa mengubah tujuan aslinya.
2. Tambahkan rincian penting seperti: tujuan utama, konteks, batasan, format output yang diharapkan, serta kualitas/estetika yang diinginkan.
3. HANYA kembalikan teks prompt hasil perbaikan langsung tanpa kata pengantar, tanpa tanda kutip di luar, dan tanpa penjelasan tambahan.

Prompt Asli Pengguna:
"${prompt.trim()}"`;

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
