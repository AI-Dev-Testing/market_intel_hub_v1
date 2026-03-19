// src/app/report/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useData } from "@/contexts/data-context";
import { CATEGORIES } from "@/lib/data/sections";
import { SECTION_IMAGES } from "@/lib/data/section-images";

export default function ReportPage() {
  const { sections } = useData();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const approvedSections = sections.filter((s) => s.status === "approved");
  const totalSections = sections.length;

  const approvedByCategory = CATEGORIES.map((category) => ({
    category,
    sections: approvedSections.filter((s) => s.category === category),
  })).filter((group) => group.sections.length > 0);

  const visibleCategories = activeCategory
    ? approvedByCategory.filter((g) => g.category === activeCategory)
    : approvedByCategory;

  const toggleCategory = (cat: string) =>
    setActiveCategory((prev) => (prev === cat ? null : cat));

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
          <div className="mt-3 text-xs text-yellow-600 bg-yellow-950/30 border border-yellow-900/50 rounded-md px-3 py-2 flex items-center justify-between">
            <span>{totalSections - approvedSections.length} section(s) not yet approved — showing approved content only</span>
            <Link
              href="/dashboard"
              className="text-yellow-400 hover:text-yellow-200 underline whitespace-nowrap ml-4 transition-colors"
            >
              View in Dashboard →
            </Link>
          </div>
        )}
      </div>

      {approvedByCategory.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              activeCategory === null
                ? "bg-zinc-700 text-zinc-100 border-zinc-700"
                : "text-zinc-500 border-zinc-800 hover:text-zinc-300 hover:border-zinc-700"
            }`}
          >
            All sections
          </button>
          {approvedByCategory.map(({ category }) => (
            <button
              key={category}
              onClick={() => toggleCategory(category)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                activeCategory === category
                  ? "bg-zinc-700 text-zinc-100 border-zinc-700"
                  : "text-zinc-500 border-zinc-800 hover:text-zinc-300 hover:border-zinc-700"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {approvedByCategory.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-zinc-800 rounded-lg">
          <p className="text-zinc-500">No approved sections yet</p>
          <p className="text-xs text-zinc-600 mt-2">Approve sections in the dashboard to see them here</p>
        </div>
      ) : (
        <div className="space-y-10">
          {visibleCategories.map(({ category, sections: catSections }) => (
            <div key={category}>
              <h2 className="text-base font-semibold text-zinc-200 pb-2 border-b border-zinc-800 mb-5">
                {category}
              </h2>
              <div className="space-y-6">
                {catSections.map((section) => {
                  const imageUrl = SECTION_IMAGES[section.id];
                  return (
                    <div key={section.id} className="rounded-lg border border-zinc-800 overflow-hidden">
                      {imageUrl ? (
                        <div className="relative h-36 w-full">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imageUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent" />
                        </div>
                      ) : (
                        <div className="h-10 bg-zinc-900" />
                      )}
                      <div className="p-5">
                        <h3 className="text-sm font-semibold text-zinc-200 mb-3">
                          {section.title}
                        </h3>
                        <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                          {section.draft}
                        </p>
                        <p className="text-xs text-zinc-600 mt-4">
                          — {section.assignedSme || "Unassigned"} · {section.lastUpdated}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
