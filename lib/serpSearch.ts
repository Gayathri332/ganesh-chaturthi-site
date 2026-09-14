export interface WebSnippet {
  title: string;
  snippet: string;
  link: string;
}

/**
 * Queries SerpApi's Google Search endpoint and returns a handful of
 * organic-result snippets. Requires SERPAPI_KEY in the environment.
 * Docs: https://serpapi.com/search-api
 */
export async function searchWeb(question: string, topK = 3): Promise<WebSnippet[]> {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) return [];

  const params = new URLSearchParams({
    engine: "google",
    q: `${question} Ganesha Ganapati`,
    api_key: apiKey,
    num: String(topK),
  });

  try {
    const res = await fetch(`https://serpapi.com/search.json?${params.toString()}`, {
      // Revalidate frequently; this is a live search, not static content.
      next: { revalidate: 0 },
    });
    if (!res.ok) return [];
    const data = await res.json();

    const organic = Array.isArray(data.organic_results) ? data.organic_results : [];
    return organic.slice(0, topK).map((r: any) => ({
      title: r.title || "Untitled",
      snippet: r.snippet || "",
      link: r.link || "",
    }));
  } catch {
    return [];
  }
}
