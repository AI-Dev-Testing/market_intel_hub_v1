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
TAVILY_API_KEY=your_key_here
```

- **OpenRouter** — get a key at [openrouter.ai](https://openrouter.ai). The app uses `openai/gpt-4o-mini` by default.
- **Tavily** — get a free key at [tavily.com](https://tavily.com) (1,000 searches/month on the free tier). Required only when using the Web Search toggle.

---

## Application Overview

The app is organised into four main areas accessible from the top navigation bar:

| Area | URL | Purpose |
|---|---|---|
| Dashboard | `/dashboard` | View all sections, track progress, filter by status or category |
| Section Editor | `/sections/[id]` | Edit draft content, generate with AI, manage workflow |
| Report | `/report` | Read the consolidated final report (approved sections only) |
| Admin | `/admin` | Manage categories, sections, team, settings, workflow overrides |

---

## Dashboard (`/dashboard`)

The starting point for all day-to-day work.

- **Progress banner** — report completion percentage with a live progress bar
- **Status filter bar** — clickable status counts (Pending, Draft, In Review, Revision Needed, Approved) that filter the section grid; click again to deselect
- **Category sidebar** — filter by category; each shows its section count
- **Section cards** — color-coded left borders by urgency (orange = revision needed, yellow = in review, green = approved); auto-sorted with urgent sections first
- **Combined filters** — status + category filters work together; "Clear all filters" resets both
- **Contextual CTAs** — card buttons change based on section status: "Start draft →", "Continue editing →", "Address feedback →", "View section →"

---

## Section Editor (`/sections/[id]`)

Open from any section card on the dashboard, or directly by URL.

### Header & navigation

- **Breadcrumb** — `Dashboard / Category / Section Title`, each segment clickable
- **Status badge** + subcategory label
- **SME assignment** and last-updated timestamp

### Market Data chart

Where a chart is registered for the section (see [Chart Registry](#chart-registry)), it appears at the top of the main column under a **Market Data** heading. All Supply Chain Risk sections and all Macroeconomic sections have charts.

### Risk Scores panel (Supply Chain Risk sections only)

The four individual SC risk sections (`Compliance & ESG`, `Natural Hazard & Climate`, `Logistics & Transportation`, `Geopolitical & Trade`) each display an interactive **Risk Scores** panel directly below the Market Data chart.

**Expand/collapse:** Click the panel header to toggle it open. The header always shows the current overall score and label (e.g. `10/10 — Critical`).

**What you can edit:**

| Field | How to edit |
|---|---|
| **Overall Score** (1–10) | Use the `−` and `+` buttons to increment or decrement |
| **Likelihood / Impact / Velocity scores** (1–5) | Click the numbered pill buttons; active score is highlighted |
| **Dimension descriptions** | Edit the textarea beneath each dimension; saves automatically when you click away (on blur) |
| **Regional scores** (Americas / Europe / China / SE Asia, 1–5) | Click the numbered pill buttons in the regional breakdown |
| **Regional factor descriptions** | Edit the textarea beneath each region; saves on blur |

**Colour coding:**
- 1–2 = Green (Low)
- 3 = Amber (Moderate)
- 4 = Red (High)
- 5 = Dark red (Critical)

**Live updates:** Any change made here immediately updates the **Supply Chain Risk Dashboard** overview radar chart (`sc-overview`) — no page reload needed. Open both sections side-by-side in different tabs to see the radar update in real time.

### Draft panel

- **Draft editor** — textarea for direct editing with an explicit **Save** button (only appears when there are unsaved changes)
- **Generate / Regenerate with AI** — sends the section title, category, and subcategory to the AI model; see [AI Generation](#ai-generation) below
- **Sources list** — shows any web sources used during the last AI generation; toggle-expandable

### Reviewer Notes / Reviewer Feedback

Behaviour changes depending on workflow status:

| Status | What appears |
|---|---|
| Pending, Draft | Notes field is hidden |
| In Review | Editable notes textarea (required if requesting revision) |
| Revision Needed | Read-only orange feedback block showing the reviewer's note |
| Approved | Read-only notes textarea |

### Workflow controls (sidebar)

Visual pipeline stepper + action buttons:

| From status | Available actions |
|---|---|
| Pending | Start draft |
| Draft | Submit for review |
| In Review | Approve, Request revision |
| Revision Needed | Resubmit for review |
| Approved | Reopen for revision |

---

## Supply Chain Risk Dashboard (`sc-overview`)

The **Supply Chain Risk Dashboard** section (`/sections/sc-overview`) is a special portfolio-view section with no editable risk scores of its own.

It displays a **radar chart** overlaying all four SC risk categories on four shared axes:

- **Likelihood** — how probable the risk is (1–5)
- **Impact** — severity if the risk materialises (1–5)
- **Velocity** — how quickly the risk can escalate (1–5)
- **Regional Exposure** — average of the four regional scores (Americas / Europe / China / SE Asia) per risk category (1–5)

The radar chart is **live** — it reads scores directly from the four individual risk sections. When you edit a score in any of those sections, the radar updates instantly without refreshing the page.

### The five Supply Chain sections in order (highest risk first)

| Section | Subcategory | Default Score | Status |
|---|---|---|---|
| Supply Chain Risk Dashboard | Risk Overview | — (overview only) | Approved |
| Compliance & ESG Risk | Compliance / ESG | 10/10 Critical | Draft |
| Natural Hazard & Climate Risk | Natural Hazard / Climate | 8/10 High | Draft |
| Logistics & Transportation Risk | Logistics & Transportation | 6/10 Elevated | In Review |
| Geopolitical & Trade Risk | Geopolitical / Trade | 5/10 Moderate | Approved |

---

## Report View (`/report`)

Shows only **approved** sections, grouped by category.

- **Category filter bar** — pill buttons to isolate a single category; click the active pill or "All sections" to reset
- **Sources disclosure** — sections generated with Web Search show a collapsed "Show sources (N) ▼" link; click to reveal the clickable source list
- **Executive Summary** — AI-generated 4–6 bullet summary across all approved sections; displayed at the top; regeneratable from Report Settings
- **Actionable warning banner** — links back to the dashboard when sections are still pending

---

## AI Generation

Each section editor has a **"Generate with AI"** / **"Regenerate with AI"** button. Below it, an expandable **"AI References & Instructions"** panel gives four ways to guide the output.

### Web Search

An opt-in toggle (off by default). When enabled, the server queries [Tavily](https://tavily.com) for the latest electronics and supply-chain news before generating the draft. Results are injected into the AI prompt as *Latest Web Intelligence*.

- Requires `TAVILY_API_KEY` in `.env.local`
- After generation, a **Sources used (N)** panel appears listing each article with its domain

#### Source Whitelist & Blacklist

Each source card has two controls:

| Button | Behaviour |
|---|---|
| **Prioritise** | Adds the domain to your whitelist — Tavily results from that domain are sorted to the top in future searches |
| **Exclude** | Adds the domain to your blacklist — filtered out at Tavily search time |

Clicking an active button removes the preference. Whitelisting a domain auto-removes it from the blacklist and vice versa.

Preferences persist in `localStorage` under `gpsc_source_whitelist` / `gpsc_source_blacklist`.

> **Phase 2:** Preferences will migrate to a per-user Supabase table with admin-managed app-wide overrides.

### Reference URLs

Paste one or more URLs (up to 5). The server fetches each URL in parallel, strips HTML to readable text, and injects the content as reference material.

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

The **badge** on the collapsed panel header shows how many of the four option types are currently active.

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

| Task | How |
|---|---|
| Rename any category or subcategory | Click its name — it becomes an inline text field. Press Enter or ✓ to save, ✕ to cancel. |
| Add a top-level category (L0) | Click **+ Add top-level category** at the bottom of the page |
| Add a L1 subcategory | Click **+ Add L1 subcategory** inside the category card |
| Add a L2 subcategory | Expand a L1 row and click **+ Add L2 subcategory** |
| Reorder categories or L1 subcategories | Hover the row and use the **↑ / ↓** arrow buttons |
| Delete a category or subcategory | Hover the row and click **✕**; confirm the prompt |

> **Note:** Deleting a category does not delete its sections. Sections assigned to a deleted category will still appear in the dashboard under their original category name.

---

### Section Management (`/admin/sections`)

Create, reassign, and delete report sections.

**Creating a section:**
1. Click **+ New section**
2. Enter the section title
3. Choose a category/subcategory from the dropdown (shows the full L0 › L1 › L2 path)
4. Optionally assign an SME
5. Click **Create** — the section appears in the dashboard immediately with status *Pending*

**Editing a section:**
1. Find the section in the table and click **Edit**
2. Change the category/subcategory or SME assignment
3. Click **Save**

**Deleting a section:**
Click **Delete**, then confirm. Deleted sections are removed from the dashboard and report immediately.

> Clicking a section title opens the section editor — useful for reviewing content without leaving the admin area.

---

### SME Management (`/admin/team`)

Manage the pool of subject matter experts who can be assigned to sections.

| Task | How |
|---|---|
| Add a new SME | Click **+ Add SME**, enter their full name, click **Add** |
| Rename an SME | Click **Rename** next to their name, edit inline, click **Save** — all assigned sections update automatically |
| Remove an SME | Click **Remove**; if they have assigned sections you will be prompted to reassign or leave unassigned |

Each SME card shows a breakdown of their assigned sections by status so you can spot workload imbalances.

---

### Report Settings (`/admin/settings`)

Edit report-level metadata:

| Field | Where it appears |
|---|---|
| **Report title** | Navigation bar, report page header |
| **Report period** | Navigation bar, dashboard subtitle, report page |

Click **Save changes** to apply immediately everywhere.

Also use this page to **regenerate the AI Executive Summary** from the latest approved sections.

---

### Workflow Oversight (`/admin/workflow`)

Monitor section progress and override statuses when needed.

- **Needs action banner** — sections currently *In Review* or *Revision Needed* are highlighted at the top for quick access
- **Override a single section** — use the **Override** dropdown to set any section to any status directly
- **Bulk status change** — filter the list, check sections, choose a target status, click **Apply**

> Bulk reset is useful when starting a new report cycle — select all *Approved* sections and reset them to *Pending*.

---

### Prompt Management (`/admin/prompts`)

Edit the AI prompt templates used for draft generation across all sections.

- **Universal system prompt** — the base instruction set sent to the AI on every generation
- **User prompt template** — the per-request prompt with placeholders:

| Placeholder | What it injects |
|---|---|
| `{{title}}` | Section title |
| `{{category}}` | Section category |
| `{{subcategory}}` | Section subcategory |
| `{{period}}` | Report period (from Report Settings) |
| `{{references}}` | Fetched URL content + pasted reference text |
| `{{webSources}}` | Tavily web search results |
| `{{instructions}}` | Editing instructions from the SME |

- **Version history** — up to 10 saved versions with optional change notes; click **Restore** to roll back
- **Per-section overrides** — set a custom prompt for a specific section that takes precedence over the universal template; managed via the override table at the bottom of the page

---

## Updating Section Background Images

Each section in the Report view displays a thematic background image from [Unsplash](https://unsplash.com). All mappings live in:

**`src/lib/data/section-images.ts`**

To swap an image: find a photo on Unsplash, copy the photo ID from the URL (e.g. `photo-1486325212027-8081e485255e`), and replace the existing ID for that section key.

### Current image map

| Section ID | Topic |
|---|---|
| `macro-pmi` | Manufacturing PMI / industrial production |
| `macro-gdp` | Financial district skyline |
| `macro-inflation` | Stock market / financial data |
| `macro-fx` | Currency / forex trading |
| `macro-rates` | Central bank / federal reserve |
| `macro-energy` | Oil refinery / energy infrastructure |
| `sc-overview` | Globe / world map from space |
| `sc-compliance` | Documents / audit / compliance desk |
| `sc-climate` | Storm / weather / climate hazard |
| `sc-logistics` | Container port / cargo shipping |
| `sc-geopolitical` | Trade / flags / international |
| `semi-analog` | Circuit board / analog components |
| `semi-discrete` | Electronic components / discrete parts |
| `semi-logic` | Silicon wafer / logic chips |
| `semi-highend` | Data center / server racks |
| `passive-cap` | Electronic components / capacitors |
| `em-connectors` | Cables / connectors / wiring |
| `tl-ocean-rates` | Container ship at sea |
| `tl-air-rates` | Cargo aircraft in flight |
| `tl-trade-lanes` | World shipping / port aerial view |

---

## Chart Registry

Charts appear in the Section Editor (above the draft) and in the Report view. The mapping from section ID to chart component lives in:

**`src/lib/data/chart-registry.tsx`**

| Section ID | Chart |
|---|---|
| `macro-pmi` | Manufacturing PMI (line chart) |
| `macro-gdp` | GDP Outlook (bar chart) |
| `macro-fx` | FX Risk (bar chart) |
| `macro-rates` | Central Bank Rates (line chart) |
| `macro-energy` | Energy Prices (line chart) |
| `sc-overview` | Supply Chain Risk Radar (multi-overlay radar) |
| `sc-geopolitical` | Geopolitical Risk Scorecard |
| `sc-logistics` | Logistics Risk Scorecard |
| `sc-climate` | Climate Risk Scorecard |
| `sc-compliance` | Compliance Risk Scorecard |
| `tl-ocean-rates` | Ocean Freight Rates (line chart) |
| `tl-air-rates` | Air Freight Rates (line chart) |
| `tl-trade-lanes` | Key Trade Lanes (bar chart) |

Sections not listed here display no chart. To add a chart to a new section, create a chart component in `src/components/charts/` and add an entry to `SECTION_CHARTS` in `chart-registry.tsx`.

---

## Risk Scorecard Data

The seed scores and descriptions for all four SC risk sections live in:

**`src/lib/data/sections.ts`** — exported as `INITIAL_SCORECARDS`

In-app edits via the [Risk Scores panel](#risk-scores-panel-supply-chain-risk-sections-only) are held in memory (DataContext) and reset on page refresh. To change the default values that load on startup, edit `INITIAL_SCORECARDS` directly.

---

## Project Structure

```
src/
  app/
    dashboard/page.tsx              # Dashboard with filters and progress
    sections/[id]/page.tsx          # Section editor (draft, AI gen, workflow, risk scores)
    report/page.tsx                 # Consolidated report view
    admin/
      page.tsx                      # Admin landing — stats + module links
      structure/page.tsx            # Category tree editor (L0/L1/L2)
      sections/page.tsx             # Section CRUD
      team/page.tsx                 # SME management
      settings/page.tsx             # Report title, period, executive summary
      workflow/page.tsx             # Status overrides and bulk reset
      prompts/page.tsx              # Prompt template + version history + per-section overrides
    api/generate-draft/route.ts     # OpenRouter proxy + URL fetching + Tavily search
  components/
    charts/
      sc-risk-scorecard.tsx         # Reusable 3-col dimension card + regional list (read-only)
      sc-overview-chart.tsx         # Radar chart — live from DataContext scorecards
      sc-geopolitical-chart.tsx     # Geopolitical risk scorecard wrapper
      sc-logistics-chart.tsx        # Logistics risk scorecard wrapper
      sc-climate-chart.tsx          # Climate risk scorecard wrapper
      sc-compliance-chart.tsx       # Compliance risk scorecard wrapper
    features/
      dashboard/
        stats-bar.tsx               # Clickable status filter bar
        section-card.tsx            # Section card with urgency borders
        category-filter.tsx         # Sidebar filter with counts
        progress-banner.tsx         # Report completion progress bar
      nav/main-nav.tsx              # Top navigation
      section-editor/
        draft-panel.tsx             # Draft editor + AI references + web search UI
        workflow-controls.tsx       # Status pipeline stepper + action buttons
        risk-scores-panel.tsx       # In-app risk score editor (SC sections only)
  contexts/data-context.tsx         # In-memory state + all CRUD methods + scorecard state
  hooks/
    use-source-preferences.ts       # localStorage whitelist/blacklist hook
  lib/
    data/sections.ts                # Seed data — sections, category tree, SMEs, scorecards
    data/section-images.ts          # Unsplash image URL map per section ID
    data/chart-registry.tsx         # Maps section IDs to chart components
    openrouter/client.ts            # OpenRouter API client + prompt builder
    tavily/client.ts                # Tavily web search client
  types/index.ts                    # All TypeScript interfaces and constants
```

---

## Phase 2 Roadmap

When the core workflow is validated, Phase 2 will add:

- **Database** (Supabase/Postgres) — persistent sections, drafts, notes, scorecard data
- **Authentication** — user accounts, SME profiles
- **AI generation logs** — full request history per section (hook point already in code)
- **Rich text editor** — formatted drafts instead of plain text
- **Role-based access** — `sme` / `editor` / `admin` roles; sections only editable by their assigned SME
- **Source management database** — migrate `localStorage` whitelist/blacklist to per-user `user_source_prefs` table; admin-managed app-wide `app_source_prefs` overrides; `/admin/sources` management page
