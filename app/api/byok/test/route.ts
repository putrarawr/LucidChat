import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { provider, apiKey, baseUrl } = await req.json();

    if (!provider) {
      return NextResponse.json({ success: false, error: "Provider tidak ditentukan." }, { status: 400 });
    }

    if (provider !== "custom" && (!apiKey || !apiKey.trim())) {
      return NextResponse.json({ success: false, error: "API Key tidak boleh kosong." }, { status: 400 });
    }

    const cleanKey = (apiKey || "").trim();
    const cleanUrl = (baseUrl || "").trim();

    if (provider === "gemini") {
      try {
        const genAI = new GoogleGenerativeAI(cleanKey);
        // Test with the fastest lightweight model
        const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });
        await model.generateContent({
          contents: [{ role: "user", parts: [{ text: "hi" }] }],
          generationConfig: { maxOutputTokens: 2 },
        });
        return NextResponse.json({
          success: true,
          message: "Koneksi Google Gemini berhasil! API Key aktif dan siap digunakan tanpa batas harian server.",
        });
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        let userFriendly = errMsg;
        if (errMsg.includes("API_KEY_INVALID") || errMsg.includes("400") || errMsg.includes("not valid")) {
          userFriendly = "API Key tidak valid atau belum diaktifkan di Google AI Studio.";
        } else if (errMsg.includes("429") || errMsg.includes("Resource has been exhausted")) {
          userFriendly = "API Key valid, namun kuota akun ini saat ini sedang terlampaui (Rate Limit 429).";
        }
        return NextResponse.json({ success: false, error: userFriendly }, { status: 400 });
      }
    }

    if (provider === "groq") {
      try {
        const client = new OpenAI({
          apiKey: cleanKey,
          baseURL: "https://api.groq.com/openai/v1",
        });
        await client.chat.completions.create({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: "hi" }],
          max_tokens: 2,
        });
        return NextResponse.json({
          success: true,
          message: "Koneksi Groq berhasil! API Key valid dan siap menghasilkan respons super cepat.",
        });
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        let userFriendly = errMsg;
        if (errMsg.includes("401") || errMsg.includes("invalid_api_key")) {
          userFriendly = "Groq API Key tidak valid. Pastikan diawali dengan gsk_...";
        } else if (errMsg.includes("429")) {
          userFriendly = "Groq API Key valid, namun limit per menit sedang penuh. Silakan tunggu sebentar.";
        }
        return NextResponse.json({ success: false, error: userFriendly }, { status: 400 });
      }
    }

    if (provider === "openrouter") {
      try {
        const client = new OpenAI({
          apiKey: cleanKey,
          baseURL: "https://openrouter.ai/api/v1",
        });
        // Testing models list is free and instant
        const res = await client.models.list();
        if (res && res.data) {
          return NextResponse.json({
            success: true,
            message: "Koneksi OpenRouter berhasil! API Key valid dan terverifikasi.",
          });
        }
        return NextResponse.json({ success: true, message: "Koneksi OpenRouter berhasil!" });
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        let userFriendly = errMsg;
        if (errMsg.includes("401") || errMsg.includes("Key not found")) {
          userFriendly = "OpenRouter API Key tidak valid. Pastikan diawali dengan sk-or-...";
        }
        return NextResponse.json({ success: false, error: userFriendly }, { status: 400 });
      }
    }

    if (provider === "custom") {
      if (!cleanUrl) {
        return NextResponse.json({ success: false, error: "Custom Base URL tidak boleh kosong." }, { status: 400 });
      }
      try {
        const client = new OpenAI({
          apiKey: cleanKey || "dummy-key",
          baseURL: cleanUrl,
        });
        await client.models.list();
        return NextResponse.json({
          success: true,
          message: "Koneksi Custom Endpoint berhasil! Server merespons format OpenAI.",
        });
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        return NextResponse.json({
          success: false,
          error: `Gagal terhubung ke custom endpoint: ${errMsg}. Pastikan CORS dan format endpoint /v1 benar.`,
        }, { status: 400 });
      }
    }

    return NextResponse.json({ success: false, error: "Provider tidak didukung." }, { status: 400 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
