// Real-Time Multi-Platform Video Content & Transcript Analyzer Engine for LucidChat
import { performWebSearch } from "./web-search";

export interface VideoAnalysisResult {
  url: string;
  platform: "TikTok" | "YouTube" | "Instagram" | "Twitter" | "WebVideo";
  title: string;
  author: string;
  thumbnail: string;
  transcript: string;
  description: string;
  additionalContext: string[];
}

interface CaptionTrack {
  languageCode?: string;
  baseUrl?: string;
}

// 1. Detect video URLs in user text prompt
export function detectVideoUrls(text: string): { url: string; platform: "TikTok" | "YouTube" | "Instagram" | "Twitter" | "WebVideo" }[] {
  if (!text) return [];

  const results: { url: string; platform: "TikTok" | "YouTube" | "Instagram" | "Twitter" | "WebVideo" }[] = [];
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const matches = text.match(urlRegex) || [];

  for (let matchUrl of matches) {
    // Clean trailing punctuation
    matchUrl = matchUrl.replace(/[\),\.\?!]+$/, "");

    if (/tiktok\.com/i.test(matchUrl)) {
      results.push({ url: matchUrl, platform: "TikTok" });
    } else if (/youtube\.com|youtu\.be/i.test(matchUrl)) {
      results.push({ url: matchUrl, platform: "YouTube" });
    } else if (/instagram\.com\/(p|reel)/i.test(matchUrl)) {
      results.push({ url: matchUrl, platform: "Instagram" });
    } else if (/(twitter\.com|x\.com)\/[^\/]+\/status/i.test(matchUrl)) {
      results.push({ url: matchUrl, platform: "Twitter" });
    } else if (/\.(mp4|webm|mkv|mov)(\?.*)?$/i.test(matchUrl)) {
      results.push({ url: matchUrl, platform: "WebVideo" });
    }
  }

  return results;
}

// 2. Fetch details for YouTube videos (oEmbed + Subtitles/Transcript + Web Search fallback)
async function analyzeYouTubeVideo(url: string): Promise<VideoAnalysisResult> {
  let videoId = "";
  if (url.includes("youtu.be/")) {
    videoId = url.split("youtu.be/")[1]?.split("?")[0]?.split("#")[0] || "";
  } else if (url.includes("watch?v=")) {
    videoId = url.split("watch?v=")[1]?.split("&")[0]?.split("#")[0] || "";
  } else if (url.includes("shorts/")) {
    videoId = url.split("shorts/")[1]?.split("?")[0]?.split("#")[0] || "";
  }

  let title = "";
  let author = "";
  let thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  let transcript = "";
  let description = "";
  const additionalContext: string[] = [];

  // A. oEmbed metadata
  try {
    const oembedRes = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
    if (oembedRes.ok) {
      const data = await oembedRes.json();
      title = data.title || "";
      author = data.author_name || "";
      if (data.thumbnail_url) thumbnail = data.thumbnail_url;
    }
  } catch (err) {
    console.warn("YouTube oEmbed fetch failed:", err);
  }

  // B. Subtitles / Transcript Extraction
  if (videoId) {
    try {
      const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        },
      });
      if (pageRes.ok) {
        const html = await pageRes.text();

        // Extract description
        const descMatch = html.match(/"description":\s*\{\s*"simpleText":\s*"(.*?)"/s) || html.match(/<meta\s+name="description"\s+content="(.*?)"/i);
        if (descMatch) {
          description = descMatch[1].replace(/\\n/g, "\n").replace(/\\"/g, '"');
        }

        // Extract captions
        const captionsMatch = html.match(/"captionTracks":\s*(\[.*?\])/);
        if (captionsMatch) {
          const tracks = JSON.parse(captionsMatch[1]);
          if (Array.isArray(tracks) && tracks.length > 0) {
            const chosenTrack = tracks.find((t: CaptionTrack) => t.languageCode === "id") ||
                                tracks.find((t: CaptionTrack) => t.languageCode === "en") ||
                                tracks[0];
            if (chosenTrack?.baseUrl) {
              const subRes = await fetch(chosenTrack.baseUrl);
              if (subRes.ok) {
                const xmlSub = await subRes.text();
                transcript = xmlSub
                  .replace(/<text[^>]*>(.*?)<\/text>/gi, "$1 ")
                  .replace(/<[^>]+>/gi, "")
                  .replace(/&quot;/gi, '"')
                  .replace(/&#39;/gi, "'")
                  .replace(/&amp;/gi, "&")
                  .replace(/\s+/g, " ")
                  .trim();
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn("YouTube transcript fetch error:", err);
    }
  }

  // C. Fallback Web Search Context if transcript is sparse
  if (!transcript || transcript.length < 50) {
    try {
      const query = title ? `YouTube "${title}" ${author}` : `YouTube video ${videoId}`;
      const searchRes = await performWebSearch(query);
      for (const item of searchRes.slice(0, 3)) {
        additionalContext.push(`[${item.source}] ${item.title}: ${item.snippet}`);
      }
    } catch (err) {
      console.warn("YouTube web search fallback error:", err);
    }
  }

  return {
    url,
    platform: "YouTube",
    title,
    author,
    thumbnail,
    transcript,
    description,
    additionalContext,
  };
}

// 3. Fetch details for TikTok videos (Short link expansion + TikWM API + Web Search fallback)
async function analyzeTikTokVideo(url: string): Promise<VideoAnalysisResult> {
  let expandedUrl = url;
  let title = "";
  let author = "";
  let thumbnail = "";
  let description = "";
  const additionalContext: string[] = [];

  // A. Expand short links (vt.tiktok.com / vm.tiktok.com)
  try {
    const headRes = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      },
    });
    if (headRes.url) {
      expandedUrl = headRes.url;
    }
  } catch (err) {
    console.warn("TikTok URL expansion error:", err);
  }

  // B. Try TikWM API
  try {
    const tikwmRes = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(expandedUrl)}`);
    if (tikwmRes.ok) {
      const json = await tikwmRes.json();
      if (json.code === 0 && json.data) {
        title = json.data.title || "";
        description = json.data.title || "";
        author = json.data.author?.nickname
          ? `${json.data.author.nickname} (@${json.data.author.unique_id})`
          : json.data.author?.unique_id || "";
        thumbnail = json.data.cover || json.data.origin_cover || "";
        if (json.data.music_info?.title) {
          additionalContext.push(`Audio/Musik TikTok: ${json.data.music_info.title} oleh ${json.data.music_info.author || "Kreator"}`);
        }
      }
    }
  } catch (err) {
    console.warn("TikWM API error:", err);
  }

  // C. Fallback: TikTok oEmbed
  if (!title) {
    try {
      const oembedRes = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(expandedUrl)}`);
      if (oembedRes.ok) {
        const data = await oembedRes.json();
        title = data.title || "";
        author = data.author_name ? `${data.author_name} (@${data.author_unique_id})` : "";
        if (data.thumbnail_url) thumbnail = data.thumbnail_url;
      }
    } catch (err) {
      console.warn("TikTok oEmbed error:", err);
    }
  }

  // D. Search Crawler for TikTok Context & Discussions
  try {
    const searchQuery = title
      ? `TikTok video "${title.slice(0, 60)}"`
      : `TikTok video ${expandedUrl}`;
    const searchRes = await performWebSearch(searchQuery);
    for (const item of searchRes.slice(0, 4)) {
      additionalContext.push(`[${item.source}] ${item.title}: ${item.snippet}`);
    }
  } catch (err) {
    console.warn("TikTok web search fallback error:", err);
  }

  return {
    url: expandedUrl,
    platform: "TikTok",
    title,
    author,
    thumbnail,
    transcript: "",
    description,
    additionalContext,
  };
}

// 4. Fetch details for Instagram / Twitter / General Web Videos
async function analyzeGeneralVideo(url: string, platform: "Instagram" | "Twitter" | "WebVideo"): Promise<VideoAnalysisResult> {
  let title = "";
  const author = "";
  const thumbnail = "";
  let description = "";
  const additionalContext: string[] = [];

  try {
    const searchRes = await performWebSearch(`video ${platform} ${url}`);
    if (searchRes.length > 0) {
      title = searchRes[0].title;
      description = searchRes[0].snippet;
      for (const item of searchRes.slice(0, 3)) {
        additionalContext.push(`[${item.source}] ${item.title}: ${item.snippet}`);
      }
    }
  } catch (err) {
    console.warn("General video analysis search error:", err);
  }

  return {
    url,
    platform,
    title,
    author,
    thumbnail,
    transcript: "",
    description,
    additionalContext,
  };
}

// Main Video Analyzer Entry Point
export async function analyzeVideoUrl(url: string, platform: "TikTok" | "YouTube" | "Instagram" | "Twitter" | "WebVideo"): Promise<VideoAnalysisResult> {
  if (platform === "YouTube") {
    return analyzeYouTubeVideo(url);
  } else if (platform === "TikTok") {
    return analyzeTikTokVideo(url);
  } else {
    return analyzeGeneralVideo(url, platform);
  }
}

// Format video analysis result into system prompt context for AI
export function formatVideoContextForAI(results: VideoAnalysisResult[]): string {
  if (!results || results.length === 0) return "";

  let promptContext = "\n\n======================================================\n" +
    "HASIL ANALISIS KONTEKS VIDEO REAL-TIME TERDETEKSI (VIDEO CONTENT & TRANSCRIPT ENGINE):\n" +
    "Sistem telah secara otomatis mendeteksi link video dari pengguna dan mengekstrak informasi metadata, judul, kreator, deskripsi, transkrip percakapan, serta konteks publik terkait.\n\n";

  for (let idx = 0; idx < results.length; idx++) {
    const v = results[idx];
    promptContext += `--- VIDEO #${idx + 1} [PLATFORM: ${v.platform.toUpperCase()}] ---\n`;
    promptContext += `URL: ${v.url}\n`;
    if (v.title) promptContext += `Judul / Caption Video: "${v.title}"\n`;
    if (v.author) promptContext += `Kreator / Uploader: ${v.author}\n`;
    if (v.description) promptContext += `Deskripsi Video: "${v.description}"\n`;
    if (v.transcript) {
      promptContext += `TRANSKRIP / TEKS PERCAKAPAN LENGKAP VIDEO:\n"${v.transcript}"\n`;
    }
    if (v.additionalContext.length > 0) {
      promptContext += `KONTEKS & DISKUSI TERKAIT:\n` + v.additionalContext.map((c) => `- ${c}`).join("\n") + "\n";
    }
    promptContext += "\n";
  }

  promptContext += `INSTRUKSI PENTING ANALISIS VIDEO UNTUK AI (MANDATORI):\n` +
    `1. Pengguna meminta Anda menganalisis video di atas. Berikan penjelaskan yang SANGAT JELAS, LENGKAP, dan MENDALAM tentang isi video, topik utama, poin-poin percakapan/kejadian dalam video, dan pesan yang disampaikan kreator.\n` +
    `2. Jika ada pertanyaan spesifik dari pengguna tentang video tersebut, jawablah secara presisi berdasarkan transkrip, deskripsi, dan konteks video yang telah diekstrak di atas.\n` +
    `3. Jawablah SELALU dalam Bahasa Indonesia murni yang profesional, terstruktur, dan ramah.\n` +
    `======================================================\n`;

  return promptContext;
}
