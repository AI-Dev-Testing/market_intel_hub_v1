# Pre-Database Polish — Design Spec
**Date:** 2026-04-01
**Status:** Approved
**Scope:** Six high-ROI improvements to the GPSC Market Intelligence prototype before Phase 2 (Supabase database + auth) begins.

---

## Context

The Phase 1 prototype is functionally complete and ready for team-wide trial with 6+ users. Two goals drive this spec:

1. **Polish the prototype** so the team can trial it confidently and the report output looks like a real intelligence publication.
2. **Reduce Phase 2 rework risk** by making changes that are easy now but harder to retrofit once a database schema is locked in.

Implementation follows Option A sequencing: highest-impact / highest-clarity items first, polish items second, tooling items last.

---

## Step 1 — Markdown Rendering

### Problem
AI models output markdown natively. Section drafts contain `**bold**`, `## headings`, bullet lists, and tables. These render as raw symbols in both the section editor preview and the `/report` page, making all draft content look unpolished.

### Solution
Add a shared `<MarkdownContent>` component using `react-markdown` + `remark-gfm`. Apply Tailwind Typography (`@tailwindcss/typography`) for base prose styling, with dark-mode overrides to match the zinc design system. The draft *textarea* remains plain text for editing — only the preview renders markdown.

### Files
| File | Change |
|---|---|
| `src/components/ui/markdown-content.tsx` | **New** — shared renderer, dark-mode prose styles |
| `src/components/features/section-editor/draft-panel.tsx` | Replace preview pane plain text with `<MarkdownContent>` |
| `src/app/report/page.tsx` | Replace `whitespace-pre-wrap` `<p>` with `<MarkdownContent>` |
| `package.json` | Add `react-markdown`, `remark-gfm`, `@tailwindcss/typography` |
| `tailwind.config.ts` | Register typography plugin |

### Details
- `<MarkdownContent>` accepts a `content: string` prop and `className?: string`
- Tables get `overflow-x-auto` wrapper to prevent overflow in narrow columns
- Blockquotes render with a left accent border — gives SMEs a pull-quote pattern
- Empty/whitespace-only content renders nothing (no empty `<p>` nodes)

---

## Step 2 — JSON State Export / Import

### Problem
The app resets on every page refresh. With 6+ people trialling it simultaneously, there is no way to share a common starting point. One person can set up a realistic report with real GPSC content; the next person opens the app and sees seed data.

As a secondary benefit: the export format validates the full data shape against real content *before* the Supabase schema is designed — catching missing, redundant, or misnamed fields in Phase 1 rather than after migrations are written.

### Solution
An Export button downloads the full app state as a timestamped `.json` file. An Import button restores state from a file, with a confirmation modal to prevent accidental overwrites.

### What is exported
- `sections` — all section records including drafts, notes, status history, sources, image URLs
- `categoryTree` — full L0/L1/L2 hierarchy
- `smeList` — team roster
- `reportMeta` — title, period, published flag, executive summary, summaryUpdatedAt
- `promptConfig` — universal prompt + version history + per-section overrides

**Not exported:** `scorecards`, `freightTrends` — these are visual overlays derived from hardcoded registries, not user-authored content.

### Files
| File | Change |
|---|---|
| `src/app/admin/settings/page.tsx` | Add Export and Import buttons + import confirmation modal |
| `src/contexts/data-context.tsx` | Add `importState(data: ExportedState)` action that batch-sets all slices |
| `src/types/index.ts` | Add `ExportedState` type (union of all exported slices) |

### Details
- **Export:** `JSON.stringify({ sections, categoryTree, smeList, reportMeta, promptConfig })` → `Blob` → browser download as `gpsc-report-<YYYY-MM-DD>.json`
- **Import:** `<input type="file" accept=".json">`, reads file, parses JSON, validates required top-level keys (`sections`, `categoryTree`, `smeList`, `reportMeta`, `promptConfig`), shows confirmation modal before calling `importState()`
- **Validation:** If required keys are missing, show an error toast: *"Invalid export file — missing required fields."*
- **Confirmation modal text:** *"This will replace all current report data including sections, categories, and settings. This cannot be undone. Continue?"*

---

## Step 3 — Report Typography Polish

### Problem
The `/report` page has the right structure but lacks the visual language of a polished intelligence publication. Category headers blend into sections, section attribution reads as raw text, and long-form content has no visual hierarchy cues.

### Depends on
Step 1 (markdown rendering in place — tables and blockquotes already styled).

### Changes

**Category headers:** Add a 2px left accent border (zinc-600) and increase type weight. L0 category headers should landmark the page when scanning quickly.

**Section byline:** Replace the raw `— John Chen · 2026-03-20` text with a structured attribution component: avatar-initial circle + name + separator dot + date. Muted but visually intentional.

**Section spacing:** Increase gap between section cards from `space-y-6` to `space-y-8` on the content column, giving each section more breathing room.

**Pull-quote / callout:** Blockquotes in markdown (`> text`) render with a zinc-600 left bar, slightly larger text, and italic weight — giving SMEs a lightweight way to surface key takeaways.

**Table dark-mode styling:** Override typography plugin table defaults for dark backgrounds — zebra striping using zinc-900/zinc-800 alternating rows, zinc-700 borders.

### Files
| File | Change |
|---|---|
| `src/components/ui/markdown-content.tsx` | Table dark-mode overrides, blockquote styling |
| `src/app/report/page.tsx` | Category header accent, byline component, spacing |

---

## Step 4 — Section Image Admin UI

### Problem
Banner images are hardcoded in `src/lib/data/section-images.ts`. Assigning an image to a section requires editing TypeScript source. No team member without code access can improve the visual quality of the report.

### Solution
Add an `imageUrl` field to `ReportSection`. Expose a URL input in the section editor sidebar. On `/report`, prefer `section.imageUrl` over the hardcoded registry (registry kept for backwards compatibility, removed in Phase 2 when Supabase Storage takes over).

### Files
| File | Change |
|---|---|
| `src/types/index.ts` | Add `imageUrl?: string` to `ReportSection` |
| `src/app/sections/[id]/page.tsx` | Add "Banner Image" URL input in sidebar, with thumbnail preview and validation |
| `src/app/report/page.tsx` | Check `section.imageUrl` before `SECTION_IMAGES[section.id]` |

### Details
- **Input:** Labelled text input in the section editor sidebar below "SME" and "Status" metadata
- **Preview:** On successful URL load, show a 64px tall thumbnail inline below the input
- **Validation:** On blur, attempt to load URL in hidden `<img>` — `onError` shows red border + *"Image could not be loaded — check the URL."*
- **Persistence:** Saved via existing `updateSection(id, { imageUrl })` — no context changes needed
- No file upload in Phase 1 — URL only. Supabase Storage upload added in Phase 2.

---

## Step 5 — Prompt Test Panel

### Problem
The only way to validate a prompt change is to run it on a live section, risking overwriting real work. There is no safe sandbox for iterating on prompts before committing them.

### Solution
A collapsible "Test this prompt" panel at the bottom of `/admin/prompts`. Select any approved section, click Run — the current (unsaved) prompt text is sent to `/api/generate-draft`, and the output appears in a read-only side-by-side pane next to the section's current draft. Nothing is saved.

### Files
| File | Change |
|---|---|
| `src/app/admin/prompts/page.tsx` | Add test panel: section picker, Run button, side-by-side preview |

### Details
- **Section picker:** Dropdown showing only approved sections (title + category). Defaults to the first approved section.
- **Prompt used:** Whatever is currently typed in the prompt editor inputs — not the last-saved version. Makes it possible to test edits before committing.
- **Runs against:** `/api/generate-draft` with `{ title, category, subcategory }` from the selected section plus the test prompt overriding the universal prompt
- **Output:** Read-only textarea or markdown preview (if Step 1 complete). Labelled *"Test output — not saved"*.
- **No web search / references:** Test runs use only the prompt and section metadata — no Tavily calls, no reference URLs. This keeps test runs fast and free.
- **Loading state:** Button shows "Running..." with spinner. Errors surface inline below the panel.

---

## Step 6 — "Your Queue" Summary Bar

### Problem
When an SME selects their name filter on the dashboard, they see a filtered grid — but there is no clear signal of what specifically needs their attention *right now*. They still have to scan the full grid to find actionable sections.

### Solution
When an SME filter is active, show a compact summary banner between the SME chip filter and the StatsBar: *"2 sections need your attention: 1 revision needed, 1 pending draft."* Each count is clickable and applies the corresponding status filter.

### Files
| File | Change |
|---|---|
| `src/app/dashboard/page.tsx` | Add queue summary banner (shown only when `selectedSme` is set) |

### Details
- **Actionable states:** `revision_needed` (highest urgency) and `pending` (needs a first draft). `draft` and `in_review` are not surfaced — those are in-progress, not blocked.
- **Copy pattern:** *"X section[s] need[s] your attention"* with individual counts linked to status filter. If nothing is actionable: show nothing (no "you're all caught up" message — keep the UI quiet).
- **Placement:** Between the SME chip row and the StatsBar — visible without scrolling.
- **No new state** — purely derived from `smeFilteredSections`.

---

## Implementation Order

1. Step 1 — Markdown Rendering (unlocks Step 3 polish)
2. Step 2 — JSON Export / Import (enables real-content team trial)
3. Step 3 — Report Typography Polish (builds on Step 1)
4. Step 4 — Section Image Admin UI (low dependency, can slot in anywhere after Step 2)
5. Step 5 — Prompt Test Panel (content quality tooling)
6. Step 6 — Queue Summary Bar (dashboard usability, standalone)

---

## Out of Scope (Phase 2)

- File upload for section images (requires Supabase Storage)
- Server-side draft snapshot persistence (replaces localStorage autosave)
- Generation logs database table
- Role-based access control
- Token-gated external shareable links
