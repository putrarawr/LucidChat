// Test fetching OpenGraph tags with Social Crawler User-Agent
async function testSocialCrawler(url) {
  console.log("=== Testing Social Crawler User-Agent ===", url);
  const userAgents = [
    "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
    "Twitterbot/1.0",
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  ];

  for (const ua of userAgents) {
    console.log("\nUser-Agent:", ua);
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": ua,
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        },
      });
      console.log("Status:", res.status);
      const html = await res.text();
      console.log("HTML Length:", html.length);

      const ogImage = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["'](.*?)["']/i)?.[1] ||
                      html.match(/<meta[^>]*content=["'](.*?)["'][^>]*property=["']og:image["']/i)?.[1];
      const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["'](.*?)["']/i)?.[1] ||
                      html.match(/<meta[^>]*content=["'](.*?)["'][^>]*property=["']og:title["']/i)?.[1];
      const ogDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["'](.*?)["']/i)?.[1] ||
                     html.match(/<meta[^>]*content=["'](.*?)["'][^>]*property=["']og:description["']/i)?.[1];

      console.log("og:title:", ogTitle);
      console.log("og:image (Portrait Thumbnail):", ogImage);
      console.log("og:description:", ogDesc);
    } catch (e) {
      console.log("Error:", e.message);
    }
  }
}

testSocialCrawler("https://www.tiktok.com/@scout2015/video/6718335390841097477");
