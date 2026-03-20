// src/lib/tavily/client.ts
import { Source } from "@/types";

export interface TavilySearchParams {
  query: string;
  excludeDomains?: string[];
  maxResults?: number;
}

interface TavilyResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

interface TavilyResponse {
  results: TavilyResult[];
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export async function searchWeb(params: TavilySearchParams): Promise<Source[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) throw new Error("TAVILY_API_KEY environment variable is not configured");

  const { query, excludeDomains = [], maxResults = 5 } = params;

  const body: Record<string, unknown> = {
    query,
    topic: "news",
    search_depth: "advanced",
    max_results: maxResults,
    include_answer: false,
  };
  if (excludeDomains.length > 0) body.exclude_domains = excludeDomains;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  let response: Response;
  try {
    response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Tavily API error: ${response.status} — ${error}`);
  }

  const data: TavilyResponse = await response.json();

  return (data.results ?? []).map((r) => ({
    title: r.title,
    url: r.url,
    domain: extractDomain(r.url),
    snippet: r.content?.slice(0, 400) ?? "",
  }));
}
