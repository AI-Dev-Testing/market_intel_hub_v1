# GPSC Market Intelligence Report

Internal collaborative web application for GPSC Market Intelligence report production. SMEs collaborate on intelligence collection across defined report sections, with AI-assisted drafting and a structured review/approval workflow.

**Phase 1 Prototype** — in-memory state, no authentication, no database. All data resets on page refresh.

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

Create `.env.local` in the project root:

```
OPENROUTER_API_KEY=your_key_here
```

Get an API key at [openrouter.ai](https://openrouter.ai). The app uses `openai/gpt-4o-mini` by default.

---

## Features

### Dashboard (`/dashboard`)
- **Status overview bar** — clickable status counts (Pending, Draft, In Review, Revision Needed, Approved) that filter the section grid
- **Progress banner** — report completion percentage with a live progress bar
- **Category sidebar** — filter by category; each shows its section count
- **Section cards** — color-coded left borders by urgency (orange = revision needed, yellow = in review, green = approved); auto-sorted with urgent sections first; contextual CTA hints on hover
- **Combined filters** — status + category filters work together; "Clear all filters" resets both

### Section Editor (`/sections/[id]`)
- **Breadcrumb navigation** — `Dashboard / Category / Section Title`, each segment clickable
- **Workflow pipeline stepper** — visual 4-step indicator (Pending → Draft → Review → Approved) showing completed, current, and upcoming stages; revision state shows a separate orange warning badge
- **Draft editor** — textarea for direct editing with explicit Save button (only appears when there are unsaved changes)
- **AI draft generation** — generate or regenerate drafts using OpenRouter; see [AI Generation](#ai-generation) below
- **Review notes** — freeform notes field that auto-saves on blur
- **Workflow controls** — advance section status with context-aware action buttons

### Report View (`/report`)
- Shows only approved sections, grouped by category
- **Category filter bar** — pill buttons to isolate a single category; click "All sections" or the active pill again to reset
- Actionable warning banner links back to the dashboard when sections are still pending

### Admin (`/admin`)
- Central hub for all administrative controls — see [Admin Guide](#admin-guide) below

---

## AI Generation

Each section editor has a **"Generate with AI"** / **"Regenerate with AI"** button. Below it, an expandable **"AI References & Instructions"** panel gives SMEs three ways to guide the output:

### Reference URLs
Paste one or more URLs (up to 5). The server fetches each URL in parallel, strips HTML to readable text, and injects the content into the AI prompt as reference material.

- URLs must begin with `http://` or `https://`
- Press **Enter** or click **Add** to chip a URL
- Failed fetches show a yellow warning but do not block generation

### Reference Text
Paste raw content directly — analyst notes, internal data, report excerpts. Injected verbatim into the prompt.

### Editing Instructions
Free-form directions for the AI:
- Change tone: `"Make this more formal"`
- Add detail: `"Include more data on lead times for automotive semiconductors"`
- Remove content: `"Remove the paragraph about pricing"`
- Combine: `"Shorten to 2 paragraphs, focus on risk factors, use a cautious tone"`

The **badge** on the collapsed panel header shows how many of the three option types are currently active.

### Server-side logging
Every generation request is logged to the console with structured metadata (section title, category, URL count, whether text/instructions were provided). A `// TODO Phase 2:` comment in `src/app/api/generate-draft/route.ts` marks where to add database persistence once Supabase is connected.

---

## Workflow States

```
pending → draft → in_review → approved
                          ↘ revision_needed → in_review
approved → revision_needed  (reopen)
```

| Status | Color | Meaning |
|---|---|---|
| Pending | Gray | Not started |
| Draft | Blue | SME is writing |
| In Review | Yellow | Submitted for review |
| Revision Needed | Orange | Reviewer requested changes |
| Approved | Green | Section is final |

---

## Admin Guide

The Admin section (`/admin`) is accessible from the top navigation bar. It gives the report administrator full control over the report structure, team, and settings — without touching code.

> **Reminder:** All changes are in-memory and reset on page refresh (Phase 1 prototype). Phase 2 will add persistent storage.

---

### Category Structure (`/admin/structure`)

Manage the three-level hierarchy that organises all report sections:

- **L0** — Top-level category (e.g. *Product Categories*)
- **L1** — Subcategory under an L0 (e.g. *SEMICONDUCTORS*)
- **L2** — Leaf subcategory under an L1 (e.g. *Analog*, *Discrete*)

**How to use:**

| Task | How |
|---|---|
| Rename any category or subcategory | Click its name — it becomes an inline text field. Press Enter or ✓ to save, ✕ to cancel. |
| Add a top-level category (L0) | Click **+ Add top-level category** at the bottom of the page |
| Add a L1 subcategory | Click **+ Add L1 subcategory** inside the category card |
| Add a L2 subcategory | Expand a L1 row and click **+ Add L2 subcategory** |
| Reorder categories or L1 subcategories | Hover the row and use the **↑ / ↓** arrow buttons |
| Delete a category or subcategory | Hover the row and click **✕**; confirm the prompt |

> **Note:** Deleting a category does not delete its sections. Sections that were assigned to a deleted category will still appear in the dashboard under their original category name — you can reassign them via [Section Management](#section-management-adminsections).

---

### Section Management (`/admin/sections`)

Create, reassign, and delete report sections.

**Creating a section:**
1. Click **+ New section**
2. Enter the section title
3. Choose a category/subcategory from the dropdown (shows the full L0 › L1 › L2 path)
4. Optionally assign an SME
5. Click **Create** — the section appears in the dashboard immediately with status *Pending*

**Editing a section's category or SME:**
1. Find the section in the table
2. Click **Edit** on the right
3. Change the category/subcategory or SME assignment
4. Click **Save**

**Deleting a section:**
- Click **Delete** on the right, then confirm. Deleted sections are removed from the dashboard and report immediately.

> Clicking a section title opens the section editor — useful for reviewing content without leaving the admin area.

---

### SME Management (`/admin/team`)

Manage the pool of subject matter experts who can be assigned to sections.

| Task | How |
|---|---|
| Add a new SME | Click **+ Add SME**, enter their full name, click **Add** |
| Rename an SME | Click **Rename** next to their name, edit inline, click **Save** — all their assigned sections update automatically |
| Remove an SME | Click **Remove**; if they have assigned sections you will be prompted to reassign those sections to another SME or leave them unassigned |

Each SME card shows a breakdown of their assigned sections by status (Draft, In Review, etc.) so you can quickly spot workload imbalances.

---

### Report Settings (`/admin/settings`)

Edit report-level metadata that appears across the app:

| Field | Where it appears |
|---|---|
| **Report title** | Navigation bar, report page header |
| **Report period** | Navigation bar, dashboard subtitle, report page |

Click **Save changes** to apply. Changes are reflected immediately everywhere in the app.

---

### Workflow Oversight (`/admin/workflow`)

Monitor section progress and override statuses when needed.

**Needs action banner:** Sections currently *In Review* or *Revision Needed* are highlighted at the top for quick access.

**Overriding a single section's status:**
- Find the section in the table and use the **Override** dropdown to set it to any status directly, bypassing the normal workflow transitions.

**Bulk status change:**
1. Use the **Filter** dropdown to narrow the list (e.g. show only *Pending* sections)
2. Check the sections you want to update (or check the header box to select all visible)
3. Choose a target status from the **set to** dropdown
4. Click **Apply** and confirm

> Bulk reset is useful when starting a new report cycle — select all *Approved* sections and reset them to *Pending*.

---

## Updating Section Background Images

Each report section in the Report view displays a thematic background image from [Unsplash](https://unsplash.com). All mappings live in:

**`src/lib/data/section-images.ts`**

To swap an image: find a photo on Unsplash, copy the photo ID from the URL (e.g. `photo-1486325212027-8081e485255e`), and replace the existing ID for that section key.

| Section ID | Topic |
|---|---|
| `macro-gdp` | Global GDP Outlook |
| `macro-inflation` | Inflation & Monetary Policy |
| `macro-fx` | Currency & FX Risk |
| `macro-rates` | Interest Rate Environment |
| `sc-geopolitical` | Geopolitical Disruptions |
| `sc-logistics` | Logistics & Shipping |
| `sc-supplier` | Supplier Concentration Risk |
| `semi-analog` | Semiconductors: Analog |
| `semi-discrete` | Semiconductors: Discrete |
| `semi-logic` | Semiconductors: Logic |
| `semi-highend` | Semiconductors: High-End |
| `passive-cap` | Passive Components: Capacitors |
| `em-connectors` | Electromechanical: Connectors |

---

## Project Structure

```
src/
  app/
    dashboard/page.tsx              # Dashboard with filters and progress
    sections/[id]/page.tsx          # Section editor
    report/page.tsx                 # Consolidated report view
    admin/
      page.tsx                      # Admin landing — stats + module links
      structure/page.tsx            # Category tree editor (L0/L1/L2)
      sections/page.tsx             # Section CRUD
      team/page.tsx                 # SME management
      settings/page.tsx             # Report title and period
      workflow/page.tsx             # Status overrides and bulk reset
    api/generate-draft/route.ts     # OpenRouter proxy + URL fetching
  components/
    features/
      dashboard/
        stats-bar.tsx               # Clickable status filter bar
        section-card.tsx            # Section card with urgency borders
        category-filter.tsx         # Sidebar filter with counts
        progress-banner.tsx         # Report completion progress bar
      nav/main-nav.tsx              # Top navigation
      section-editor/
        draft-panel.tsx             # Draft editor + AI references UI
        workflow-controls.tsx       # Status pipeline stepper + action buttons
  contexts/data-context.tsx         # In-memory state + all CRUD methods
  lib/
    data/sections.ts                # Seed data (sections, category tree, SMEs, report meta)
    data/section-images.ts          # Unsplash image URL map per section ID
    openrouter/client.ts            # OpenRouter API client + prompt builder
  types/index.ts                    # All TypeScript interfaces and constants
```

---

## Phase 2 Roadmap

When the core workflow is validated, Phase 2 will add:

- **Database** (Supabase/Postgres) — persistent sections, drafts, notes
- **Authentication** — user accounts, SME profiles
- **AI generation logs** — full request history per section (hook point already in code)
- **Rich text editor** — formatted drafts instead of plain text
- **Multi-user assignment** — claim/assign sections to specific SMEs
