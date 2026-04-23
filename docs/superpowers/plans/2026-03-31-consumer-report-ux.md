# Consumer Report UX Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the `/report` page into a polished, navigable publication with a sticky TOC sidebar, two-column wide-screen layout, section anchor links, draft mode banner, per-section metadata, executive summary links, and a contact footer.

**Architecture:** All changes are isolated to `src/app/report/page.tsx` (the single "use client" report page), a new `useTOC` Intersection Observer hook, and a new `TocSidebar` component. The layout wrapper is restructured from a single `max-w-3xl` column to a flex row that shows the TOC sidebar at `xl` breakpoint (1280px+) alongside a `max-w-[780px]` content column.

**Tech Stack:** Next.js 15 App Router, React (hooks, Intersection Observer API), Tailwind CSS, lucide-react, TypeScript.

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `src/hooks/use-toc.ts` | Create | Intersection Observer hook — tracks which section ID is currently visible |
| `src/components/features/report/toc-sidebar.tsx` | Create | Sticky desktop TOC + mobile "Jump to…" dropdown |
| `src/app/report/page.tsx` | Modify | Add anchors, two-column layout, draft banner, metadata, exec summary links, footer |

---

## Task 1: Add section and category anchor IDs + hover link icon

**Files:**
- Modify: `src/app/report/page.tsx`

This is a pure markup change — add `id` attributes to section and category elements and show a copyable link icon when hovering a section title.

- [ ] **Step 1: Add `categorySlug` helper and import `Link2` from lucide-react**

Replace the import line at the top of `src/app/report/page.tsx`:

```tsx
// BEFORE (line 6):
import { ChevronDown, ChevronUp } from "lucide-react";

// AFTER:
import { ChevronDown, ChevronUp, Link2 } from "lucide-react";
```

Add this helper function directly below the `SourcesDisclosure` component (before `export default function ReportPage`):

```tsx
function categorySlug(cat: string): string {
  return cat.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
```

- [ ] **Step 2: Add `id` to the category wrapper div**

In the `.map(({ category, sections: catSections }) => {` render block, find:

```tsx
return (
  <div key={category}>
    <div className="flex items-center justify-between pb-2 border-b border-zinc-800 mb-5">
```

Change to:

```tsx
return (
  <div key={category} id={categorySlug(category)}>
    <div className="flex items-center justify-between pb-2 border-b border-zinc-800 mb-5">
```

- [ ] **Step 3: Add `id` to the section card div and hover anchor to the section title**

Find this block inside the `sectionsToRender.map` (around line 198–215):

```tsx
return (
  <div key={section.id} className="rounded-lg border border-zinc-800 overflow-hidden">
    {/* … image/chart block … */}
    <div className="p-5">
      <h3 className="text-sm font-semibold text-zinc-200 mb-3">
        {section.title}
      </h3>
```

Replace with:

```tsx
return (
  <div key={section.id} id={section.id} className="rounded-lg border border-zinc-800 overflow-hidden">
    {/* … image/chart block … */}
    <div className="p-5">
      <div className="group flex items-start gap-1.5 mb-3">
        <h3 className="text-sm font-semibold text-zinc-200 flex-1">
          {section.title}
        </h3>
        <a
          href={`#${section.id}`}
          onClick={(e) => {
            e.preventDefault();
            void navigator.clipboard?.writeText(
              window.location.origin + `/report#${section.id}`
            );
            window.history.replaceState(null, "", `/report#${section.id}`);
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 text-zinc-600 hover:text-zinc-400 flex-shrink-0"
          title="Copy link to section"
          aria-label="Copy link to section"
        >
          <Link2 className="w-3.5 h-3.5" />
        </a>
      </div>
```

- [ ] **Step 4: Verify the page compiles and anchor links work**

```bash
# Dev server should already be running on port 3000
# Navigate to http://localhost:3000/report
# Hover over any section title — a chain-link icon should appear
# Click it — URL should update to /report#<section-id>
```

- [ ] **Step 5: Commit**

```bash
git add src/app/report/page.tsx
git commit -m "feat: add section and category anchor IDs with hover link icon on /report"
```

---

## Task 2: Create `useTOC` Intersection Observer hook

**Files:**
- Create: `src/hooks/use-toc.ts`

This hook observes a list of element IDs and returns the ID of whichever section is currently closest to the top of the viewport.

- [ ] **Step 1: Create the hook file**

```typescript
// src/hooks/use-toc.ts
"use client";

import { useState, useEffect } from "react";

/**
 * Tracks which section element is currently visible near the top of the
 * viewport using the Intersection Observer API. Returns the active section ID.
 *
 * @param sectionIds - array of element IDs to observe (e.g. ["macro-overview", "sc-logistics"])
 */
export function useTOC(sectionIds: string[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (sectionIds.length === 0) return;

    const handleIntersect: IntersectionObserverCallback = (entries) => {
      // Find the intersecting entry whose top edge is closest to viewport top
      const intersecting = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

      if (intersecting.length > 0) {
        setActiveId(intersecting[0].target.id);
      }
    };

    const observer = new IntersectionObserver(handleIntersect, {
      // Fire when element top crosses 80px below the viewport top
      rootMargin: "-80px 0px -55% 0px",
      threshold: 0,
    });

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sectionIds.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  return activeId;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
# Expected: no errors related to use-toc.ts
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/use-toc.ts
git commit -m "feat: add useTOC intersection observer hook for report navigation"
```

---

## Task 3: Create `TocSidebar` component

**Files:**
- Create: `src/components/features/report/toc-sidebar.tsx`

Desktop: sticky left sidebar with category + section links, active section highlighted. Mobile (below `xl`/1280px): a `<select>` "Jump to…" dropdown at the top of the page.

- [ ] **Step 1: Create the component file**

```tsx
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
# Expected: no errors related to toc-sidebar.tsx
```

- [ ] **Step 3: Commit**

```bash
git add src/components/features/report/toc-sidebar.tsx
git commit -m "feat: add TocSidebar component with desktop sticky nav and mobile dropdown"
```

---

## Task 4: Restructure report page to two-column wide-screen layout

**Files:**
- Modify: `src/app/report/page.tsx`

This replaces the single `max-w-3xl` wrapper with a flex row: TOC sidebar on the left (visible at xl+), content column on the right (`max-w-[780px]`, `min-w-0 flex-1`).

**Context:** The outer `<main>` in `src/app/layout.tsx` is already `max-w-7xl mx-auto px-6 py-8`, so we just need to make the report page fill that width at xl and constrain the content column.

- [ ] **Step 1: Import TocSidebar and update top-level imports**

At the top of `src/app/report/page.tsx`, add the import:

```tsx
import { TocSidebar, type TocEntry } from "@/components/features/report/toc-sidebar";
```

- [ ] **Step 2: Build `tocEntries` from `approvedByCategory`**

Inside `ReportPage`, add this derived value after the `visibleCategories` computation:

```tsx
const tocEntries: TocEntry[] = approvedByCategory.map(({ category, sections: catSections }) => ({
  categoryId: categorySlug(category),
  categoryLabel: category,
  sections: catSections.map((s) => ({ id: s.id, title: s.title })),
}));
```

- [ ] **Step 3: Replace the outer `<div className="max-w-3xl">` with the two-column wrapper**

The current return statement opens with:

```tsx
return (
  <div className="max-w-3xl">
```

Replace **only that opening wrapper div** with:

```tsx
return (
  <div className="flex gap-10 items-start">
    <TocSidebar entries={tocEntries} />
    <div className="min-w-0 flex-1 max-w-[780px]">
```

And add the matching closing `</div>` for the new inner content wrapper just before the final closing `</div>` of the return:

```tsx
    </div> {/* end content column */}
  </div>   // end flex wrapper
);
```

So the full structure of the return becomes:
```tsx
return (
  <div className="flex gap-10 items-start">
    <TocSidebar entries={tocEntries} />
    <div className="min-w-0 flex-1 max-w-[780px]">
      {/* … all existing report content … */}
    </div>
  </div>
);
```

- [ ] **Step 4: Verify layout in browser at wide and narrow widths**

```bash
# Navigate to http://localhost:3000/report at full browser width (>1280px)
# Expected: TOC sidebar visible on the left, content column on the right (~780px wide)
# Resize browser to <1280px
# Expected: TOC sidebar disappears, "Jump to…" dropdown visible at top of content
# Click a TOC link — page should scroll to that section
```

- [ ] **Step 5: Commit**

```bash
git add src/app/report/page.tsx
git commit -m "feat: two-column wide-screen layout on /report with TOC sidebar wired in"
```

---

## Task 5: Add draft mode banner

**Files:**
- Modify: `src/app/report/page.tsx`

When `reportMeta.published` is false, show a persistent amber banner at the top of the content column warning that the report is not ready for external sharing.

- [ ] **Step 1: Import `AlertTriangle` from lucide-react**

Update the lucide import line:

```tsx
// BEFORE:
import { ChevronDown, ChevronUp, Link2 } from "lucide-react";

// AFTER:
import { AlertTriangle, ChevronDown, ChevronUp, Link2 } from "lucide-react";
```

- [ ] **Step 2: Add the draft banner as the first element inside the content column**

Inside the `<div className="min-w-0 flex-1 max-w-[780px]">` content column, insert this as the very first child (before `<div className="mb-8">`):

```tsx
{!reportMeta.published && (
  <div className="mb-6 flex items-center gap-2.5 rounded-md bg-amber-950/40 border border-amber-800/50 px-4 py-3">
    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
    <p className="text-sm text-amber-300">
      This report is in <strong className="font-semibold">draft</strong> — not ready for external sharing.
    </p>
  </div>
)}
```

- [ ] **Step 3: Verify the banner appears when report is in drafting mode**

```bash
# Navigate to http://localhost:3000/report
# Expected: amber "This report is in draft — not ready for external sharing." banner visible at top
# Navigate to /admin/settings and toggle Published → banner should disappear on /report
# Toggle back to Drafting → banner reappears
```

- [ ] **Step 4: Commit**

```bash
git add src/app/report/page.tsx
git commit -m "feat: draft mode banner on /report when report is not published"
```

---

## Task 6: Per-section metadata, improved report header, and back-to-top button

**Files:**
- Modify: `src/app/report/page.tsx`

Add three improvements:
1. **Per-section**: "Updated Mar 18" + "3 min read" indicator below the section title
2. **Report header**: tighten the metadata bar (period, completion, updated date) into a single compact line
3. **Back-to-top button**: fixed-position button visible after scrolling 300px

- [ ] **Step 1: Add helper functions below `categorySlug`**

Add these two helpers directly after the `categorySlug` function:

```tsx
function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function estimateReadTime(text: string): number {
  return Math.max(1, Math.ceil(text.trim().split(/\s+/).length / 200));
}
```

- [ ] **Step 2: Add `BackToTop` component after the helpers**

```tsx
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
```

- [ ] **Step 3: Import `ArrowUp` and `useEffect` at the top of the file**

Update the lucide import:

```tsx
// BEFORE:
import { AlertTriangle, ChevronDown, ChevronUp, Link2 } from "lucide-react";

// AFTER:
import { AlertTriangle, ArrowUp, ChevronDown, ChevronUp, Link2 } from "lucide-react";
```

The file already imports `useState` — add `useEffect` to the React import:

```tsx
// BEFORE:
import { useState } from "react";

// AFTER:
import { useState, useEffect } from "react";
```

- [ ] **Step 4: Update the report header metadata bar**

Find the current metadata block inside `<div className="mb-8">`:

```tsx
<div className="flex items-center gap-4 mt-3 text-xs text-zinc-500">
  <span>{approvedSections.length} of {totalSections} sections approved</span>
  <span suppressHydrationWarning>Generated {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
</div>
```

Replace with:

```tsx
<div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-xs text-zinc-500">
  <span>Period: {reportMeta.period}</span>
  <span className="text-zinc-700">·</span>
  <span>{approvedSections.length} of {totalSections} sections approved</span>
  <span className="text-zinc-700">·</span>
  <span suppressHydrationWarning>
    Updated {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
  </span>
</div>
```

- [ ] **Step 5: Add per-section metadata row below the title anchor group**

Inside the `sectionsToRender.map`, find the section title block added in Task 1:

```tsx
<div className="group flex items-start gap-1.5 mb-3">
  <h3 className="text-sm font-semibold text-zinc-200 flex-1">
    {section.title}
  </h3>
  <a
    href={`#${section.id}`}
    ...
  >
    <Link2 className="w-3.5 h-3.5" />
  </a>
</div>
```

Replace with:

```tsx
<div className="mb-3">
  <div className="group flex items-start gap-1.5 mb-1">
    <h3 className="text-sm font-semibold text-zinc-200 flex-1">
      {section.title}
    </h3>
    <a
      href={`#${section.id}`}
      onClick={(e) => {
        e.preventDefault();
        void navigator.clipboard?.writeText(
          window.location.origin + `/report#${section.id}`
        );
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
    <span>·</span>
    <span>{estimateReadTime(section.draft)} min read</span>
  </div>
</div>
```

- [ ] **Step 6: Render `<BackToTop />` at the end of the return statement**

Just before the final `</div>` that closes the content column (added in Task 4), add:

```tsx
<BackToTop />
```

- [ ] **Step 7: Verify in browser**

```bash
# Navigate to http://localhost:3000/report
# Each section should show "Updated Mar 18 · 3 min read" below the title
# Report header should show "Period: Q2 2026 · 11 of 21 sections approved · Updated March 31, 2026"
# Scroll down past 300px — a round back-to-top button should appear bottom-right
# Click it — page scrolls back to top
```

- [ ] **Step 8: Commit**

```bash
git add src/app/report/page.tsx
git commit -m "feat: per-section metadata (updated date, read time), improved report header, back-to-top button"
```

---

## Task 7: Executive summary section links + report contact footer

**Files:**
- Modify: `src/app/report/page.tsx`

Two small additions:
1. Each executive summary bullet that mentions an approved section title becomes a clickable anchor link to that section.
2. A simple contact footer at the bottom of the report.

- [ ] **Step 1: Add `findMatchingSection` helper**

Add this helper after `estimateReadTime`:

```tsx
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
```

- [ ] **Step 2: Update the executive summary bullet render**

Find the current bullet render inside the `reportMeta.executiveSummary` block:

```tsx
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
```

Replace with:

```tsx
{reportMeta.executiveSummary
  .split("\n")
  .filter((line) => line.trim().startsWith("•"))
  .map((line, i) => {
    const cleanText = line.replace(/^•\s*/, "");
    const match = findMatchingSection(cleanText, approvedSections);
    const inner = (
      <span
        dangerouslySetInnerHTML={{
          __html: cleanText.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"),
        }}
      />
    );
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
```

- [ ] **Step 3: Add the contact footer**

Just before `<BackToTop />` at the bottom of the content column, add:

```tsx
{approvedByCategory.length > 0 && (
  <footer className="mt-16 pt-6 border-t border-zinc-800">
    <p className="text-xs font-semibold text-zinc-400">GPSC Market Intelligence Team</p>
    <p className="text-xs text-zinc-600 mt-1">
      For questions about this report, contact your GPSC procurement lead.
    </p>
  </footer>
)}
```

- [ ] **Step 4: Verify in browser**

```bash
# Navigate to http://localhost:3000/report
# Executive summary bullets that mention a section title (e.g. "Supply Chain Risk Dashboard")
# should appear as underlined links — clicking one scrolls to that section
# Scroll to the bottom — "GPSC Market Intelligence Team" footer should be visible
```

- [ ] **Step 5: Commit**

```bash
git add src/app/report/page.tsx
git commit -m "feat: executive summary section links and contact footer on /report"
```

---

## Self-Review Checklist

Spec requirements vs tasks:

| P1 Requirement | Task |
|---|---|
| Sticky TOC sidebar (desktop) + "Jump to…" dropdown (mobile) | Tasks 2, 3, 4 |
| Section anchor links + hover link icon | Task 1 |
| Back-to-top button after 300px scroll | Task 6 |
| Wide-screen two-column layout (TOC + 780px content) | Task 4 |
| Max line length (`max-w-[780px]`) | Task 4 |
| Draft mode banner on /report | Task 5 |
| Report metadata bar (period, completion, updated) | Task 6 |
| "Last updated" per section | Task 6 |
| Estimated read time per section | Task 6 |
| Executive summary links to sections | Task 7 |
| Report contact footer | Task 7 |
| Category header anchors as visual landmarks | Task 1 (id on category div) |

All P1 consumer items are covered. Phase 2 items (saved reading position, edition label, inline comments) are explicitly out of scope.
