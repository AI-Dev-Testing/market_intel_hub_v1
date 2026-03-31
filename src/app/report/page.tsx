// src/app/report/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, Link2 } from "lucide-react";
import { useData } from "@/contexts/data-context";
import { SECTION_IMAGES } from "@/lib/data/section-images";
import { SECTION_CHARTS } from "@/lib/data/chart-registry";
import { Source } from "@/types";
import { TocSidebar, type TocEntry } from "@/components/features/report/toc-sidebar";

function SourcesDisclosure({ sources }: { sources: Source[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
      >
        {open ? "Hide sources ▲" : `Show sources (${sources.length}) ▼`}
      </button>
      {open && (
        <ul className="mt-2 space-y-1">
          {sources.map((s) => (
            <li key={s.url} className="text-xs">
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {s.title} — {s.domain}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function categorySlug(cat: string): string {
  const slug = cat.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return slug || "category";
}

export default function ReportPage() {
  const { sections, categoryTree, reportMeta } = useData();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const approvedSections = sections.filter((s) => s.status === "approved");
  const totalSections = sections.length;

  // Use live category tree order for grouping
  const categoryNames = categoryTree.map((c) => c.name);
  const approvedByCategory = categoryNames
    .map((category) => ({
      category,
      sections: approvedSections.filter((s) => s.category === category),
    }))
    .filter((group) => group.sections.length > 0);

  const visibleCategories = activeCategory
    ? approvedByCategory.filter((g) => g.category === activeCategory)
    : approvedByCategory;

  const tocEntries: TocEntry[] = approvedByCategory.map(({ category, sections: catSections }) => ({
    categoryId: categorySlug(category),
    categoryLabel: category,
    sections: catSections.map((s) => ({ id: s.id, title: s.title })),
  }));

  const toggleCategory = (cat: string) =>
    setActiveCategory((prev) => (prev === cat ? null : cat));

  const toggleExpand = (cat: string) =>
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });

  return (
    <div className="flex gap-10 items-start">
      <TocSidebar entries={tocEntries} />
      <div className="min-w-0 flex-1 max-w-[780px]">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-zinc-100">{reportMeta.title}</h1>
        <p className="text-sm text-zinc-400 mt-1">{reportMeta.period} — Internal Draft</p>
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

      {/* Executive Summary */}
      {reportMeta.executiveSummary && (
        <div className="mb-8 rounded-lg border border-zinc-800 bg-zinc-900/40 p-5">
          <h2 className="text-sm font-semibold text-zinc-200 mb-3">Executive Summary</h2>
          <ul className="space-y-2">
            {reportMeta.executiveSummary
              .split("\n")
              .filter((line) => line.trim().startsWith("•"))
              .map((line, i) => (
                <li key={i} className="flex gap-2 text-sm text-zinc-300 leading-relaxed">
                  <span className="text-zinc-500 flex-shrink-0 mt-0.5">•</span>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: line
                        .replace(/^•\s*/, "")
                        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"),
                    }}
                  />
                </li>
              ))}
          </ul>
          {reportMeta.summaryUpdatedAt && (
            <p className="text-xs text-zinc-600 mt-3">
              Summary generated {new Date(reportMeta.summaryUpdatedAt).toLocaleString()}
            </p>
          )}
        </div>
      )}

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
          {visibleCategories.map(({ category, sections: catSections }) => {
            const overviewSection = catSections.find((s) => s.id.endsWith("-overview"));
            const detailSections = catSections.filter((s) => !s.id.endsWith("-overview"));
            const hasToggle = !!overviewSection && detailSections.length > 0;
            const isExpanded = expandedCategories.has(category);
            const sectionsToRender = hasToggle
              ? isExpanded
                ? [overviewSection!, ...detailSections]
                : [overviewSection!]
              : catSections;

            return (
              <div key={category} id={categorySlug(category)}>
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800 mb-5">
                  <h2 className="text-base font-semibold text-zinc-200">{category}</h2>
                  {hasToggle && (
                    <button
                      onClick={() => toggleExpand(category)}
                      className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5" />
                          Collapse sections
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3.5 h-3.5" />
                          {detailSections.length} {detailSections.length === 1 ? "section" : "sections"}
                        </>
                      )}
                    </button>
                  )}
                </div>
                <div className="space-y-6">
                  {sectionsToRender.map((section) => {
                    const imageUrl = SECTION_IMAGES[section.id];
                    const ChartComponent = SECTION_CHARTS[section.id];
                    return (
                      <div key={section.id} id={section.id} className="rounded-lg border border-zinc-800 overflow-hidden">
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
                          <div className="group flex items-start gap-1.5 mb-3">
                            <h3 className="text-sm font-semibold text-zinc-200 flex-1">
                              {section.title}
                            </h3>
                            <a
                              href={`#${section.id}`}
                              onClick={async (e) => {
                                e.preventDefault();
                                const url = `${window.location.origin}/report#${section.id}`;
                                try {
                                  await navigator.clipboard.writeText(url);
                                } catch {
                                  // clipboard unavailable — URL still visible in address bar via replaceState
                                }
                                window.history.replaceState(null, "", `/report#${section.id}`);
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 text-zinc-600 hover:text-zinc-400 flex-shrink-0"
                              title="Copy link to section"
                              aria-label="Copy link to section"
                            >
                              <Link2 className="w-3.5 h-3.5" />
                            </a>
                          </div>
                          {ChartComponent && (
                            <div className="mb-4 -mx-5 px-5 pb-4 border-b border-zinc-800">
                              <ChartComponent />
                            </div>
                          )}
                          <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                            {section.draft}
                          </p>
                          {section.sources && section.sources.length > 0 && (
                            <SourcesDisclosure sources={section.sources} />
                          )}
                          <p className="text-xs text-zinc-600 mt-4">
                            — {section.assignedSme || "Unassigned"} · {section.lastUpdated}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}
