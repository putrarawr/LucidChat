import { detectVideoUrls, analyzeVideoUrl, formatVideoContextForAI } from "../lib/video-analyzer.ts";

async function testExactUrl() {
  const url = "https://vt.tiktok.com/ZSqXhrBmW/";
  console.log("=== Testing User TikTok URL ===", url);

  try {
    const detected = detectVideoUrls(url);
    console.log("Detected:", detected);

    const videoResults = await Promise.all(
      detected.map((v) => analyzeVideoUrl(v.url, v.platform))
    );

    console.log("Video Results:", videoResults);

    const promptContext = formatVideoContextForAI(videoResults);
    console.log("Formatted Context length:", promptContext.length);
  } catch (err) {
    console.error("EXACT ERROR:", err);
  }
}

testExactUrl();
