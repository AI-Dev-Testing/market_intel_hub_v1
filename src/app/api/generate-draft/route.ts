// src/app/api/generate-draft/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateDraft } from "@/lib/openrouter/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sectionTitle, category, subcategory } = body;

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

    const draft = await generateDraft({ sectionTitle, category, subcategory });
    return NextResponse.json({ draft });
  } catch (error) {
    console.error("Draft generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate draft" },
      { status: 500 }
    );
  }
}
