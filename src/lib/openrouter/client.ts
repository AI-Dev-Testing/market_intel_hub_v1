// src/lib/openrouter/client.ts

export interface GenerateDraftParams {
  sectionTitle: string;
  category: string;
  subcategory: string;
}

export async function generateDraft(params: GenerateDraftParams): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY environment variable is not configured");
  }

  const { sectionTitle, category, subcategory } = params;

  const referer = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  const prompt = `You are a market intelligence analyst writing a section for a GPSC (Government and Public Sector Contracts) Market Intelligence Report.

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
- Do NOT use headers, bullet points, or markdown formatting — plain prose only

Begin writing the intelligence brief now:`;

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
        max_tokens: 600,
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
