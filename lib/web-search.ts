// Real-Time Web Search & News Crawling Engine for LucidChat

export interface SearchResult {
  title: string;
  snippet: string;
  url: string;
  domain: string;
}

function extractDomain(urlStr: string): string {
  try {
    const parsed = new URL(urlStr);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return "web-source";
  }
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

      // Primary Scraper: Match result title block + snippet block
      const primaryRegex = /<h2 class="result__title">[\s\S]*?<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a class="result__snippet[^"]*"[^>]*>([\s\S]*?)<\/a>/g;

      let match;
      while ((match = primaryRegex.exec(html)) !== null && results.length < 6) {
        let rawUrl = match[1];
        if (rawUrl.includes("uddg=")) {
          const decoded = decodeURIComponent(rawUrl.split("uddg=")[1]?.split("&")[0] || "");
          if (decoded) rawUrl = decoded;
        }
        if (rawUrl.startsWith("//")) rawUrl = "https:" + rawUrl;

        const title = match[2].replace(/<[^>]+>/g, "").trim();
        const snippet = match[3].replace(/<[^>]+>/g, "").trim();

        if (title && rawUrl.startsWith("http")) {
          results.push({
            title,
            snippet,
            url: rawUrl,
            domain: extractDomain(rawUrl),
          });
        }
      }

      // Secondary Scraper Fallback if primary regex misses
      if (results.length === 0) {
        const titleRegex = /<a class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
        const snippetRegex = /<a class="result__snippet[^"]*"[^>]*>([\s\S]*?)<\/a>/g;

        const titles: { title: string; url: string }[] = [];
        let tMatch;
        while ((tMatch = titleRegex.exec(html)) !== null && titles.length < 6) {
          let rawUrl = tMatch[1];
          if (rawUrl.includes("uddg=")) {
            const decoded = decodeURIComponent(rawUrl.split("uddg=")[1]?.split("&")[0] || "");
            if (decoded) rawUrl = decoded;
          }
          if (rawUrl.startsWith("//")) rawUrl = "https:" + rawUrl;

          const cleanTitle = tMatch[2].replace(/<[^>]+>/g, "").trim();
          if (cleanTitle && rawUrl.startsWith("http")) {
            titles.push({ title: cleanTitle, url: rawUrl });
          }
        }

        const snippets: string[] = [];
        let sMatch;
        while ((sMatch = snippetRegex.exec(html)) !== null && snippets.length < titles.length) {
          const cleanSnippet = sMatch[1].replace(/<[^>]+>/g, "").trim();
          snippets.push(cleanSnippet);
        }

        for (let i = 0; i < titles.length; i++) {
          results.push({
            title: titles[i].title,
            snippet: snippets[i] || "",
            url: titles[i].url,
            domain: extractDomain(titles[i].url),
          });
        }
      }
    }

    // Tertiary Fallback: Instant Answer & Related Topics API
    if (results.length === 0) {
      const apiUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
      const apiRes = await fetch(apiUrl);
      if (apiRes.ok) {
        const data = await apiRes.json();
        if (data.AbstractText) {
          const url = data.AbstractURL || "https://duckduckgo.com";
          results.push({
            title: data.Heading || "Informasi Web Terkini",
            snippet: data.AbstractText,
            url,
            domain: extractDomain(url),
          });
        }
        if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
          data.RelatedTopics.slice(0, 5).forEach((topic: { Text?: string; FirstURL?: string }) => {
            if (topic.Text && topic.FirstURL) {
              results.push({
                title: topic.Text.slice(0, 60) + "...",
                snippet: topic.Text,
                url: topic.FirstURL,
                domain: extractDomain(topic.FirstURL),
              });
            }
          });
        }
      }
    }

    return results;
  } catch (err) {
    console.warn("Web Search Scraper Error:", err);
    return [];
  }
}
