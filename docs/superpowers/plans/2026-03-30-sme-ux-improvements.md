# SME UX Improvements — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement all Phase 1 SME/producer-facing UX improvements from the approved spec — dashboard clarity, draft generation feedback, unsaved change protection, review cycle improvements, stale summary indicator, nav lifecycle pill, and a section status change log.

**Architecture:** Each task is a self-contained improvement; they share no runtime dependencies on each other and can be committed independently. The heaviest change is the `StatusLogEntry` type addition to `ReportSection`, which threads through `types/index.ts` → `data-context.tsx` → the section editor sidebar. All other tasks are confined to a single file or two cooperating files.

**Tech Stack:** Next.js 15 App Router, React, TypeScript, Tailwind CSS, shadcn/ui, localStorage (browser API), no new packages required.

---

## File Map

| File | Change |
|------|--------|
| `src/types/index.ts` | Add `StatusLogEntry` type; add `statusHistory` to `ReportSection`; add `isSummaryStale` to `DataContextValue` |
| `src/contexts/data-context.tsx` | `updateSection` detects status changes → pushes to `statusHistory`; expose `isSummaryStale` computed flag |
| `src/app/dashboard/page.tsx` | Add `selectedSme` state + localStorage persistence; pass SME-filtered sections to `StatsBar` |
| `src/components/features/dashboard/stats-bar.tsx` | Accept `sections` prop already used — no interface change needed (filtered sections passed in) |
| `src/components/features/dashboard/section-card.tsx` | Show `notes` snippet (1-line clamp) when status is `revision_needed` |
| `src/app/api/generate-draft/route.ts` | Add `urlStatuses` array to JSON response |
| `src/hooks/use-autosave.ts` | **Create** — autosave draft to localStorage; return autosaved draft + clear fn |
| `src/components/features/section-editor/draft-panel.tsx` | URL status chips; pre-generation status message; `beforeunload` handler; autosave via hook |
| `src/components/features/section-editor/workflow-controls.tsx` | Accept `onRevisionGateHit` callback; call it instead of silently disabling button |
| `src/app/sections/[id]/page.tsx` | Wire `onRevisionGateHit` → focus notes ref; scroll-to-feedback on load for `revision_needed`; improved notes label; status log timeline in sidebar |
| `src/components/features/nav/main-nav.tsx` | Add DRAFTING / PUBLISHED lifecycle pill |
| `src/app/admin/settings/page.tsx` | Publish confirmation dialog listing incomplete sections; stale summary badge |

---

## Task 1: Add `StatusLogEntry` type and `statusHistory` to `ReportSection`

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 1: Add `StatusLogEntry` type and `statusHistory` field**

Open `src/types/index.ts`. Add the new type directly before `ReportSection`, then add the optional field to the interface:

```typescript
export interface StatusLogEntry {
  status: SectionStatus;
  timestamp: string; // ISO date string, e.g. "2026-03-30"
  note?: string;     // reviewer note captured at the time of the change
}
```

Add `statusHistory?: StatusLogEntry[];` as an optional field on `ReportSection`:

```typescript
export interface ReportSection {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  assignedSme: string;
  status: SectionStatus;
  draft: string;
  lastUpdated: string;
  notes: string;
  sources?: Source[];
  promptOverride?: SectionPromptOverride;
  statusHistory?: StatusLogEntry[];  // ← add this line
}
```

Also add `isSummaryStale: boolean;` to `DataContextValue` (near the `isSummaryLoading` field):

```typescript
isSummaryLoading: boolean;
isSummaryStale: boolean;   // ← add this line
regenerateSummary: () => Promise<void>;
```

- [ ] **Step 2: Verify TypeScript still compiles**

```bash
cd c:/Users/aurgecab/GPSC_Market_Intel_Updated_V1.0 && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors (fields are optional so no existing code breaks).

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add StatusLogEntry type and statusHistory to ReportSection"
```

---

## Task 2: Update `data-context` to record status changes and expose `isSummaryStale`

**Files:**
- Modify: `src/contexts/data-context.tsx`

- [ ] **Step 1: Import `StatusLogEntry` and update `updateSection` to record status changes**

In `src/contexts/data-context.tsx`, update the import line at the top to include `StatusLogEntry`:

```typescript
import {
  CategoryNode,
  DataContextValue,
  FreightTrendData,
  PromptConfig,
  ReportMeta,
  ReportSection,
  RiskScorecardData,
  SectionPromptOverride,
  StatusLogEntry,
  SubcategoryNode,
} from "@/types";
```

Replace the existing `updateSection` function (lines 119–125) with this version that appends to `statusHistory` when the status field changes:

```typescript
const updateSection = (id: string, updates: Partial<ReportSection>) => {
  setSections((prev) =>
    prev.map((s) => {
      if (s.id !== id) return s;
      const statusChanged = updates.status !== undefined && updates.status !== s.status;
      const newEntry: StatusLogEntry | undefined = statusChanged
        ? { status: updates.status!, timestamp: today(), note: updates.notes ?? s.notes ?? undefined }
        : undefined;
      return {
        ...s,
        ...updates,
        lastUpdated: today(),
        statusHistory: newEntry
          ? [...(s.statusHistory ?? []), newEntry]
          : (s.statusHistory ?? []),
      };
    })
  );
};
```

- [ ] **Step 2: Add `isSummaryStale` computed value**

Add this constant just before the `return` statement of `DataProvider` (after all the other state declarations and callbacks):

```typescript
// Computed: summary is stale if any approved section was updated after the last summary generation
const isSummaryStale = (() => {
  if (!reportMeta.summaryUpdatedAt) return false;
  const summaryDate = new Date(reportMeta.summaryUpdatedAt);
  return sections
    .filter((s) => s.status === "approved")
    .some((s) => new Date(s.lastUpdated) > summaryDate);
})();
```

- [ ] **Step 3: Expose `isSummaryStale` in the context value**

In the `return` at the bottom of `DataProvider`, find the `isSummaryLoading` line and add `isSummaryStale` next to it:

```typescript
isSummaryLoading,
isSummaryStale,
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd c:/Users/aurgecab/GPSC_Market_Intel_Updated_V1.0 && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/contexts/data-context.tsx
git commit -m "feat: record status change history in sections; expose isSummaryStale"
```

---

## Task 3: Dashboard — "My Sections" filter

**Files:**
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Add `selectedSme` state with localStorage persistence**

In `src/app/dashboard/page.tsx`, update the imports and state block. Replace the existing state declarations block:

```typescript
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
```

- [ ] **Step 2: Add SME-filtered sections and update filtering logic**

Replace the `filteredSections` and `activeFilters` lines with:

```typescript
  // SME filter applied first so StatsBar counts reflect the same scope
  const smeFilteredSections = selectedSme
    ? sections.filter((s) => s.assignedSme === selectedSme)
    : sections;

  const filteredSections = smeFilteredSections
    .filter((s) => {
      if (selectedCategory && s.category !== selectedCategory) return false;
      if (selectedStatus && s.status !== selectedStatus) return false;
      return true;
    })
    .sort((a, b) => STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status]);

  const activeFilters = [selectedCategory, selectedStatus, selectedSme].filter(Boolean).length;
```

- [ ] **Step 3: Add the "My Sections" filter UI and pass correct sections to StatsBar**

Replace the existing `return` JSX. Key changes: (a) pass `smeFilteredSections` to `StatsBar` and `ProgressBanner`, (b) add the SME filter chip row above `StatsBar`:

```tsx
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
```

- [ ] **Step 4: Manual verification**

Start dev server (`npm run dev`). Go to `/dashboard`. Confirm:
- Name chips appear above the stats bar.
- Clicking a name filters cards AND stat bar counts to that SME only.
- Refreshing the page restores the selected filter.
- "Clear all filters" resets the SME selection.

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/page.tsx
git commit -m "feat: add My Sections name filter to dashboard with localStorage persistence"
```

---

## Task 4: Dashboard — Revision feedback snippet on section cards

**Files:**
- Modify: `src/components/features/dashboard/section-card.tsx`

- [ ] **Step 1: Add the reviewer feedback snippet**

Replace the entire file content with the version below. The only change is a new block between the draft preview and the footer — it shows `section.notes` clamped to 1 line when status is `revision_needed`:

```tsx
import Link from "next/link";
import { ReportSection, SectionStatus, STATUS_LABELS, STATUS_COLORS } from "@/types";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  section: ReportSection;
}

const URGENCY_BORDER: Partial<Record<SectionStatus, string>> = {
  revision_needed: "border-l-orange-500",
  in_review: "border-l-yellow-600",
  approved: "border-l-green-700",
};

const CTA_HINTS: Record<SectionStatus, string> = {
  pending: "Start draft →",
  draft: "Continue editing →",
  in_review: "Awaiting review →",
  revision_needed: "Address feedback →",
  approved: "View section →",
};

export function SectionCard({ section }: SectionCardProps) {
  const urgencyBorder = URGENCY_BORDER[section.status];

  return (
    <Link href={`/sections/${section.id}`}>
      <div
        className={cn(
          "group bg-zinc-900 border border-l-4 rounded-lg p-4 hover:border-zinc-600 transition-colors cursor-pointer h-full flex flex-col",
          urgencyBorder ?? "border-l-zinc-800",
          "border-t-zinc-800 border-r-zinc-800 border-b-zinc-800"
        )}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-sm font-medium text-zinc-100 group-hover:text-white leading-tight">
            {section.title}
          </h3>
          <span className={cn("text-xs px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0", STATUS_COLORS[section.status])}>
            {STATUS_LABELS[section.status]}
          </span>
        </div>
        <p className="text-xs text-zinc-500 mb-3">{section.subcategory}</p>
        <div className="flex-1 space-y-2">
          {section.status === "revision_needed" && section.notes?.trim() ? (
            <div className="bg-orange-950/40 border border-orange-900/40 rounded-md px-2.5 py-1.5">
              <p className="text-xs text-orange-300/80 line-clamp-1 leading-relaxed">
                ⚠ {section.notes}
              </p>
            </div>
          ) : section.draft ? (
            <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
              {section.draft}
            </p>
          ) : (
            <p className="text-xs text-zinc-600 italic">No draft yet</p>
          )}
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800">
          <span className="text-xs text-zinc-500">
            {section.assignedSme || <span className="text-zinc-600 italic">Unassigned</span>}
          </span>
          <span className="text-xs text-zinc-500 group-hover:text-zinc-300 transition-colors">
            {CTA_HINTS[section.status]}
          </span>
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Manual verification**

In the running dev server, go to `/dashboard`. Find a section with `revision_needed` status. Confirm the orange feedback snippet appears on the card. Confirm other statuses still show the draft preview or "No draft yet".

- [ ] **Step 3: Commit**

```bash
git add src/components/features/dashboard/section-card.tsx
git commit -m "feat: show reviewer feedback snippet on revision_needed dashboard cards"
```

---

## Task 5: API — Add `urlStatuses` to generate-draft response

**Files:**
- Modify: `src/app/api/generate-draft/route.ts`

- [ ] **Step 1: Track fetch status per URL and include in response**

In `src/app/api/generate-draft/route.ts`, add a `urlStatuses` tracking array. Insert it right after the `urlWarnings` declaration (line 68) and populate it inside the Step 3 loop:

After `const urlWarnings: string[] = [];` add:
```typescript
const urlStatuses: Array<{ url: string; status: "fetched" | "fallback" | "failed" }> = [];
```

Inside the `for (const { ref, result } of directResults)` loop, replace the existing body with:

```typescript
for (const { ref, result } of directResults) {
  if (result.content) {
    resolvedReferences.push({ ...ref, fetchedContent: result.content });
    urlStatuses.push({ url: ref.content, status: "fetched" });
  } else {
    const extracted = extractMap.get(ref.content);
    if (extracted?.content) {
      resolvedReferences.push({ ...ref, fetchedContent: extracted.content });
      urlStatuses.push({ url: ref.content, status: "fallback" });
    } else {
      const reason = result.error ?? "Unknown error";
      let tip = "";
      if (reason.includes("401") || reason.includes("403")) {
        tip = " — site requires login. Paste the article text in Reference Text instead, or enable Web Search.";
      } else if (reason.includes("Non-text")) {
        tip = " — not a readable web page (PDF or media file).";
      }
      resolvedReferences.push({ ...ref, fetchError: reason });
      urlWarnings.push(`Could not fetch ${ref.content}: ${reason}${tip}`);
      urlStatuses.push({ url: ref.content, status: "failed" });
    }
  }
}
```

Update the final `return NextResponse.json(...)` to include `urlStatuses`:

```typescript
return NextResponse.json({
  draft,
  sources: webSources,
  urlStatuses,
  ...(urlWarnings.length > 0 && { warnings: urlWarnings }),
});
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/generate-draft/route.ts
git commit -m "feat: include urlStatuses (fetched/fallback/failed) in generate-draft response"
```

---

## Task 6: Create `use-autosave` hook

**Files:**
- Create: `src/hooks/use-autosave.ts`

- [ ] **Step 1: Write the hook**

Create `src/hooks/use-autosave.ts`:

```typescript
// src/hooks/use-autosave.ts
"use client";

import { useEffect, useRef } from "react";

const AUTOSAVE_PREFIX = "gpsc_draft_autosave_";
const AUTOSAVE_INTERVAL_MS = 30_000;

export interface AutosaveEntry {
  draft: string;
  savedAt: string; // ISO timestamp
}

export function useAutosave(sectionId: string, draft: string, enabled: boolean) {
  const key = `${AUTOSAVE_PREFIX}${sectionId}`;
  const draftRef = useRef(draft);
  draftRef.current = draft;

  // Save to localStorage on every draft change (only when there are unsaved changes)
  useEffect(() => {
    if (!enabled || !draftRef.current) return;
    const entry: AutosaveEntry = { draft: draftRef.current, savedAt: new Date().toISOString() };
    localStorage.setItem(key, JSON.stringify(entry));
  }, [key, enabled, draft]);

  function getAutosaved(): AutosaveEntry | null {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as AutosaveEntry;
    } catch {
      return null;
    }
  }

  function clearAutosave() {
    localStorage.removeItem(key);
  }

  return { getAutosaved, clearAutosave };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/use-autosave.ts
git commit -m "feat: add useAutosave hook for localStorage draft persistence"
```

---

## Task 7: DraftPanel — URL status chips, pre-generation message, `beforeunload`, and autosave restore banner

**Files:**
- Modify: `src/components/features/section-editor/draft-panel.tsx`

- [ ] **Step 1: Add new state, import the autosave hook, and add `beforeunload`**

Replace the imports and state block at the top of `draft-panel.tsx`:

```tsx
// src/components/features/section-editor/draft-panel.tsx
"use client";

import { useState, KeyboardEvent, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ReportSection, SectionStatus, Source } from "@/types";
import { useSourcePreferences } from "@/hooks/use-source-preferences";
import { useData } from "@/contexts/data-context";
import { useAutosave } from "@/hooks/use-autosave";
import { cn } from "@/lib/utils";

interface DraftPanelProps {
  section: ReportSection;
  onDraftChange: (draft: string) => void;
  onSourcesChange?: (sources: Source[]) => void;
  onStatusChange?: (status: SectionStatus) => void;
}

interface Reference {
  id: string;
  type: "url" | "text";
  content: string;
}

type UrlFetchStatus = "fetched" | "fallback" | "failed";
```

Inside the component function, add the new state variables after the existing state block (after `const [showBlacklist, setShowBlacklist] = useState(false);`):

```tsx
  const [urlStatuses, setUrlStatuses] = useState<Record<string, UrlFetchStatus>>({});
  const [generationStatus, setGenerationStatus] = useState<string | null>(null);
  const [showRestoreBanner, setShowRestoreBanner] = useState(false);
  const hasRestoredRef = useRef(false);

  const { getAutosaved, clearAutosave } = useAutosave(section.id, draft, hasUnsavedChanges);

  // Check for autosaved draft on mount
  useEffect(() => {
    if (hasRestoredRef.current || isApproved) return;
    hasRestoredRef.current = true;
    const saved = getAutosaved();
    if (saved && saved.draft !== section.draft) {
      setShowRestoreBanner(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Warn on unsaved changes before navigating away
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsavedChanges]);
```

- [ ] **Step 2: Update `handleSave` and `handleGenerate` to clear autosave and manage generation status**

Replace `handleSave`:
```tsx
  const handleSave = () => {
    onDraftChange(draft);
    setHasUnsavedChanges(false);
    clearAutosave();
  };
```

Replace the inside of `handleGenerate` to add status messages and capture `urlStatuses`. Replace the entire `handleGenerate` function:

```tsx
  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setWarnings([]);
    setUrlStatuses({});

    const references = buildReferences();
    const urlCount = urls.length;
    const webSearchOn = useWebSearch;
    setGenerationStatus(
      [
        urlCount > 0 && `Fetching ${urlCount} source${urlCount !== 1 ? "s" : ""}…`,
        webSearchOn && "Searching the web…",
      ]
        .filter(Boolean)
        .join(" ") || "Generating draft…"
    );

    try {
      // window.fetch — browser client component, not Vercel Workflow code
      const apiFetch = window.fetch.bind(window);
      const response = await apiFetch("/api/generate-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionTitle: section.title,
          category: section.category,
          subcategory: section.subcategory,
          references: references.length > 0 ? references : undefined,
          instructions: instructions.trim() || undefined,
          useWebSearch,
          whitelist,
          blacklist,
          systemPrompt: effectiveSystemPrompt || undefined,
          userPromptTemplate: effectiveUserPromptTemplate || undefined,
          ...(section.id === "sc-overview" && {
            scorecardSummary: Object.entries(scorecards)
              .map(([id, s]) => `${id}: overall ${s.overallScore}/10 (likelihood ${s.likelihood.score}/5, impact ${s.impact.score}/5, velocity ${s.velocity.score}/5)`)
              .join("; "),
          }),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate draft");
      }

      // Build urlStatuses map from API response
      if (Array.isArray(data.urlStatuses)) {
        const statusMap: Record<string, UrlFetchStatus> = {};
        for (const entry of data.urlStatuses) {
          statusMap[entry.url] = entry.status;
        }
        setUrlStatuses(statusMap);
      }

      const fetchedCount = Object.values(urlStatuses).filter((s) => s === "fetched").length;
      const fallbackCount = Object.values(urlStatuses).filter((s) => s === "fallback").length;
      const webCount = (data.sources ?? []).length;
      const parts = [
        (fetchedCount + fallbackCount) > 0 && `${fetchedCount + fallbackCount} source${(fetchedCount + fallbackCount) !== 1 ? "s" : ""} loaded`,
        webCount > 0 && `${webCount} web result${webCount !== 1 ? "s" : ""} found`,
      ].filter(Boolean);
      setGenerationStatus(parts.length > 0 ? parts.join(", ") + ". Generating draft…" : "Generating draft…");

      if (data.warnings?.length) setWarnings(data.warnings);
      const newSources: Source[] = data.sources ?? [];
      setSources(newSources);
      onSourcesChange?.(newSources);
      setDraft(data.draft);
      onDraftChange(data.draft);
      setHasUnsavedChanges(false);
      clearAutosave();
      if (section.status === "pending" && data.draft?.trim()) {
        onStatusChange?.("draft");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsGenerating(false);
      setGenerationStatus(null);
    }
  };
```

- [ ] **Step 3: Add restore banner and URL status chips to JSX**

At the very top of the `return` JSX in `DraftPanel` (before the header row), add the restore banner:

```tsx
  return (
    <div className="space-y-3">
      {/* Autosave restore banner */}
      {showRestoreBanner && (
        <div className="flex items-center justify-between bg-zinc-800/60 border border-zinc-700 rounded-md px-3 py-2">
          <p className="text-xs text-zinc-300">
            A saved draft from {(() => {
              const saved = getAutosaved();
              if (!saved) return "earlier";
              const diff = Math.round((Date.now() - new Date(saved.savedAt).getTime()) / 60000);
              return diff < 60 ? `${diff} min ago` : new Date(saved.savedAt).toLocaleTimeString();
            })()} was found.
          </p>
          <div className="flex gap-2 ml-3">
            <button
              onClick={() => {
                const saved = getAutosaved();
                if (saved) { setDraft(saved.draft); setHasUnsavedChanges(true); }
                setShowRestoreBanner(false);
              }}
              className="text-xs text-blue-400 hover:text-blue-200"
            >
              Restore
            </button>
            <button
              onClick={() => { clearAutosave(); setShowRestoreBanner(false); }}
              className="text-xs text-zinc-500 hover:text-zinc-300"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
```

In the Reference URLs section, update the URL chip rendering to show color-coded status after generation. Replace the `{urls.length > 0 && (` block:

```tsx
              {urls.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {urls.map((url) => {
                    const fetchStatus = urlStatuses[url];
                    return (
                      <div
                        key={url}
                        className={cn(
                          "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs max-w-full border",
                          fetchStatus === "fetched"
                            ? "bg-green-950/30 border-green-800/50 text-green-300"
                            : fetchStatus === "fallback"
                            ? "bg-yellow-950/30 border-yellow-800/50 text-yellow-300"
                            : fetchStatus === "failed"
                            ? "bg-red-950/30 border-red-800/50 text-red-300"
                            : "bg-zinc-800 border-zinc-700 text-zinc-300"
                        )}
                      >
                        {fetchStatus === "fetched" && <span title="Fetched directly">✓</span>}
                        {fetchStatus === "fallback" && <span title="Retrieved via extract fallback">⟳</span>}
                        {fetchStatus === "failed" && <span title="Could not retrieve content">✗</span>}
                        <span className="truncate max-w-48">{url}</span>
                        {fetchStatus === "failed" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Clear the fetch status — chip returns to neutral, URL retried on next generation
                              setUrlStatuses((prev) => { const next = { ...prev }; delete next[url]; return next; });
                            }}
                            className="text-red-400 hover:text-red-200 ml-0.5 text-xs"
                            title="Retry fetch"
                          >
                            ↺
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); removeUrl(url); }}
                          className="text-zinc-500 hover:text-zinc-200 flex-shrink-0 ml-1"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
```

Add the pre-generation status message just above the `{error && ...}` block:

```tsx
      {/* Generation status message */}
      {generationStatus && (
        <div className="text-xs text-zinc-400 bg-zinc-800/40 border border-zinc-700 rounded-md p-3">
          {generationStatus}
        </div>
      )}
```

- [ ] **Step 4: Manual verification**

In the running dev server, open a section editor:
1. Add a URL and click "Generate with AI" — confirm the pre-generation message appears.
2. After generation, confirm URL chips turn green (fetched), amber (fallback), or red (failed).
3. On a red chip, confirm the ↺ retry button appears.
4. Edit the draft, wait 30 seconds, then reload the page — confirm the restore banner appears.
5. Click the browser back button with unsaved changes — confirm the "Leave page?" browser dialog appears.

- [ ] **Step 5: Commit**

```bash
git add src/components/features/section-editor/draft-panel.tsx src/hooks/use-autosave.ts
git commit -m "feat: URL status chips, generation status message, beforeunload warning, draft autosave"
```

---

## Task 8: WorkflowControls — auto-focus gate callback

**Files:**
- Modify: `src/components/features/section-editor/workflow-controls.tsx`

- [ ] **Step 1: Add `onRevisionGateHit` callback prop**

Replace the `WorkflowControlsProps` interface and the button logic inside the component:

```tsx
interface WorkflowControlsProps {
  section: ReportSection;
  onStatusChange: (newStatus: SectionStatus) => void;
  reviewerNotes: string;
  onRevisionGateHit?: () => void;
}
```

Update the function signature:
```tsx
export function WorkflowControls({ section, onStatusChange, reviewerNotes, onRevisionGateHit }: WorkflowControlsProps) {
```

Replace the button rendering block inside the `nextStatuses.map(...)`:

```tsx
          {nextStatuses.map((nextStatus) => {
            const label = STATUS_TRANSITION_LABELS[`${section.status}→${nextStatus}`] || STATUS_LABELS[nextStatus];
            const isRevisionGated = nextStatus === "revision_needed" && !reviewerNotes.trim();
            return (
              <div key={nextStatus}>
                <Button
                  variant={getButtonVariant(nextStatus)}
                  size="sm"
                  className="w-full justify-center"
                  onClick={() => {
                    if (isRevisionGated) {
                      onRevisionGateHit?.();
                    } else {
                      onStatusChange(nextStatus);
                    }
                  }}
                >
                  {label}
                </Button>
              </div>
            );
          })}
```

Note: the button is no longer `disabled` — it always fires a click. The gate triggers `onRevisionGateHit` instead of blocking silently.

- [ ] **Step 2: Commit**

```bash
git add src/components/features/section-editor/workflow-controls.tsx
git commit -m "feat: workflow controls call onRevisionGateHit instead of silently disabling revision button"
```

---

## Task 9: Section editor page — scroll-to-feedback, reviewer notes label, `onRevisionGateHit`, status log

**Files:**
- Modify: `src/app/sections/[id]/page.tsx`

- [ ] **Step 1: Add refs and scroll-to-feedback effect**

Replace the imports and top-of-component state in `src/app/sections/[id]/page.tsx`:

```tsx
// src/app/sections/[id]/page.tsx
"use client";

import { use, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useData } from "@/contexts/data-context";
import { DraftPanel } from "@/components/features/section-editor/draft-panel";
import { WorkflowControls } from "@/components/features/section-editor/workflow-controls";
import { RiskScoresPanel } from "@/components/features/section-editor/risk-scores-panel";
import { FreightTrendPanel } from "@/components/features/section-editor/freight-trend-panel";
import { SECTION_CHARTS } from "@/lib/data/chart-registry";
import { SectionStatus, STATUS_COLORS, STATUS_LABELS, Source, StatusLogEntry } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function SectionEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { getSectionById, updateSection, scorecards } = useData();
  const section = getSectionById(id);
  const [notes, setNotes] = useState(section?.notes ?? "");
  const ChartComponent = section ? SECTION_CHARTS[section.id] : undefined;

  // Refs for reviewer notes focus and scroll-to-feedback
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);

  // Scroll to reviewer feedback panel when section loads in revision_needed state
  useEffect(() => {
    if (section?.status === "revision_needed" && feedbackRef.current) {
      feedbackRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [section?.id]); // Only on initial load / section change
```

- [ ] **Step 2: Add `handleRevisionGateHit` and wire it to WorkflowControls**

After the existing handler functions (`handleStatusChange`, `handleDraftChange`, etc.), add:

```tsx
  const handleRevisionGateHit = () => {
    notesRef.current?.focus();
    notesRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };
```

Update the `<WorkflowControls>` JSX to pass the new prop:

```tsx
          <WorkflowControls
            section={section}
            onStatusChange={handleStatusChange}
            reviewerNotes={notes}
            onRevisionGateHit={handleRevisionGateHit}
          />
```

- [ ] **Step 3: Add `ref` to feedback panel and improve reviewer notes label**

Find the reviewer notes section and make two changes: (a) add `ref={feedbackRef}` to the orange revision feedback box, (b) update the `revision_needed` orange box to include the ref, and (c) update the reviewer notes label and placeholder for the `in_review` state:

Replace the entire reviewer notes block (currently lines 117–144 approximately):

```tsx
          {/* Reviewer Notes — hidden during pending and draft */}
          {section.status !== "pending" && section.status !== "draft" && (
            section.status === "revision_needed" ? (
              <div ref={feedbackRef} className="border border-orange-800 rounded-lg p-3 bg-orange-950/30">
                <p className="text-xs font-medium text-orange-400 mb-1.5">⚠ Reviewer Feedback</p>
                <p className="text-sm text-orange-200/90 whitespace-pre-wrap leading-relaxed">
                  {section.notes || "No specific feedback was provided."}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-zinc-300">
                  {section.status === "in_review"
                    ? `Feedback for ${section.assignedSme || "SME"} — describe what needs to change`
                    : "Reviewer Notes"}
                </h3>
                {section.status === "in_review" && !notes.trim() && (
                  <p className="text-xs text-zinc-500">Required if requesting revision — click "Request Revision" to be prompted.</p>
                )}
                <Textarea
                  ref={notesRef}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onBlur={handleNotesSave}
                  readOnly={section.status === "approved"}
                  placeholder="Describe what needs to change before this section can be approved..."
                  className={cn(
                    "min-h-24 bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 text-sm resize-y",
                    section.status === "approved" && "opacity-75 cursor-default"
                  )}
                />
              </div>
            )
          )}
```

Note: `Textarea` must accept a `ref`. If shadcn's `Textarea` doesn't forward refs, use a plain `<textarea>` with the same classes, or check `src/components/ui/textarea.tsx` and ensure it uses `React.forwardRef`.

- [ ] **Step 4: Add status log timeline to the sidebar**

In the sidebar div (after `<WorkflowControls />`), add the status history timeline:

```tsx
          {/* Status change log */}
          {section.statusHistory && section.statusHistory.length > 0 && (
            <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-900">
              <h3 className="text-xs font-medium text-zinc-400 mb-3 uppercase tracking-wide">History</h3>
              <ol className="space-y-2">
                {[...section.statusHistory].reverse().map((entry: StatusLogEntry, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-xs">
                    <span className="text-zinc-600 mt-0.5 flex-shrink-0">{entry.timestamp}</span>
                    <span className={cn(
                      "px-1.5 py-0.5 rounded-full flex-shrink-0",
                      entry.status === "approved" ? "bg-green-900/50 text-green-300" :
                      entry.status === "revision_needed" ? "bg-orange-900/50 text-orange-300" :
                      entry.status === "in_review" ? "bg-yellow-900/50 text-yellow-300" :
                      "bg-zinc-800 text-zinc-400"
                    )}>
                      {STATUS_LABELS[entry.status]}
                    </span>
                    {entry.note && (
                      <span className="text-zinc-500 line-clamp-1">{entry.note}</span>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          )}
```

- [ ] **Step 5: Check Textarea forwards refs**

Open `src/components/ui/textarea.tsx` and confirm it uses `React.forwardRef`. If not, update it to forward the ref. The shadcn textarea should already do this; if it doesn't, add `React.forwardRef`:

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
```

- [ ] **Step 6: Verify TypeScript compiles**

```bash
cd c:/Users/aurgecab/GPSC_Market_Intel_Updated_V1.0 && npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 7: Manual verification**

1. Open a section in `revision_needed` status — page should auto-scroll to the orange feedback box.
2. Open a section in `in_review` status, click "Request Revision" without adding notes — the notes textarea should receive focus.
3. Change a section status — verify the History log appears in the sidebar with timestamp and status badge.
4. Verify the reviewer notes label reads *"Feedback for [SME name] — describe what needs to change"* in `in_review`.

- [ ] **Step 8: Commit**

```bash
git add src/app/sections/[id]/page.tsx src/components/ui/textarea.tsx
git commit -m "feat: scroll-to-feedback on load, auto-focus notes gate, improved reviewer label, status history log"
```

---

## Task 10: Nav — Lifecycle status pill

**Files:**
- Modify: `src/components/features/nav/main-nav.tsx`

- [ ] **Step 1: Add the lifecycle pill to the nav**

Replace the entire file:

```tsx
// src/components/features/nav/main-nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useData } from "@/contexts/data-context";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/report", label: "Report View" },
  { href: "/admin", label: "Admin" },
];

export function MainNav() {
  const pathname = usePathname();
  const { reportMeta } = useData();

  return (
    <header className="border-b border-zinc-800 bg-zinc-950">
      <div className="mx-auto max-w-7xl px-6 flex items-center justify-between h-14">
        <div className="flex items-center gap-8">
          <span className="text-sm font-semibold text-zinc-100 tracking-wide">
            GPSC Market Intelligence
          </span>
          <nav className="flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm transition-colors",
                  pathname === link.href || (link.href === "/admin" && pathname.startsWith("/admin"))
                    ? "bg-zinc-800 text-zinc-100"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full border",
              reportMeta.published
                ? "bg-green-950/50 border-green-800/60 text-green-400"
                : "bg-amber-950/50 border-amber-800/60 text-amber-400"
            )}
          >
            {reportMeta.published ? "PUBLISHED" : "DRAFTING"}
          </span>
          <span className="text-xs text-zinc-500">{reportMeta.period} Report</span>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Manual verification**

Confirm the pill shows "DRAFTING" (amber) by default. Go to `/admin/settings`, toggle the report phase to Published and save — confirm the pill switches to "PUBLISHED" (green) immediately.

- [ ] **Step 3: Commit**

```bash
git add src/components/features/nav/main-nav.tsx
git commit -m "feat: add DRAFTING/PUBLISHED lifecycle status pill to nav"
```

---

## Task 11: Admin settings — Publish confirmation + stale summary badge

**Files:**
- Modify: `src/app/admin/settings/page.tsx`

- [ ] **Step 1: Add publish confirmation and stale summary indicator**

Replace the entire file:

```tsx
// src/app/admin/settings/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useData } from "@/contexts/data-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AdminSettingsPage() {
  const { sections, reportMeta, updateReportMeta, isSummaryLoading, isSummaryStale, regenerateSummary } = useData();
  const [title, setTitle] = useState(reportMeta.title);
  const [period, setPeriod] = useState(reportMeta.period);
  const [published, setPublished] = useState(reportMeta.published);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);

  const isDirty =
    title !== reportMeta.title ||
    period !== reportMeta.period ||
    published !== reportMeta.published;

  const incompleteSections = sections.filter((s) => s.status !== "approved");

  const handlePublishToggle = () => {
    const turningOn = !published;
    if (turningOn && incompleteSections.length > 0) {
      setShowPublishConfirm(true);
    } else {
      setPublished((v) => !v);
    }
  };

  // After save, isDirty becomes false and the button disables — no flash state needed
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateReportMeta({ title: title.trim(), period: period.trim(), published });
  };

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <div className="text-xs text-zinc-500 mb-1">
          <Link href="/admin" className="hover:text-zinc-300">Admin</Link>
          {" / "}Report Settings
        </div>
        <h1 className="text-xl font-semibold text-zinc-100">Report Settings</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Edit metadata shown across the dashboard, report view, and nav bar.
        </p>
      </div>

      {/* Publish confirmation modal */}
      {showPublishConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-sm w-full shadow-xl mx-4">
            <h2 className="text-sm font-semibold text-zinc-100 mb-2">Publish with incomplete sections?</h2>
            <p className="text-xs text-zinc-400 mb-3">
              {incompleteSections.length} section{incompleteSections.length !== 1 ? "s are" : " is"} not yet approved:
            </p>
            <ul className="space-y-1 mb-4 max-h-40 overflow-y-auto">
              {incompleteSections.map((s) => (
                <li key={s.id} className="text-xs text-zinc-400 flex items-center gap-2">
                  <span className={cn(
                    "px-1.5 py-0.5 rounded-full text-xs",
                    s.status === "revision_needed" ? "bg-orange-900/50 text-orange-300" :
                    s.status === "in_review" ? "bg-yellow-900/50 text-yellow-300" :
                    s.status === "draft" ? "bg-blue-900/50 text-blue-300" :
                    "bg-zinc-800 text-zinc-400"
                  )}>{s.status.replace("_", " ")}</span>
                  {s.title}
                </li>
              ))}
            </ul>
            <div className="flex gap-2 justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowPublishConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => { setPublished(true); setShowPublishConfirm(false); }}
              >
                Publish anyway
              </Button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label className="block text-xs text-zinc-400 mb-1.5">Report title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-zinc-500"
          />
          <p className="text-xs text-zinc-600 mt-1">
            Shown in the navigation bar and report page header.
          </p>
        </div>

        <div>
          <label className="block text-xs text-zinc-400 mb-1.5">Report period</label>
          <input
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            placeholder="e.g. Q2 2026"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-zinc-500"
          />
          <p className="text-xs text-zinc-600 mt-1">
            Shown in the dashboard subtitle and report page.
          </p>
        </div>

        {/* Report Phase toggle */}
        <div className="space-y-2">
          <label className="block text-xs text-zinc-400">Report phase</label>
          <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3">
            <div>
              <p className="text-sm font-medium text-zinc-300">
                {published ? "Published" : "Drafting"}
              </p>
              <p className="text-xs text-zinc-600">
                {published
                  ? "Report is live — executive summary auto-updates when sections are approved"
                  : "Report is in drafting phase — summary will not auto-update"}
              </p>
            </div>
            <button
              type="button"
              onClick={handlePublishToggle}
              className={cn(
                "relative w-11 h-6 rounded-full transition-colors flex-shrink-0",
                published ? "bg-blue-500" : "bg-zinc-700"
              )}
            >
              <span
                className={cn(
                  "absolute top-1 left-0 w-4 h-4 rounded-full bg-white shadow transition-transform",
                  published ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={!isDirty}
            className="px-4 py-2 text-sm bg-zinc-100 text-zinc-900 font-medium rounded-md hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save changes
          </button>
          {saved && (
            <span className="text-xs text-green-400">Saved</span>
          )}
        </div>
      </form>

      {/* Executive Summary */}
      <div className="mt-8 space-y-3 pt-6 border-t border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-zinc-200">Executive Summary</h3>
            {isSummaryStale && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-950/50 border border-amber-800/60 text-amber-400">
                Outdated
              </span>
            )}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={regenerateSummary}
            disabled={isSummaryLoading}
          >
            {isSummaryLoading ? "Generating..." : "Regenerate Summary"}
          </Button>
        </div>
        <p className="text-xs text-zinc-600">
          AI-generated summary of all approved sections.{" "}
          {reportMeta.summaryUpdatedAt
            ? `Last updated ${new Date(reportMeta.summaryUpdatedAt).toLocaleString()}.`
            : "Not yet generated."}
        </p>
        {isSummaryStale && (
          <p className="text-xs text-amber-500/80">
            One or more sections were approved after this summary was last generated. Regenerate to reflect the latest content.
          </p>
        )}
        {reportMeta.executiveSummary ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-xs text-zinc-400 whitespace-pre-wrap leading-relaxed">
            {reportMeta.executiveSummary}
          </div>
        ) : (
          <p className="text-xs text-zinc-600 italic">
            No summary yet — click &quot;Regenerate Summary&quot; to generate one.
          </p>
        )}
      </div>

      <div className="mt-8 border-t border-zinc-800 pt-6">
        <p className="text-xs text-zinc-500">
          <strong className="text-zinc-400">Note:</strong> All data is held in memory and resets on page refresh (Phase 1 prototype). Database persistence will be added in Phase 2.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Manual verification**

1. Toggle from Drafting → Published with unapproved sections — confirm the confirmation modal appears listing them by name.
2. Click "Publish anyway" — confirm the toggle activates.
3. Approve a section while the summary exists — go to `/admin/settings` and confirm the amber "Outdated" badge appears next to "Executive Summary".
4. Click "Regenerate Summary" — confirm the badge disappears after regeneration.

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/settings/page.tsx
git commit -m "feat: publish confirmation dialog, stale summary badge on settings page"
```

---

## Self-Review

**Spec coverage check:**
- ✅ "My Sections" filter (Task 3)
- ✅ Revision feedback snippet on dashboard cards (Task 4)
- ✅ `revision_needed` sorted first — already implemented in current code (`STATUS_PRIORITY` revision_needed: 0)
- ✅ URL status chips (Tasks 5 + 7)
- ✅ Sources-loaded pre-generation message (Task 7)
- ✅ Inline retry on failed URLs (Task 7)
- ✅ `beforeunload` warning (Task 7)
- ✅ Draft autosave + restore banner (Tasks 6 + 7)
- ✅ Auto-focus reviewer notes on revision gate (Tasks 8 + 9)
- ✅ Scroll-to-feedback on page load (Task 9)
- ✅ Reviewer prompt text improvement (Task 9)
- ✅ Status change log timeline (Tasks 1 + 2 + 9)
- ✅ Stale summary badge (Tasks 1 + 2 + 11)
- ✅ Lifecycle status pill in nav (Task 10)
- ✅ Publish confirmation with incomplete section list (Task 11)

**One-click regenerate from report page** (spec item) is not included in this plan — it belongs to the consumer-facing report improvements, not the internal SME plan.

**Type consistency check:** `StatusLogEntry` defined in Task 1, imported in Tasks 2 and 9. `UrlFetchStatus` type defined and used only within `draft-panel.tsx`. `isSummaryStale` defined in Task 2, consumed in Task 11 — both use the same identifier. No mismatches found.
