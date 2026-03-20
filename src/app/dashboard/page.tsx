"use client";

import { useState } from "react";
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

export default function DashboardPage() {
  const { sections, categoryTree, reportMeta } = useData();
  const categories = categoryTree.map((c) => c.name);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<SectionStatus | null>(null);

  const filteredSections = sections
    .filter((s) => {
      if (selectedCategory && s.category !== selectedCategory) return false;
      if (selectedStatus && s.status !== selectedStatus) return false;
      return true;
    })
    .sort((a, b) => STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status]);

  const activeFilters = [selectedCategory, selectedStatus].filter(Boolean).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-100">Report Dashboard</h1>
        <p className="text-sm text-zinc-400 mt-1">
          {reportMeta.period} {reportMeta.title}
        </p>
      </div>

      <ProgressBanner sections={sections} />

      <StatsBar
        sections={sections}
        selectedStatus={selectedStatus}
        onStatusSelect={setSelectedStatus}
      />

      <div className="flex gap-6">
        <aside className="w-48 flex-shrink-0">
          <CategoryFilter
            categories={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
            sections={sections}
          />
        </aside>

        <div className="flex-1">
          {activeFilters > 0 && (
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-zinc-500">
                {filteredSections.length} section{filteredSections.length !== 1 ? "s" : ""} shown
              </p>
              <button
                onClick={() => { setSelectedCategory(null); setSelectedStatus(null); }}
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
