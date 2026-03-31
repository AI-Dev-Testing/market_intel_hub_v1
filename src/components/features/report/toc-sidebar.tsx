// src/components/features/report/toc-sidebar.tsx
"use client";

import { cn } from "@/lib/utils";
import { useTOC } from "@/hooks/use-toc";

export interface TocEntry {
  categoryId: string;   // e.g. "supply-chain-risks"
  categoryLabel: string; // e.g. "Supply Chain Risks"
  sections: { id: string; title: string }[];
}

interface TocSidebarProps {
  entries: TocEntry[];
}

export function TocSidebar({ entries }: TocSidebarProps) {
  const allSectionIds = entries.flatMap((e) => e.sections.map((s) => s.id));
  const activeId = useTOC(allSectionIds);

  function jumpTo(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      {/* ── Mobile / tablet: "Jump to…" dropdown ── */}
      <div className="xl:hidden mb-6">
        <select
          className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-zinc-700"
          value={activeId ?? ""}
          onChange={(e) => jumpTo(e.target.value)}
        >
          <option value="" disabled>
            Jump to section…
          </option>
          {entries.map((entry) =>
            entry.sections.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {entry.categoryLabel} — {sec.title}
              </option>
            ))
          )}
        </select>
      </div>

      {/* ── Desktop (xl+): sticky sidebar ── */}
      <nav
        aria-label="Report table of contents"
        className="hidden xl:block w-56 flex-shrink-0 sticky top-24 self-start max-h-[calc(100vh-7rem)] overflow-y-auto"
      >
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">
          Contents
        </p>
        <div className="space-y-5">
          {entries.map((entry) => (
            <div key={entry.categoryId}>
              <a
                href={`#${entry.categoryId}`}
                className="block text-xs font-semibold text-zinc-400 hover:text-zinc-200 mb-2 transition-colors"
              >
                {entry.categoryLabel}
              </a>
              <ul className="space-y-1 pl-3 border-l border-zinc-800">
                {entry.sections.map((sec) => (
                  <li key={sec.id}>
                    <a
                      href={`#${sec.id}`}
                      className={cn(
                        "block text-xs py-0.5 leading-snug transition-colors",
                        activeId === sec.id
                          ? "text-zinc-100 font-medium"
                          : "text-zinc-500 hover:text-zinc-300"
                      )}
                    >
                      {sec.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </nav>
    </>
  );
}
