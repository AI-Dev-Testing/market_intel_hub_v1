// src/app/api/generate-draft/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateDraft, Reference } from "@/lib/openrouter/client";
import { searchWeb, extractUrls, ExtractResult } from "@/lib/tavily/client";
import { Source } from "@/types";

const MAX_URL_CONTENT_CHARS = 3000;
const MAX_URLS = 5;

function stripHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchUrl(url: string): Promise<{ content?: string; error?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    let res: Response;
    try {
      res = await fetch(url, {
        signal: controller.signal,
        headers: { "User-Agent": "GPSC-Market-Intel/1.0" },
      });
    } finally {
      clearTimeout(timeoutId);
    }
    if (!res.ok) return { error: `HTTP ${res.status}` };
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("text")) return { error: "Non-text content type" };
    const raw = await res.text();
    const stripped = stripHtml(raw).slice(0, MAX_URL_CONTENT_CHARS);
    if (!stripped) return { error: "No readable content found" };
    return { content: stripped };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Fetch failed" };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sectionTitle, category, subcategory, references, instructions, useWebSearch, systemPrompt, userPromptTemplate, scorecardSummary } = body;

    if (!sectionTitle || !category || !subcategory) {
      return NextResponse.json(
        { error: "Missing required fields: sectionTitle, category, subcategory" },
        { status: 400 }
      );
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY not configured" },
        { status: 500 }
      );
    }

    const resolvedReferences: Reference[] = [];
    const urlWarnings: string[] = [];

    if (Array.isArray(references)) {
      const urlRefs = references.filter((r: Reference) => r.type === "url").slice(0, MAX_URLS);
      const textRefs = references.filter((r: Reference) => r.type === "text");

      // Step 1: direct fetch for all URL references
      const directResults = await Promise.all(
        urlRefs.map(async (ref: Reference) => {
          const result = await fetchUrl(ref.content);
          return { ref, result };
        })
      );

      // Step 2: batch Tavily extract for anything that failed direct fetch
      const failed = directResults.filter(({ result }) => !result.content);
      let extractResults: ExtractResult[] = [];
      if (failed.length > 0 && process.env.TAVILY_API_KEY) {
        try {
          extractResults = await extractUrls(failed.map(({ ref }) => ref.content));
        } catch {
          // non-fatal
        }
      }
      const extractMap = new Map(extractResults.map((r) => [r.url, r]));

      // Step 3: build resolved references + actionable warnings
      for (const { ref, result } of directResults) {
        if (result.content) {
          resolvedReferences.push({ ...ref, fetchedContent: result.content });
        } else {
          const extracted = extractMap.get(ref.content);
          if (extracted?.content) {
            resolvedReferences.push({ ...ref, fetchedContent: extracted.content });
          } else {
            const reason = result.error ?? "Unknown error";
            let tip = "";
            if (reason.includes("401") || reason.includes("403")) {
              tip = " — site requires login. Paste the article text in Reference Text instead, or enable Web Search.";
            } else if (reason.includes("Non-text")) {
              tip = " — not a readable web page (PDF or media file).";
            }
            resolvedReferences.push({ ...ref, fetchError: reason });
            urlWarnings.push(`Could not fetch ${ref.content}: ${reason}${tip}`);
          }
        }
      }

      resolvedReferences.push(...textRefs);
    }

    // Web search via Tavily
    let webSources: Source[] = [];
    if (useWebSearch === true) {
      const whitelist: string[] = Array.isArray(body.whitelist) ? body.whitelist : [];
      const blacklist: string[] = Array.isArray(body.blacklist) ? body.blacklist : [];
      try {
        const query = `${sectionTitle} ${subcategory} electronics manufacturing supply chain market 2026`;
        const rawSources = await searchWeb({ query, excludeDomains: blacklist, maxResults: 6 });
        // Sort: whitelisted domains first, then by relevance order
        webSources = [
          ...rawSources.filter((s) => whitelist.includes(s.domain)),
          ...rawSources.filter((s) => !whitelist.includes(s.domain)),
        ].slice(0, 5);
      } catch (searchErr) {
        console.error("[generate-draft] Tavily search error:", searchErr);
        // Non-fatal: proceed without web sources
      }
    }

    // TODO Phase 2: persist generation request to database
    // await db.generationLog.create({ sectionTitle, category, references, instructions, timestamp: new Date() });
    console.log("[generate-draft] request", {
      sectionTitle,
      category,
      subcategory,
      urlCount: resolvedReferences.filter((r) => r.type === "url").length,
      hasText: resolvedReferences.some((r) => r.type === "text"),
      hasInstructions: Boolean(instructions?.trim()),
      useWebSearch: Boolean(useWebSearch),
    });

    // Augment instructions with live scorecard data when available (sc-overview)
    const effectiveInstructions = scorecardSummary
      ? `Current risk scores (use these exact figures in your draft): ${scorecardSummary}${instructions ? `\n\n${instructions}` : ""}`
      : (instructions ?? "");

    const draft = await generateDraft({
      sectionTitle,
      category,
      subcategory,
      references: resolvedReferences,
      instructions: effectiveInstructions,
      webSources,
      ...(systemPrompt ? { systemPrompt } : {}),
      ...(userPromptTemplate ? { userPromptTemplate } : {}),
    });

    return NextResponse.json({
      draft,
      sources: webSources,
      ...(urlWarnings.length > 0 && { warnings: urlWarnings }),
    });
  } catch (error) {
    console.error("Draft generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate draft" },
      { status: 500 }
    );
  }
}
