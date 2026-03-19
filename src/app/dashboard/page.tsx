// src/app/dashboard/page.tsx
"use client";

import { useState } from "react";
import { useData } from "@/contexts/data-context";
import { StatsBar } from "@/components/features/dashboard/stats-bar";
import { SectionCard } from "@/components/features/dashboard/section-card";
import { CategoryFilter } from "@/components/features/dashboard/category-filter";
import { CATEGORIES } from "@/lib/data/sections";

export default function DashboardPage() {
  const { sections } = useData();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredSections = selectedCategory
    ? sections.filter((s) => s.category === selectedCategory)
    : sections;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-100">Report Dashboard</h1>
        <p className="text-sm text-zinc-400 mt-1">
          {sections.length} total sections · Q2 2026 Market Intelligence Report
        </p>
      </div>

      <StatsBar sections={sections} />

      <div className="flex gap-6">
        <aside className="w-48 flex-shrink-0">
          <CategoryFilter
            categories={[...CATEGORIES]}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </aside>

        <div className="flex-1">
          {filteredSections.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-12">No sections in this category</p>
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
