// src/app/api/executive-summary/route.ts
import { NextRequest, NextResponse } from "next/server";
import { summarizeReport } from "@/lib/openrouter/client";

export async function POST(request: NextRequest) {
  try {
    const { sections, reportTitle, reportPeriod } = await request.json();
    if (!sections?.length) return NextResponse.json({ summary: "" });
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY not configured" },
        { status: 500 }
      );
    }
    const summary = await summarizeReport({ sections, reportTitle, reportPeriod });
    return NextResponse.json({ summary });
  } catch (error) {
    console.error("[executive-summary] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate summary" },
      { status: 500 }
    );
  }
}
