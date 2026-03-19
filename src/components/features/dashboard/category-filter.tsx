// src/components/features/dashboard/category-filter.tsx
"use client";

import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  categories: readonly string[];
  selected: string | null;
  onSelect: (category: string | null) => void;
}

export function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="space-y-1">
      <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
        Categories
      </h2>
      <button
        onClick={() => onSelect(null)}
        className={cn(
          "w-full text-left text-sm px-3 py-2 rounded-md transition-colors",
          selected === null
            ? "bg-zinc-800 text-zinc-100"
            : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
        )}
      >
        All Sections
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={cn(
            "w-full text-left text-sm px-3 py-2 rounded-md transition-colors",
            selected === cat
              ? "bg-zinc-800 text-zinc-100"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
