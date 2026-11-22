export type Evidence = { title: string; url: string; snippet: string };

type YouHit = { title?: string; url?: string; description?: string; snippets?: string[] };

// Queries the You.com Search API and returns the top web results as evidence rows.
export async function youSearch(query: string, count = 4): Promise<Evidence[]> {
  const key = process.env.YDC_API_KEY;
  if (!key) return [];
  const url = `https://ydc-index.io/v1/search?query=${encodeURIComponent(query)}&count=${count}`;
  try {
    const res = await fetch(url, { headers: { "X-API-Key": key }, cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    const hits: YouHit[] = json?.results?.web ?? json?.hits ?? [];
    return hits.slice(0, count).map((h) => ({
      title: h.title ?? "",
      url: h.url ?? "",
      snippet: (h.snippets?.[0] ?? h.description ?? "").slice(0, 220),
    }));
  } catch {
    return [];
  }
}
