// src/lib/openrouter/client.ts

import { Source } from "@/types";

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
  references?: Reference[];
  instructions?: string;
  webSources?: Source[];
}

function buildPrompt(params: GenerateDraftParams): string {
  const { sectionTitle, category, subcategory, references, instructions } = params;

  let prompt = `You are a market intelligence analyst writing a section for a GPSC (Government and Public Sector Contracts) Market Intelligence Report.

Write a concise 2-3 paragraph intelligence brief for the following section:

Section Title: ${sectionTitle}
Category: ${category}
Subcategory: ${subcategory}
Report Date: Q2 2026

Requirements:
- Write in a professional, factual intelligence report style
- Include specific data points, trends, and forward-looking statements where appropriate
- Focus on supply chain, procurement, and market conditions relevant to GPSC buyers
- Keep each paragraph 3-5 sentences
- Do NOT use headers, bullet points, or markdown formatting — plain prose only`;

  const hasReferences = references && references.length > 0;
  if (hasReferences) {
    prompt += `\n\n## Reference Materials\n\nThe following materials were provided as reference. Use them to inform and enrich your intelligence brief:`;

    for (const ref of references) {
      if (ref.type === "text" && ref.content.trim()) {
        prompt += `\n\n--- Provided Text Reference ---\n${ref.content.trim()}\n--- End Reference ---`;
      } else if (ref.type === "url") {
        if (ref.fetchedContent) {
          prompt += `\n\n--- Web Reference: ${ref.content} ---\n${ref.fetchedContent}\n--- End Reference ---`;
        }
      }
    }
  }

  // Inject Tavily web sources
  if (params.webSources && params.webSources.length > 0) {
    prompt += `\n\n## Latest Web Intelligence\n\nThe following recent articles were retrieved via web search. Use them to ensure the brief reflects current market conditions:`;
    for (const src of params.webSources) {
      prompt += `\n\n--- ${src.title} (${src.domain}) ---\n${src.snippet}\n---`;
    }
  }

  // Inject SME instructions
  if (instructions && instructions.trim()) {
    prompt += `\n\n## SME Instructions\n\nApply the following specific instructions when writing this brief:\n${instructions.trim()}`;
  }

  prompt += `\n\nBegin writing the intelligence brief now:`;
  return prompt;
}

export async function generateDraft(params: GenerateDraftParams): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY environment variable is not configured");
  }

  const referer = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  const prompt = buildPrompt(params);

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
        messages: [{ role: "user", content: prompt }],
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
