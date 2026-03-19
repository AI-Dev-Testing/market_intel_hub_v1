// src/lib/openrouter/client.ts

export interface GenerateDraftParams {
  sectionTitle: string;
  category: string;
  subcategory: string;
}

export async function generateDraft(params: GenerateDraftParams): Promise<string> {
  const { sectionTitle, category, subcategory } = params;

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

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "GPSC Market Intelligence",
    },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 600,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} — ${error}`);
  }

  const data = await response.json();
  const draft = data.choices?.[0]?.message?.content;

  if (!draft) {
    throw new Error("No content returned from OpenRouter API");
  }

  return draft.trim();
}
