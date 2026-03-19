// src/app/report/page.tsx
"use client";

import { useData } from "@/contexts/data-context";
import { CATEGORIES } from "@/lib/data/sections";

export default function ReportPage() {
  const { sections } = useData();

  const approvedSections = sections.filter((s) => s.status === "approved");
  const totalSections = sections.length;

  const approvedByCategory = CATEGORIES.map((category) => ({
    category,
    sections: approvedSections.filter((s) => s.category === category),
  })).filter((group) => group.sections.length > 0);

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-zinc-100">GPSC Market Intelligence Report</h1>
        <p className="text-sm text-zinc-400 mt-1">Q2 2026 — Internal Draft</p>
        <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500">
          <span>{approvedSections.length} of {totalSections} sections approved</span>
          <span suppressHydrationWarning>Generated {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
        </div>
        {approvedSections.length < totalSections && (
          <div className="mt-3 text-xs text-yellow-600 bg-yellow-950/30 border border-yellow-900/50 rounded-md px-3 py-2">
            {totalSections - approvedSections.length} section(s) not yet approved — showing approved content only
          </div>
        )}
      </div>

      {approvedByCategory.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-zinc-800 rounded-lg">
          <p className="text-zinc-500">No approved sections yet</p>
          <p className="text-xs text-zinc-600 mt-2">Approve sections in the dashboard to see them here</p>
        </div>
      ) : (
        <div className="space-y-10">
          {approvedByCategory.map(({ category, sections: catSections }) => (
            <div key={category}>
              <h2 className="text-base font-semibold text-zinc-200 pb-2 border-b border-zinc-800 mb-5">
                {category}
              </h2>
              <div className="space-y-8">
                {catSections.map((section) => (
                  <div key={section.id}>
                    <h3 className="text-sm font-semibold text-zinc-300 mb-3">
                      {section.title}
                    </h3>
                    <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                      {section.draft}
                    </p>
                    <p className="text-xs text-zinc-600 mt-3">
                      — {section.assignedSme || "Unassigned"} · {section.lastUpdated}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
