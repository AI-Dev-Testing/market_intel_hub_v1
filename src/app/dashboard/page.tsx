"use client";

import { useState, useEffect } from "react";
import { useData } from "@/contexts/data-context";
import { SectionStatus } from "@/types";
import { StatsBar } from "@/components/features/dashboard/stats-bar";
import { SectionCard } from "@/components/features/dashboard/section-card";
import { CategoryFilter } from "@/components/features/dashboard/category-filter";
import { ProgressBanner } from "@/components/features/dashboard/progress-banner";

const STATUS_PRIORITY: Record<SectionStatus, number> = {
  revision_needed: 0,
  in_review: 1,
  draft: 2,
  pending: 3,
  approved: 4,
};

const SME_FILTER_KEY = "gpsc_dashboard_sme_filter";

export default function DashboardPage() {
  const { sections, categoryTree, smeList, reportMeta } = useData();
  const categories = categoryTree.map((c) => c.name);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<SectionStatus | null>(null);
  const [selectedSme, setSelectedSme] = useState<string | null>(null);

  // Persist SME filter selection in localStorage
  useEffect(() => {
    const saved = localStorage.getItem(SME_FILTER_KEY);
    if (saved && smeList.includes(saved)) setSelectedSme(saved);
  }, [smeList]);

  const handleSmeSelect = (name: string | null) => {
    setSelectedSme(name);
    if (name) localStorage.setItem(SME_FILTER_KEY, name);
    else localStorage.removeItem(SME_FILTER_KEY);
  };

  // SME filter applied first so StatsBar counts reflect the same scope
  const smeFilteredSections = selectedSme
    ? sections.filter((s) => s.assignedSme === selectedSme)
    : sections;

  const queueRevisionCount = smeFilteredSections.filter((s) => s.status === "revision_needed").length;
  const queuePendingCount = smeFilteredSections.filter((s) => s.status === "pending").length;
  const queueTotal = queueRevisionCount + queuePendingCount;

  const filteredSections = smeFilteredSections
    .filter((s) => {
      if (selectedCategory && s.category !== selectedCategory) return false;
      if (selectedStatus && s.status !== selectedStatus) return false;
      return true;
    })
    .sort((a, b) => STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status]);

  const activeFilters = [selectedCategory, selectedStatus, selectedSme].filter(Boolean).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-100">Report Dashboard</h1>
        <p className="text-sm text-zinc-400 mt-1">
          {reportMeta.period} {reportMeta.title}
        </p>
      </div>

      <ProgressBanner sections={smeFilteredSections} />

      {/* My Sections filter */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-xs text-zinc-500">View:</span>
        <button
          onClick={() => handleSmeSelect(null)}
          className={`text-xs px-3 py-1 rounded-full border transition-colors ${
            !selectedSme
              ? "bg-zinc-700 border-zinc-600 text-zinc-100"
              : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
          }`}
        >
          All sections
        </button>
        {smeList.map((name) => (
          <button
            key={name}
            onClick={() => handleSmeSelect(selectedSme === name ? null : name)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              selectedSme === name
                ? "bg-zinc-700 border-zinc-600 text-zinc-100"
                : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Queue summary — only shown when an SME filter is active and there is actionable work */}
      {selectedSme && queueTotal > 0 && (
        <div className="flex items-center gap-2 mb-4 text-xs flex-wrap">
          <span className="text-zinc-400 font-medium">
            {queueTotal} section{queueTotal !== 1 ? "s" : ""} need{queueTotal === 1 ? "s" : ""} your attention:
          </span>
          {queueRevisionCount > 0 && (
            <button
              onClick={() => setSelectedStatus("revision_needed")}
              className="px-2 py-0.5 rounded-full bg-orange-950/50 border border-orange-800/60 text-orange-300 hover:bg-orange-900/50 transition-colors"
            >
              {queueRevisionCount} revision{queueRevisionCount !== 1 ? "s" : ""} needed
            </button>
          )}
          {queuePendingCount > 0 && (
            <button
              onClick={() => setSelectedStatus("pending")}
              className="px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 hover:bg-zinc-700 transition-colors"
            >
              {queuePendingCount} pending draft{queuePendingCount !== 1 ? "s" : ""}
            </button>
          )}
        </div>
      )}

      <StatsBar
        sections={smeFilteredSections}
        selectedStatus={selectedStatus}
        onStatusSelect={setSelectedStatus}
      />

      <div className="flex gap-6">
        <aside className="w-48 flex-shrink-0">
          <CategoryFilter
            categories={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
            sections={smeFilteredSections}
          />
        </aside>

        <div className="flex-1">
          {activeFilters > 0 && (
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-zinc-500">
                {filteredSections.length} section{filteredSections.length !== 1 ? "s" : ""} shown
              </p>
              <button
                onClick={() => { setSelectedCategory(null); setSelectedStatus(null); handleSmeSelect(null); }}
                className="text-xs text-zinc-400 hover:text-zinc-200 underline"
              >
                Clear all filters
              </button>
            </div>
          )}
          {filteredSections.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-12">No sections match these filters</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredSections.map((section) => (
                <SectionCard key={section.id} section={section} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
