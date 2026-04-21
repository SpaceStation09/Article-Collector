import { load } from "cheerio";

function normalizeTitle(value: string | null | undefined) {
  return value?.replace(/\s+/g, " ").trim() || null;
}

export async function fetchArticleTitle(targetUrl: string) {
  const response = await fetch(targetUrl, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      accept: "text/html,application/xhtml+xml",
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`Unable to fetch page: ${response.status}`);
  }

  const html = await response.text();
  const $ = load(html);

  const candidates = [
    $("meta[property='og:title']").attr("content"),
    $("meta[name='twitter:title']").attr("content"),
    $("title").first().text(),
  ];

  for (const candidate of candidates) {
    const title = normalizeTitle(candidate);
    if (title) {
      return title;
    }
  }

  return null;
}
