// Real-Time Multi-Source Web Search & News Crawling Engine for LucidChat

export interface SearchResult {
  title: string;
  snippet: string;
  url: string;
  domain: string;
  source: string;
}

function extractDomain(urlStr: string): string {
  try {
    const parsed = new URL(urlStr);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return "web-source";
  }
}

function cleanScrapedText(text: string): string {
  if (!text) return "";
  let cleaned = text;

  // 1. Decode HTML Entities
  cleaned = cleaned
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#[0-9]+;/g, '')
    .replace(/&#x[0-9a-fA-F]+;/g, '');

  // 2. Remove CJK characters (Chinese, Japanese, Korean) to prevent AI token hallucinations
  cleaned = cleaned.replace(/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af\u1100-\u11ff\u3130-\u318f]/g, "");

  // 3. Remove excessive whitespace
  return cleaned.replace(/\s+/g, ' ').trim();
}

export async function performWebSearch(query: string): Promise<SearchResult[]> {
  if (!query || !query.trim()) return [];
  const cleanQuery = query.trim();

  const results: SearchResult[] = [];
  const seenUrls = new Set<string>();

  // Helper to add unique results
  const addResult = (item: SearchResult) => {
    if (!item.url || seenUrls.has(item.url)) return;
    seenUrls.add(item.url);
    results.push({
      ...item,
      title: cleanScrapedText(item.title),
      snippet: cleanScrapedText(item.snippet),
    });
  };

  // 1. Google News RSS Crawler (Real-Time News Headlines & Published Articles)
  try {
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(cleanQuery)}&hl=id-ID&gl=ID&ceid=ID:id`;
    const rssRes = await fetch(rssUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (rssRes.ok) {
      const xml = await rssRes.text();
      const itemRegex = /<item>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<link>(.*?)<\/link>[\s\S]*?<pubDate>(.*?)<\/pubDate>/g;
      let match;
      while ((match = itemRegex.exec(xml)) !== null && results.length < 5) {
        const rawTitle = match[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").replace(/<[^>]+>/g, "").trim();
        const rawLink = match[2].trim();
        const pubDate = match[3].trim();

        if (rawTitle && rawLink) {
          addResult({
            title: rawTitle,
            snippet: `Berita dipublikasikan pada ${pubDate}. Klik sumber untuk membaca laporan lengkap.`,
            url: rawLink,
            domain: extractDomain(rawLink),
            source: "Google News",
          });
        }
      }
    }
  } catch (err) {
    console.warn("Google News RSS Scraper Error:", err);
  }

  // 2. DuckDuckGo Web Article Scraper
  try {
    const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(cleanQuery)}`;
    const ddgRes = await fetch(ddgUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (ddgRes.ok) {
      const html = await ddgRes.text();
      const primaryRegex = /<h2 class="result__title">[\s\S]*?<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a class="result__snippet[^"]*"[^>]*>([\s\S]*?)<\/a>/g;

      let match;
      while ((match = primaryRegex.exec(html)) !== null && results.length < 8) {
        let rawUrl = match[1];
        if (rawUrl.includes("uddg=")) {
          const decoded = decodeURIComponent(rawUrl.split("uddg=")[1]?.split("&")[0] || "");
          if (decoded) rawUrl = decoded;
        }
        if (rawUrl.startsWith("//")) rawUrl = "https:" + rawUrl;

        const title = match[2].replace(/<[^>]+>/g, "").trim();
        const snippet = match[3].replace(/<[^>]+>/g, "").trim();

        if (title && rawUrl.startsWith("http")) {
          addResult({
            title,
            snippet,
            url: rawUrl,
            domain: extractDomain(rawUrl),
            source: "Web Search",
          });
        }
      }
    }
  } catch (err) {
    console.warn("DuckDuckGo Scraper Error:", err);
  }

  // 3. Wikipedia Indonesia API (Encyclopedic Facts & Event Histories)
  try {
    const wikiUrl = `https://id.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanQuery)}&format=json&utf8=1`;
    const wikiRes = await fetch(wikiUrl);
    if (wikiRes.ok) {
      const data = await wikiRes.json();
      if (data.query?.search && Array.isArray(data.query.search)) {
        data.query.search.slice(0, 2).forEach((s: { title: string; snippet: string }) => {
          const title = `Wikipedia: ${s.title}`;
          const snippet = s.snippet.replace(/<[^>]+>/g, "").trim();
          const url = `https://id.wikipedia.org/wiki/${encodeURIComponent(s.title)}`;
          addResult({
            title,
            snippet,
            url,
            domain: "id.wikipedia.org",
            source: "Wikipedia",
          });
        });
      }
    }
  } catch (err) {
    console.warn("Wikipedia API Error:", err);
  }

  return results.slice(0, 7);
}
