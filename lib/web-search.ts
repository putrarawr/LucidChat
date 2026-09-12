// Real-Time Web Search & News Crawling Engine for LucidChat

export interface SearchResult {
  title: string;
  snippet: string;
  url: string;
}

export async function performWebSearch(query: string): Promise<SearchResult[]> {
  if (!query || !query.trim()) return [];

  try {
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query.trim())}`;
    const res = await fetch(searchUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    const results: SearchResult[] = [];

    if (res.ok) {
      const html = await res.text();
      // Match result snippets & links from DuckDuckGo HTML
      const snippetRegex = /<a class="result__snippet[^"]*"[^>]*>([\s\S]*?)<\/a>/g;
      const urlRegex = /<a class="result__url" href="([^"]+)".*?>/g;

      const snippets: string[] = [];
      const urls: string[] = [];

      let match;
      while ((match = snippetRegex.exec(html)) !== null && snippets.length < 5) {
        const cleanSnippet = match[1].replace(/<[^>]+>/g, "").trim();
        if (cleanSnippet) snippets.push(cleanSnippet);
      }

      while ((match = urlRegex.exec(html)) !== null && urls.length < 5) {
        let rawUrl = match[1].trim();
        if (rawUrl.includes("uddg=")) {
          const decoded = decodeURIComponent(rawUrl.split("uddg=")[1]?.split("&")[0] || "");
          if (decoded) rawUrl = decoded;
        }
        if (rawUrl.startsWith("//")) rawUrl = "https:" + rawUrl;
        urls.push(rawUrl);
      }

      for (let i = 0; i < Math.min(snippets.length, urls.length); i++) {
        results.push({
          title: `Sumber Web #${i + 1}`,
          snippet: snippets[i],
          url: urls[i],
        });
      }
    }

    // Fallback Instant Answer API if HTML scraper yields 0 results
    if (results.length === 0) {
      const apiUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
      const apiRes = await fetch(apiUrl);
      if (apiRes.ok) {
        const data = await apiRes.json();
        if (data.AbstractText) {
          results.push({
            title: data.Heading || "Informasi Web Terkini",
            snippet: data.AbstractText,
            url: data.AbstractURL || "https://duckduckgo.com",
          });
        }
        if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
          data.RelatedTopics.slice(0, 4).forEach((topic: { Text?: string; FirstURL?: string }, idx: number) => {
            if (topic.Text && topic.FirstURL) {
              results.push({
                title: `Berita & Info #${idx + 1}`,
                snippet: topic.Text,
                url: topic.FirstURL,
              });
            }
          });
        }
      }
    }

    return results;
  } catch (err) {
    console.warn("Web Search Error:", err);
    return [];
  }
}
