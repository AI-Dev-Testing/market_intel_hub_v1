# Pre-Database Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Six sequential improvements to make the GPSC Market Intelligence prototype production-ready for 6+ person team trial before Phase 2 (Supabase database + auth).

**Architecture:** All changes are in-memory prototype scope — no new API routes except where noted (prompt test reuses `/api/generate-draft`). Steps 1–3 build on each other; Steps 4–6 are independent.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, shadcn/ui, `react-markdown`, `remark-gfm`, `@tailwindcss/typography`

> **Tailwind v4 note:** This project uses Tailwind v4. There is NO `tailwind.config.ts`. Plugins are registered with `@plugin "..."` in `src/app/globals.css`. Do NOT create a `tailwind.config.ts`.

---

## File Map

| File | Tasks | Purpose |
|---|---|---|
| `src/components/ui/markdown-content.tsx` | 1 | New shared markdown renderer |
| `src/app/globals.css` | 1 | Add `@plugin "@tailwindcss/typography"` |
| `src/components/features/section-editor/draft-panel.tsx` | 1 | Swap preview pane to `<MarkdownContent>` |
| `src/app/report/page.tsx` | 1, 3, 4 | Markdown render + typography polish + imageUrl fallback |
| `src/types/index.ts` | 2, 4 | Add `ExportedState` type + `imageUrl` on `ReportSection` |
| `src/contexts/data-context.tsx` | 2 | Add `importState()` action + expose in context value |
| `src/app/admin/settings/page.tsx` | 2 | Export/Import UI + confirmation modal |
| `src/app/sections/[id]/page.tsx` | 4 | Banner image URL input in sidebar |
| `src/app/admin/prompts/page.tsx` | 5 | Prompt test panel |
| `src/app/dashboard/page.tsx` | 6 | Queue summary banner |

---

## Task 1: Markdown Rendering

**Files:**
- Create: `src/components/ui/markdown-content.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/components/features/section-editor/draft-panel.tsx`
- Modify: `src/app/report/page.tsx`

- [ ] **Step 1.1: Install dependencies**

```bash
npm install react-markdown remark-gfm @tailwindcss/typography
```

Expected: packages added to `node_modules`, `package.json` updated with three new entries under `dependencies`.

- [ ] **Step 1.2: Register the typography plugin in globals.css**

Open `src/app/globals.css`. Add this line immediately after the existing `@import` lines (before the `@custom-variant` line):

```css
@plugin "@tailwindcss/typography";
```

The top of the file should now read:
```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
@plugin "@tailwindcss/typography";

@custom-variant dark (&:is(.dark *));
```

- [ ] **Step 1.3: Create the MarkdownContent component**

Create `src/components/ui/markdown-content.tsx`:

```tsx
// src/components/ui/markdown-content.tsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  if (!content.trim()) return null;

  return (
    <div
      className={cn(
        "prose prose-sm max-w-none",
        // Dark mode overrides — zinc palette
        "prose-invert",
        "prose-p:text-zinc-300 prose-p:leading-relaxed",
        "prose-headings:text-zinc-200 prose-headings:font-semibold",
        "prose-strong:text-zinc-200",
        "prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline",
        "prose-code:text-zinc-300 prose-code:bg-zinc-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:before:content-none prose-code:after:content-none",
        "prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800",
        "prose-blockquote:border-l-zinc-600 prose-blockquote:text-zinc-400 prose-blockquote:italic prose-blockquote:not-italic",
        "prose-li:text-zinc-300 prose-li:marker:text-zinc-600",
        "prose-hr:border-zinc-800",
        // Table dark mode
        "prose-table:text-zinc-300",
        "prose-thead:border-zinc-700",
        "prose-th:text-zinc-200 prose-th:border-zinc-700",
        "prose-td:border-zinc-800",
        className
      )}
    >
      <div className="overflow-x-auto">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
```

- [ ] **Step 1.4: Replace the preview in DraftPanel**

In `src/components/features/section-editor/draft-panel.tsx`, find the import block at the top and add:

```tsx
import { MarkdownContent } from "@/components/ui/markdown-content";
```

Then find the section that renders the draft preview. It will contain a `<p>` or similar element with `whitespace-pre-wrap` and the `draft` value. Replace it with:

```tsx
<MarkdownContent content={draft} className="text-sm" />
```

> **Hint:** Look for the tab panel that shows the draft content in read-only/preview state (not the textarea for editing). It is the view shown when the user is not actively editing.

- [ ] **Step 1.5: Replace the plain text render in the report page**

In `src/app/report/page.tsx`, add the import near the top with other imports:

```tsx
import { MarkdownContent } from "@/components/ui/markdown-content";
```

Find this line (around line 337 in the original):
```tsx
<p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
  {section.draft}
</p>
```

Replace with:
```tsx
<MarkdownContent content={section.draft} className="text-sm" />
```

- [ ] **Step 1.6: Verify it builds cleanly**

```bash
npx tsc --noEmit
```

Expected: no output (zero errors).

- [ ] **Step 1.7: Commit**

```bash
git add src/components/ui/markdown-content.tsx src/app/globals.css src/components/features/section-editor/draft-panel.tsx src/app/report/page.tsx package.json package-lock.json
git commit -m "feat: add MarkdownContent component, render markdown in editor preview and report"
```

---

## Task 2: JSON State Export / Import

**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/contexts/data-context.tsx`
- Modify: `src/app/admin/settings/page.tsx`

- [ ] **Step 2.1: Add ExportedState type**

In `src/types/index.ts`, add the following before the `DataContextValue` interface:

```ts
export interface ExportedState {
  sections: ReportSection[];
  categoryTree: CategoryNode[];
  smeList: string[];
  reportMeta: ReportMeta;
  promptConfig: PromptConfig;
}
```

Also add `importState` to `DataContextValue`:

```ts
// Inside DataContextValue interface, after regenerateSummary:
importState: (data: ExportedState) => void;
```

- [ ] **Step 2.2: Implement importState in DataContext**

In `src/contexts/data-context.tsx`, add the import for `ExportedState` in the types import:

```ts
import {
  // ... existing imports ...
  ExportedState,
} from "@/types";
```

Add the `importState` function inside `DataProvider`, after the `updateReportMeta` function:

```ts
const importState = (data: ExportedState) => {
  setSections(data.sections);
  setCategoryTree(data.categoryTree);
  setSmeList(data.smeList);
  setReportMeta(data.reportMeta);
  setPromptConfig(data.promptConfig);
};
```

Add `importState` to the context provider value object:

```ts
// In the DataContext.Provider value prop, after regenerateSummary:
importState,
```

- [ ] **Step 2.3: Add Export/Import UI to admin settings**

In `src/app/admin/settings/page.tsx`, add these imports at the top:

```tsx
import { useRef, useState } from "react";  // useRef is new; useState already imported
import { ExportedState } from "@/types";
```

Update the `useData` destructure to include `importState`:

```tsx
const { sections, reportMeta, updateReportMeta, isSummaryLoading, isSummaryStale, regenerateSummary, importState,
        categoryTree, smeList, promptConfig } = useData();
```

Add new state variables after the existing ones:

```tsx
const [showImportConfirm, setShowImportConfirm] = useState(false);
const [pendingImport, setPendingImport] = useState<ExportedState | null>(null);
const [importError, setImportError] = useState<string | null>(null);
const fileInputRef = useRef<HTMLInputElement>(null);
```

Add the export handler:

```tsx
const handleExport = () => {
  const data: ExportedState = { sections, categoryTree, smeList, reportMeta, promptConfig };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `gpsc-report-${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
```

Add the import handler:

```tsx
const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
  setImportError(null);
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const parsed = JSON.parse(ev.target?.result as string);
      const required = ["sections", "categoryTree", "smeList", "reportMeta", "promptConfig"];
      const missing = required.filter((k) => !(k in parsed));
      if (missing.length > 0) {
        setImportError(`Invalid export file — missing required fields: ${missing.join(", ")}`);
        return;
      }
      setPendingImport(parsed as ExportedState);
      setShowImportConfirm(true);
    } catch {
      setImportError("Could not parse file — make sure it is a valid GPSC export.");
    }
  };
  reader.readAsText(file);
  // Reset input so the same file can be re-selected
  e.target.value = "";
};

const handleConfirmImport = () => {
  if (pendingImport) {
    importState(pendingImport);
    setPendingImport(null);
  }
  setShowImportConfirm(false);
};
```

Add the import confirmation modal JSX inside the `return`, immediately after the existing publish confirmation modal:

```tsx
{/* Import confirmation modal */}
{showImportConfirm && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-sm w-full shadow-xl mx-4">
      <h2 className="text-sm font-semibold text-zinc-100 mb-2">Replace all report data?</h2>
      <p className="text-xs text-zinc-400 mb-4">
        This will replace all current report data including sections, categories, and settings. This cannot be undone.
      </p>
      <div className="flex gap-2 justify-end">
        <Button size="sm" variant="outline" onClick={() => setShowImportConfirm(false)}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleConfirmImport}>
          Continue
        </Button>
      </div>
    </div>
  </div>
)}
```

Add a new Export/Import section to the settings form, placed after the existing Save button row (before the Executive Summary section):

```tsx
{/* Export / Import */}
<div className="mt-8 pt-6 border-t border-zinc-800 space-y-3">
  <div>
    <h3 className="text-sm font-medium text-zinc-200">Export / Import</h3>
    <p className="text-xs text-zinc-500 mt-1">
      Share a snapshot of all report data with your team, or restore from a previous export.
    </p>
  </div>
  <div className="flex items-center gap-3 flex-wrap">
    <Button size="sm" variant="outline" onClick={handleExport}>
      Export state
    </Button>
    <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
      Import state
    </Button>
    <input
      ref={fileInputRef}
      type="file"
      accept=".json"
      className="hidden"
      onChange={handleImportFile}
    />
  </div>
  {importError && (
    <p className="text-xs text-red-400">{importError}</p>
  )}
</div>
```

- [ ] **Step 2.4: Type check**

```bash
npx tsc --noEmit
```

Expected: no output.

- [ ] **Step 2.5: Commit**

```bash
git add src/types/index.ts src/contexts/data-context.tsx src/app/admin/settings/page.tsx
git commit -m "feat: JSON state export and import in admin settings"
```

---

## Task 3: Report Typography Polish

**Files:**
- Modify: `src/components/ui/markdown-content.tsx`
- Modify: `src/app/report/page.tsx`

> Depends on Task 1 being complete.

- [ ] **Step 3.1: Add blockquote pull-quote styling to MarkdownContent**

In `src/components/ui/markdown-content.tsx`, update the `prose-blockquote` classes to give blockquotes a pull-quote treatment. Replace the current `prose-blockquote:*` lines with:

```tsx
"prose-blockquote:border-l-2 prose-blockquote:border-zinc-600 prose-blockquote:pl-4 prose-blockquote:text-zinc-300 prose-blockquote:text-base prose-blockquote:not-italic prose-blockquote:font-normal",
```

- [ ] **Step 3.2: Polish category headers in the report**

In `src/app/report/page.tsx`, find the category header `<h2>` element inside the `visibleCategories.map(...)`. It currently looks like:

```tsx
<h2 className="text-base font-semibold text-zinc-200">{category}</h2>
```

Replace the wrapping `<div>` and `<h2>` with:

```tsx
<div className="flex items-center justify-between pb-3 mb-5 border-b border-zinc-800">
  <div className="flex items-center gap-3">
    <div className="w-0.5 h-5 bg-zinc-600 rounded-full flex-shrink-0" />
    <h2 className="text-base font-semibold text-zinc-100 tracking-tight">{category}</h2>
  </div>
  {hasToggle && (
    // ... existing toggle button, unchanged ...
  )}
</div>
```

- [ ] **Step 3.3: Polish section byline**

In `src/app/report/page.tsx`, find the byline line (currently near the bottom of each section card body):

```tsx
<p className="text-xs text-zinc-600 mt-4">
  — {section.assignedSme || "Unassigned"} · {section.lastUpdated}
</p>
```

Replace with a structured byline component:

```tsx
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
```

- [ ] **Step 3.4: Increase section spacing**

In `src/app/report/page.tsx`, find:

```tsx
<div className="space-y-6">
```

inside the `sectionsToRender.map(...)` wrapper. Change to:

```tsx
<div className="space-y-8">
```

- [ ] **Step 3.5: Type check and commit**

```bash
npx tsc --noEmit
git add src/components/ui/markdown-content.tsx src/app/report/page.tsx
git commit -m "feat: report typography polish — category headers, byline, spacing, blockquote callout"
```

---

## Task 4: Section Image Admin UI

**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/app/sections/[id]/page.tsx`
- Modify: `src/app/report/page.tsx`

- [ ] **Step 4.1: Add imageUrl to ReportSection type**

In `src/types/index.ts`, add `imageUrl` to the `ReportSection` interface:

```ts
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
  statusHistory?: StatusLogEntry[];
  imageUrl?: string;           // ← add this line
}
```

- [ ] **Step 4.2: Add image URL input to section editor sidebar**

In `src/app/sections/[id]/page.tsx`, add local state for image URL management after the existing `useState` declarations (around line 22):

```tsx
const [imageUrl, setImageUrl] = useState(section?.imageUrl ?? "");
const [imageError, setImageError] = useState(false);
```

Add the save handler alongside the existing `handleNotesSave`:

```tsx
const handleImageUrlSave = () => {
  updateSection(id, { imageUrl: imageUrl.trim() || undefined });
  setImageError(false);
};
```

In the sidebar (the `<div className="space-y-4">` on the right column), add the image URL panel after the `WorkflowControls` component and before the status history section:

```tsx
{/* Banner Image */}
<div className="border border-zinc-800 rounded-lg p-4 bg-zinc-900 space-y-2">
  <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Banner Image</h3>
  <input
    type="text"
    value={imageUrl}
    onChange={(e) => { setImageUrl(e.target.value); setImageError(false); }}
    onBlur={handleImageUrlSave}
    placeholder="https://example.com/image.jpg"
    className={cn(
      "w-full bg-zinc-950 border rounded-md px-2.5 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-zinc-500",
      imageError ? "border-red-700" : "border-zinc-700"
    )}
  />
  {imageError && (
    <p className="text-xs text-red-400">Image could not be loaded — check the URL.</p>
  )}
  {imageUrl.trim() && !imageError && (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageUrl}
      alt=""
      className="w-full h-16 object-cover rounded border border-zinc-800"
      onError={() => setImageError(true)}
    />
  )}
</div>
```

- [ ] **Step 4.3: Use imageUrl in the report page with registry fallback**

In `src/app/report/page.tsx`, find the line that reads the image URL for a section:

```tsx
const imageUrl = SECTION_IMAGES[section.id];
```

Replace with:

```tsx
const imageUrl = section.imageUrl || SECTION_IMAGES[section.id];
```

- [ ] **Step 4.4: Type check and commit**

```bash
npx tsc --noEmit
git add src/types/index.ts src/app/sections/[id]/page.tsx src/app/report/page.tsx
git commit -m "feat: section banner image URL field in editor sidebar"
```

---

## Task 5: Prompt Test Panel

**Files:**
- Modify: `src/app/admin/prompts/page.tsx`

- [ ] **Step 5.1: Add test panel state and handlers**

In `src/app/admin/prompts/page.tsx`, the `PromptsAdminPage` component already destructures `sections` from `useData()`.

Add new state after the existing state declarations:

```tsx
// Test panel state
const [testSectionId, setTestSectionId] = useState<string>("");
const [testOutput, setTestOutput] = useState<string | null>(null);
const [isTesting, setIsTesting] = useState(false);
const [testError, setTestError] = useState<string | null>(null);
const [showTestPanel, setShowTestPanel] = useState(false);
```

Add a derived list of approved sections for the picker:

```tsx
const approvedSections = sections.filter((s) => s.status === "approved");
// Default to first approved section when panel opens
```

Add the test handler:

```tsx
const handleTestPrompt = async () => {
  const section = sections.find((s) => s.id === testSectionId);
  if (!section) return;
  setIsTesting(true);
  setTestOutput(null);
  setTestError(null);
  try {
    const res = await fetch("/api/generate-draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sectionTitle: section.title,
        category: section.category,
        subcategory: section.subcategory,
        systemPrompt: systemPrompt.trim() || undefined,
        userPromptTemplate: userPromptTemplate.trim() || undefined,
        useWebSearch: false,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Generation failed");
    setTestOutput(data.draft ?? "");
  } catch (err) {
    setTestError(err instanceof Error ? err.message : "Unknown error");
  } finally {
    setIsTesting(false);
  }
};
```

- [ ] **Step 5.2: Add test panel JSX**

In `src/app/admin/prompts/page.tsx`, also add:

```tsx
import { MarkdownContent } from "@/components/ui/markdown-content";
```

At the very bottom of the page `return`, before the closing `</div>`, add the test panel section:

```tsx
{/* Prompt Test Panel */}
<div className="mt-8 pt-6 border-t border-zinc-800">
  <button
    onClick={() => {
      setShowTestPanel((v) => !v);
      if (!testSectionId && approvedSections.length > 0) {
        setTestSectionId(approvedSections[0].id);
      }
    }}
    className="flex items-center gap-2 text-sm font-medium text-zinc-300 hover:text-zinc-100 transition-colors"
  >
    <span>{showTestPanel ? "▾" : "▸"}</span>
    Test this prompt
  </button>
  <p className="text-xs text-zinc-600 mt-1">
    Run the current (unsaved) prompt against any approved section without saving anything.
  </p>

  {showTestPanel && (
    <div className="mt-4 space-y-4">
      <div className="flex items-end gap-3 flex-wrap">
        <div className="flex-1 min-w-48">
          <label className="block text-xs text-zinc-400 mb-1.5">Test against section</label>
          <select
            value={testSectionId}
            onChange={(e) => { setTestSectionId(e.target.value); setTestOutput(null); }}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-2.5 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500"
          >
            {approvedSections.length === 0 && (
              <option value="">No approved sections</option>
            )}
            {approvedSections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} ({s.category})
              </option>
            ))}
          </select>
        </div>
        <Button
          size="sm"
          onClick={handleTestPrompt}
          disabled={isTesting || !testSectionId}
        >
          {isTesting ? "Running…" : "Run test"}
        </Button>
      </div>

      {testError && (
        <p className="text-xs text-red-400">{testError}</p>
      )}

      {testOutput !== null && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Current draft</p>
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 max-h-96 overflow-y-auto">
              <MarkdownContent content={sections.find((s) => s.id === testSectionId)?.draft ?? ""} className="text-xs" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-amber-600 uppercase tracking-wide">Test output — not saved</p>
            <div className="rounded-lg border border-amber-900/50 bg-zinc-950 p-4 max-h-96 overflow-y-auto">
              <MarkdownContent content={testOutput} className="text-xs" />
            </div>
          </div>
        </div>
      )}
    </div>
  )}
</div>
```

- [ ] **Step 5.3: Type check and commit**

```bash
npx tsc --noEmit
git add src/app/admin/prompts/page.tsx
git commit -m "feat: prompt test panel — safe side-by-side preview without saving"
```

---

## Task 6: "Your Queue" Summary Bar

**Files:**
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Step 6.1: Add queue summary banner**

In `src/app/dashboard/page.tsx`, add a derived count computation after the `smeFilteredSections` definition (around line 43):

```tsx
const queueRevisionCount = smeFilteredSections.filter((s) => s.status === "revision_needed").length;
const queuePendingCount = smeFilteredSections.filter((s) => s.status === "pending").length;
const queueTotal = queueRevisionCount + queuePendingCount;
```

Add the banner JSX between the SME filter chips block and the `<StatsBar>` component. Locate the closing `</div>` of the `{/* My Sections filter */}` block (around line 92) and insert after it:

```tsx
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
```

- [ ] **Step 6.2: Type check and commit**

```bash
npx tsc --noEmit
git add src/app/dashboard/page.tsx
git commit -m "feat: queue summary bar on dashboard when SME filter is active"
```

---

## Self-Review Notes

- **Tailwind v4:** `@plugin "@tailwindcss/typography"` in `globals.css` — no `tailwind.config.ts` created or referenced anywhere in this plan. ✓
- **Task 1 → Task 3 dependency:** Task 3 Step 3.1 modifies `markdown-content.tsx` which is created in Task 1. Task 3 must run after Task 1. ✓
- **Task 5 imports MarkdownContent** (created in Task 1). Task 5 must run after Task 1. ✓
- **ExportedState type** defined in Task 2 Step 2.1, used in Task 2 Steps 2.2 and 2.3. ✓
- **imageUrl** added to `ReportSection` in Task 4 Step 4.1, read in Task 4 Steps 4.2 and 4.3. ✓
- **`importState`** added to `DataContextValue` in Task 2 Step 2.1 and implemented in Step 2.2 before being used in Step 2.3. ✓
- **generate-draft API** body field is `sectionTitle` (not `title`) — confirmed from reading the route. Task 5 uses `sectionTitle: section.title`. ✓
- **No placeholder steps** — every step has concrete code. ✓
