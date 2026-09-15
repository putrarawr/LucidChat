import { detectVideoUrls, analyzeVideoUrl, formatVideoContextForAI } from "../lib/video-analyzer.ts";

async function testMain() {
  const samplePrompt = "Coba tolong jelaskan isi dan analisis video tiktok ini dong https://vt.tiktok.com/ZSN3vYpQe/ sama youtube ini https://www.youtube.com/watch?v=dQw4w9WgXcQ";

  const detected = detectVideoUrls(samplePrompt);
  console.log("Detected Videos:", detected);

  const results = [];
  for (const item of detected) {
    console.log(`\nAnalyzing ${item.platform}: ${item.url}...`);
    const res = await analyzeVideoUrl(item.url, item.platform);
    results.push(res);
  }

  const formattedContext = formatVideoContextForAI(results);
  console.log("\n================ FORMATTED SYSTEM PROMPT CONTEXT ================");
  console.log(formattedContext);
}

testMain();
