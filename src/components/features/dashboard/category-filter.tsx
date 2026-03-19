"use client";

import { ReportSection } from "@/types";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  categories: readonly string[];
  selected: string | null;
  onSelect: (category: string | null) => void;
  sections: ReportSection[];
}

export function CategoryFilter({ categories, selected, onSelect, sections }: CategoryFilterProps) {
  const countFor = (category: string | null) =>
    category === null
      ? sections.length
      : sections.filter((s) => s.category === category).length;

  return (
    <div className="space-y-1">
      <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
        Categories
      </h2>
      <button
        onClick={() => onSelect(null)}
        className={cn(
          "w-full text-left text-sm px-3 py-2 rounded-md transition-colors flex items-center justify-between",
          selected === null
            ? "bg-zinc-800 text-zinc-100"
            : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
        )}
      >
        <span>All Sections</span>
        <span className="text-xs text-zinc-500">{countFor(null)}</span>
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={cn(
            "w-full text-left text-sm px-3 py-2 rounded-md transition-colors flex items-center justify-between",
            selected === cat
              ? "bg-zinc-800 text-zinc-100"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
          )}
        >
          <span className="truncate">{cat}</span>
          <span className="text-xs text-zinc-500 flex-shrink-0 ml-2">{countFor(cat)}</span>
        </button>
      ))}
    </div>
  );
}
