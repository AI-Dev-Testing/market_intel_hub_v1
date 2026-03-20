// src/lib/openrouter/client.ts

import { Source } from "@/types";
import { DEFAULT_USER_PROMPT_TEMPLATE } from "@/lib/data/sections";

export interface Reference {
  type: "url" | "text";
  content: string;
  fetchedContent?: string;
  fetchError?: string;
}

export interface GenerateDraftParams {
  sectionTitle: string;
  category: string;
  subcategory: string;
  period?: string;
  references?: Reference[];
  instructions?: string;
  webSources?: Source[];
  // Admin-configured prompt overrides
  systemPrompt?: string;
  userPromptTemplate?: string;
}

// ---------- block builders (same logic as before, now reusable) ----------

function buildReferencesBlock(references: Reference[]): string {
  const usable = references.filter(
    (r) => (r.type === "text" && r.content.trim()) || (r.type === "url" && r.fetchedContent)
  );
  if (usable.length === 0) return "";

  let block = "\n\n## Reference Materials\n\nThe following materials were provided as reference. Use them to inform and enrich your intelligence brief:";
  for (const ref of usable) {
    if (ref.type === "text") {
      block += `\n\n--- Provided Text Reference ---\n${ref.content.trim()}\n--- End Reference ---`;
    } else if (ref.type === "url" && ref.fetchedContent) {
      block += `\n\n--- Web Reference: ${ref.content} ---\n${ref.fetchedContent}\n--- End Reference ---`;
    }
  }
  return block;
}

function buildWebSourcesBlock(webSources: Source[]): string {
  if (!webSources || webSources.length === 0) return "";
  let block = "\n\n## Latest Web Intelligence\n\nThe following recent articles were retrieved via web search. Use them to ensure the brief reflects current market conditions:";
  for (const src of webSources) {
    block += `\n\n--- ${src.title} (${src.domain}) ---\n${src.snippet}\n---`;
  }
  return block;
}

function buildInstructionsBlock(instructions: string): string {
  if (!instructions || !instructions.trim()) return "";
  return `\n\n## SME Instructions\n\nApply the following specific instructions when writing this brief:\n${instructions.trim()}`;
}

// ---------- template interpolation ----------

function applyTemplate(template: string, params: GenerateDraftParams): string {
  return template
    .replace(/\{\{title\}\}/g, params.sectionTitle)
    .replace(/\{\{category\}\}/g, params.category)
    .replace(/\{\{subcategory\}\}/g, params.subcategory)
    .replace(/\{\{period\}\}/g, params.period ?? "Q2 2026")
    .replace(/\{\{references\}\}/g, buildReferencesBlock(params.references ?? []))
    .replace(/\{\{webSources\}\}/g, buildWebSourcesBlock(params.webSources ?? []))
    .replace(/\{\{instructions\}\}/g, buildInstructionsBlock(params.instructions ?? ""));
}

// ---------- main export ----------

export async function generateDraft(params: GenerateDraftParams): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY environment variable is not configured");
  }

  const referer = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  const template = params.userPromptTemplate ?? DEFAULT_USER_PROMPT_TEMPLATE;
  const userContent = applyTemplate(template, params);

  const messages: { role: string; content: string }[] = [];
  if (params.systemPrompt?.trim()) {
    messages.push({ role: "system", content: params.systemPrompt.trim() });
  }
  messages.push({ role: "user", content: userContent });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  let response: Response;
  try {
    response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": referer,
        "X-Title": "GPSC Market Intelligence",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages,
        max_tokens: 800,
        temperature: 0.7,
      }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} — ${error}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(`OpenRouter API error: ${data.error.message || JSON.stringify(data.error)}`);
  }

  if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
    throw new Error("No choices returned from OpenRouter API");
  }

  const draft = data.choices[0]?.message?.content;
  if (!draft || typeof draft !== "string") {
    throw new Error("Invalid response format from OpenRouter API");
  }

  return draft.trim();
}

// ---------- executive summary ----------

export interface SummarizeReportParams {
  sections: { title: string; category: string; draft: string }[];
  reportTitle: string;
  reportPeriod: string;
}

export async function summarizeReport(params: SummarizeReportParams): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY environment variable is not configured");

  const referer = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  const { sections, reportTitle, reportPeriod } = params;
  const sectionsText = sections
    .map((s) => `## ${s.title} (${s.category})\n${s.draft}`)
    .join("\n\n---\n\n");

  const userPrompt = `Write an executive summary for the ${reportTitle} covering ${reportPeriod}.

Produce 4–6 bullet points that capture the most important cross-cutting themes, risks, and market signals from the approved sections below. Each bullet should be 1–2 sentences. Start each bullet with a bold keyword or phrase (use **bold** markdown). Output only the bullet points, each on its own line, starting with "•".

APPROVED SECTIONS:
${sectionsText}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  let response: Response;
  try {
    response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": referer,
        "X-Title": "GPSC Market Intelligence",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a senior market intelligence analyst writing concise executive briefings." },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 600,
        temperature: 0.4,
      }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} — ${err}`);
  }

  const data = await response.json();
  if (data.error) throw new Error(`OpenRouter API error: ${data.error.message || JSON.stringify(data.error)}`);
  if (!data.choices?.length) throw new Error("No choices returned from OpenRouter API");

  return (data.choices[0]?.message?.content ?? "").trim();
}
