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
- Actionable warning banner links back to the dashboard when sections are still pending

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
    dashboard/page.tsx          # Dashboard with filters and progress
    sections/[id]/page.tsx      # Section editor
    report/page.tsx             # Consolidated report view
    api/generate-draft/route.ts # OpenRouter proxy + URL fetching
  components/
    features/
      dashboard/
        stats-bar.tsx           # Clickable status filter bar
        section-card.tsx        # Section card with urgency borders
        category-filter.tsx     # Sidebar filter with counts
        progress-banner.tsx     # Report completion progress bar
      nav/main-nav.tsx          # Top navigation
      section-editor/
        draft-panel.tsx         # Draft editor + AI references UI
        workflow-controls.tsx   # Status pipeline stepper + action buttons
  contexts/data-context.tsx     # In-memory state (React Context)
  lib/
    data/sections.ts            # 13 dummy sections (initial state)
    openrouter/client.ts        # OpenRouter API client + prompt builder
  types/index.ts                # All TypeScript interfaces and constants
```

---

## Phase 2 Roadmap

When the core workflow is validated, Phase 2 will add:

- **Database** (Supabase/Postgres) — persistent sections, drafts, notes
- **Authentication** — user accounts, SME profiles
- **AI generation logs** — full request history per section (hook point already in code)
- **Rich text editor** — formatted drafts instead of plain text
- **Multi-user assignment** — claim/assign sections to specific SMEs
