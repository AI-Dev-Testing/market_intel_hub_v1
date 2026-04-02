// src/app/report/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowUp, ChevronDown, ChevronUp, Link2 } from "lucide-react";
import { useData } from "@/contexts/data-context";
import { SECTION_IMAGES } from "@/lib/data/section-images";
import { SECTION_CHARTS } from "@/lib/data/chart-registry";
import { Source } from "@/types";
import { TocSidebar, type TocEntry } from "@/components/features/report/toc-sidebar";
import { MarkdownContent } from "@/components/ui/markdown-content";

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

function formatShortDate(iso: string): string {
  // Append time to treat date-only strings as local midnight, not UTC midnight
  const d = new Date(iso.includes("T") ? iso : `${iso}T00:00:00`);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function estimateReadTime(text: string): number {
  return Math.max(1, Math.ceil(text.trim().split(/\s+/).length / 200));
}

function findMatchingSection(
  bulletText: string,
  sections: { id: string; title: string }[]
): { id: string; title: string } | undefined {
  const lower = bulletText.toLowerCase();
  // Longest title match wins to avoid false positives on short titles
  return [...sections]
    .sort((a, b) => b.title.length - a.title.length)
    .find((s) => lower.includes(s.title.toLowerCase()));
}

function renderBold(text: string): React.ReactNode {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  );
}

function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-50 rounded-full bg-zinc-800 border border-zinc-700 p-2.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 transition-colors shadow-lg"
      aria-label="Back to top"
    >
      <ArrowUp className="w-4 h-4" />
    </button>
  );
}

const STATUS_CHIP: Record<string, { label: string; className: string }> = {
  revision_needed: { label: "Revision Needed", className: "bg-orange-900/50 text-orange-300 border border-orange-800/60" },
  in_review:       { label: "In Review",        className: "bg-yellow-900/50 text-yellow-300 border border-yellow-800/60" },
  draft:           { label: "Draft",            className: "bg-blue-900/50   text-blue-300   border border-blue-800/60"   },
  pending:         { label: "Pending",          className: "bg-zinc-800      text-zinc-500   border border-zinc-700"      },
};

export default function ReportPage() {
  const { sections, categoryTree, reportMeta } = useData();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const isDrafting = !reportMeta.published;
  const approvedSections = sections.filter((s) => s.status === "approved");
  const totalSections = sections.length;

  // Use live category tree order for grouping
  const categoryNames = categoryTree.map((c) => c.name);
  // In DRAFTING phase: include all sections (approved + stubs for non-approved)
  // In PUBLISHED phase: approved only
  const approvedByCategory = categoryNames
    .map((category) => ({
      category,
      sections: isDrafting
        ? sections.filter((s) => s.category === category)
        : approvedSections.filter((s) => s.category === category),
    }))
    .filter((group) => group.sections.length > 0);

  const visibleCategories = activeCategory
    ? approvedByCategory.filter((g) => g.category === activeCategory)
    : approvedByCategory;

  // TOC only includes approved sections — stubs are not navigable
  const tocEntries: TocEntry[] = visibleCategories.map(({ category, sections: catSections }) => ({
    categoryId: categorySlug(category),
    categoryLabel: category,
    sections: catSections
      .filter((s) => s.status === "approved")
      .map((s) => ({ id: s.id, title: s.title })),
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
        {!reportMeta.published && (
          <div className="mb-6 flex items-center gap-2.5 rounded-md bg-amber-950/40 border border-amber-800/50 px-4 py-3">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <p className="text-sm text-amber-300">
              This report is in <strong className="font-semibold">draft</strong> — not ready for external sharing.
            </p>
          </div>
        )}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-zinc-100">{reportMeta.title}</h1>
        <p className="text-sm text-zinc-400 mt-1">{reportMeta.period} — Internal Draft</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-xs text-zinc-500">
          <span>Period: {reportMeta.period}</span>
          <span className="text-zinc-700">·</span>
          <span>{approvedSections.length} of {totalSections} sections approved</span>
          <span className="text-zinc-700">·</span>
          <span suppressHydrationWarning>
            Updated {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </span>
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
              .map((line, i) => {
                const cleanText = line.replace(/^•\s*/, "");
                const match = findMatchingSection(cleanText, approvedSections);
                const inner = <span>{renderBold(cleanText)}</span>;
                return (
                  <li key={i} className="flex gap-2 text-sm text-zinc-300 leading-relaxed">
                    <span className="text-zinc-500 flex-shrink-0 mt-0.5">•</span>
                    {match ? (
                      <a
                        href={`#${match.id}`}
                        className="hover:text-zinc-100 transition-colors underline decoration-zinc-700 hover:decoration-zinc-500"
                      >
                        {inner}
                      </a>
                    ) : (
                      inner
                    )}
                  </li>
                );
              })}
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
                  <div className="flex items-center gap-3">
                    <div className="w-0.5 h-5 bg-zinc-600 rounded-full flex-shrink-0" />
                    <h2 className="text-base font-semibold text-zinc-100 tracking-tight">{category}</h2>
                  </div>
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
                <div className="space-y-8">
                  {sectionsToRender.map((section) => {
                    // Non-approved stub — only rendered in DRAFTING phase
                    if (section.status !== "approved") {
                      const chip = STATUS_CHIP[section.status] ?? STATUS_CHIP.pending;
                      return (
                        <div key={section.id} className="rounded-lg border border-dashed border-zinc-700 p-5 opacity-60">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2 flex-1 min-w-0">
                              <h3 className="text-sm font-semibold text-zinc-400 leading-snug">{section.title}</h3>
                              <span className={`flex-shrink-0 mt-0.5 text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${chip.className}`}>
                                {chip.label}
                              </span>
                            </div>
                            <Link
                              href={`/sections/${section.id}`}
                              className="flex-shrink-0 text-xs text-zinc-500 hover:text-zinc-300 transition-colors whitespace-nowrap"
                            >
                              Edit →
                            </Link>
                          </div>
                          <p className="text-xs text-zinc-600 mt-2">Not yet approved — content hidden until approved.</p>
                        </div>
                      );
                    }

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
                          <div className="mb-3">
                            <div className="group flex items-start gap-1.5 mb-1">
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
                            <div className="flex items-center gap-3 text-xs text-zinc-600">
                              <span>Updated {formatShortDate(section.lastUpdated)}</span>
                              {section.draft.trim().length > 0 && (
                                <>
                                  <span>·</span>
                                  <span>{estimateReadTime(section.draft)} min read</span>
                                </>
                              )}
                            </div>
                          </div>
                          {ChartComponent && (
                            <div className="mb-4 -mx-5 px-5 pb-4 border-b border-zinc-800">
                              <ChartComponent />
                            </div>
                          )}
                          <MarkdownContent content={section.draft} className="text-sm" />
                          {section.sources && section.sources.length > 0 && (
                            <SourcesDisclosure sources={section.sources} />
                          )}
                          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-zinc-800/60">
                            <div className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0">
                              <span className="text-[9px] font-semibold text-zinc-400 uppercase leading-none">
                                {(section.assignedSme || "?")[0]}
                              </span>
                            </div>
                            <span className="text-xs text-zinc-500">{section.assignedSme || "Unassigned"}</span>
                            <span className="text-zinc-700 text-xs">·</span>
                            <span className="text-xs text-zinc-600">{formatShortDate(section.lastUpdated)}</span>
                          </div>
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
        {approvedByCategory.length > 0 && (
          <footer className="mt-16 pt-6 border-t border-zinc-800">
            <p className="text-xs font-semibold text-zinc-400">GPSC Market Intelligence Team</p>
            <p className="text-xs text-zinc-600 mt-1">
              For questions about this report, contact your GPSC procurement lead.
            </p>
          </footer>
        )}
        <BackToTop />
      </div>
    </div>
  );
}
