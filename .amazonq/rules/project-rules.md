# Project Context & AI Agent Instructions

> **WARNING: READ THIS FIRST**
>
> This project follows a **PROTOTYPE-FIRST** development methodology.
>
> **DO NOT build authentication, databases, themes, or polish features until the core business functionality is validated by the project owner.**
>
> Start with the simplest possible implementation using dummy data. Wait for explicit approval before adding production features.
>
> See "Critical Development Philosophy" section below for details.

---

## Project Owner Profile
- **Technical Level**: Limited coding expertise, strong business focus
- **Role**: Product owner and business strategist - also the first trial user
- **Expectations**: Detailed explanations of technical decisions and their business implications
- **Working Style**: Collaborative with AI agents handling most technical implementation

### Critical Development Philosophy: Prototype First, Polish Later

**YOU MUST FOLLOW THIS APPROACH FOR ALL PROJECTS:**

This is an **iterative, validation-driven process**. Do NOT build full-featured applications upfront.

#### Phase 1: Core Business Function (Build This First)
- Focus ONLY on the minimum code needed to achieve the core business objectives
- Use dummy data, hardcoded values, and placeholder UI
- Skip authentication, user management, themes, and all "nice-to-have" features
- Goal: Prove the core concept works and delivers business value
- **The project owner will test this as the first user to validate it solves the problem**

#### Phase 2: Validation & Refinement (Wait for Confirmation)
- Project owner tests the prototype with real use cases
- Gather feedback on whether core functionality meets business needs
- Iterate on core features based on actual usage
- **DO NOT proceed to Phase 3 until explicitly told the core works**

#### Phase 3: Production Features (Only After Core is Validated)
- Add user authentication (Supabase/BetterAuth)
- Implement proper data persistence
- Add UI polish (dark/light themes, responsive design refinements)
- Implement error handling and edge cases
- Add user management and multi-user features
- Performance optimization
- Security hardening

**Why This Approach:**
- Prevents wasting time building features for a concept that doesn't work
- Allows rapid business validation (days, not weeks)
- Reduces complexity during the critical learning phase
- Makes it easy to pivot if business needs change
- Project owner can understand and test core functionality without technical noise

**Example - Building a Document Analysis Tool:**
- WRONG: Build full app with login, database, user settings, theme switcher, then add document analysis
- CORRECT: Build simple page with file upload > analysis > display results. Use dummy data. Test if analysis is valuable. THEN add user features.

## Business Objectives

**Current Project Goal**: Build an internal collaborative web application for GPSC Market Intelligence report production. The app enables multiple Subject Matter Experts (SMEs) to collaborate on intelligence collection across defined report sections, with AI-assisted initial drafting and a structured human review/approval workflow before sections are consolidated into the final report.

**Success Criteria**:
- SMEs can view and claim report sections assigned to their expertise
- AI generates usable first drafts for report sections based on available intelligence inputs
- Drafts progress through clearly defined revision and approval stages
- Approved sections consolidate into a complete, coherent final report
- Internal workflow is functional and validated before any external-facing output is built

**Target Users**:
- **Primary (Phase 1)**: Internal analysts and SMEs who research and write report sections
- **Secondary (Phase 1)**: Editors/reviewers who approve section drafts
- **Future (Phase 2)**: External audiences consuming the published report as a web page

**Key Features**:
- **Report Structure Management**: Hierarchical report template with categories and sub-categories
  - Macroeconomic Topics
  - Supply Chain Risks
  - Product Categories (e.g., SEMICONDUCTORS > Analog, Discrete, Logic, High-End)
- **AI Draft Generation**: AI-powered initial drafts for each report section based on collected intelligence
- **Collaborative Editing Workflow**: Multi-stage revision process (Draft > Review > Revision > Approval)
- **Section Assignment & Ownership**: Assign sections to specific SMEs, track who owns what
- **Status Tracking Dashboard**: Visibility into which sections are drafted, in review, approved, or pending
- **Report Consolidation**: Merge approved sections into the final unified report
- **External Report Publishing (Future)**: Generate the final report as a web page for external audiences

---

## Technical Stack

### Core Technologies
- **Runtime**: Node.js
- **Framework**: React with Next.js (recommended for full-stack React apps)
- **Language**: TypeScript (preferred for type safety and better AI assistance)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth or BetterAuth
- **AI Integration**: OpenRouter API
- **Deployment**: Vercel
- **File Storage**: Supabase Storage or Vercel Blob

### MCP Servers (Model Context Protocol)
The following MCP servers are available and should be leveraged when appropriate:
- **Supabase MCP**: Database operations, auth management, storage
- **Context7 MCP**: Up-to-date, version-specific documentation and code examples straight from the source. Always use Context7 MCP when I need library/API documentation, code generation, setup or configuration steps without me having to explicitly ask.
- **Playwright MCP**: Browser automation, testing, web scraping

---

## Architecture Principles

### 1. Modularity First
- Build components and features as independent, reusable modules
- Each feature should be self-contained and easily portable to other projects
- Use clear interfaces between modules

**Why**: This allows you to reuse code across multiple business projects without starting from scratch.

### 2. Business Logic Separation
- Keep business logic separate from UI components
- Use custom hooks or service layers for business logic
- Database queries should be abstracted into repository patterns

**Why**: When business requirements change, you only update logic in one place, not scattered throughout the UI.

### 3. Configuration-Driven Design
- Use environment variables for all external services
- Create config files for feature flags and business rules
- Document all configuration options

**Why**: Easy to adapt the application for different use cases or clients without code changes.

### 4. Progressive Enhancement
- Start with core functionality working
- Add advanced features incrementally
- Each feature should be independently deployable

**Why**: You can validate business value quickly before investing in complexity.

---

## Prototype-First Examples

### Example 1: Customer Feedback Analysis Tool

**Business Objective**: Analyze customer feedback and identify common themes

**WRONG Approach - Building Everything First:**
```
Week 1-2: Set up Next.js, Supabase, authentication
Week 3: Build user dashboard, settings page
Week 4: Add theme switcher, responsive design
Week 5: Finally start on AI analysis feature
Result: 5 weeks before knowing if AI analysis is even useful
```

**CORRECT Approach - Prototype First:**
```
Day 1: Single page with:
  - Textarea to paste feedback
  - Button to analyze
  - Display of themes found
  - Uses OpenRouter API with hardcoded prompt
  - No login, no database, no styling

Day 2: Project owner tests with real feedback
Day 3: Iterate on AI prompt and display based on feedback
Day 4: Confirm this is valuable > NOW add database, auth, etc.
Result: Core value proven in 3-4 days
```

### Example 2: Inventory Tracking System

**Business Objective**: Track product quantities and alert on low stock

**WRONG Approach:**
Build complete inventory management system with multi-user access, role permissions, reporting dashboards, then add the actual tracking.

**CORRECT Approach - Prototype First:**
```
Phase 1 Prototype:
- Simple table showing items (hardcoded array of 5-10 items)
- Input to update quantity
- Red highlight when quantity < threshold
- localStorage to persist changes
- NO database, NO login, NO reports

Test: Does this solve the basic tracking need?

Phase 2 (after validation):
- Add Supabase database
- Add authentication
- Multi-user support

Phase 3 (after stability):
- Reports and analytics
- Theme switcher
- Mobile app version
```

### Example 3: Content Scheduling Tool

**Business Objective**: Schedule social media posts across platforms

**Prototype First Approach:**
```
Phase 1:
- Form to enter post content and date
- Display scheduled posts in a list
- Store in localStorage
- NO actual posting to social media (just simulate/log)
- NO user accounts
- Purpose: Test if the scheduling interface makes sense

Phase 2 (after validation):
- Add real social media API integration
- Add Supabase for persistence
- Add authentication

Phase 3:
- Analytics
- Team collaboration features
- Calendar view
```

**Key Pattern**: Always test the core interaction FIRST with fake data before building infrastructure.

---

## Development Workflow

### Phase-Gated Development Process

**CRITICAL: Always develop in phases. Never skip ahead.**

#### Starting a New Project
1. **Clarify Core Business Objective**: What is the ONE main thing this tool must do?
2. **Strip to Essentials**: Identify absolute minimum code needed to demonstrate core value
3. **Propose Prototype Scope**: Present a minimal implementation plan (usually 1-2 core features)
4. **Get Approval**: Confirm this is the right starting point before writing code

#### Phase 1: Prototype Development
**Goal: Prove the core business concept works**

What TO include:
- Core business functionality only
- Simplest possible UI (can be ugly, just functional)
- Hardcoded data or simple dummy data
- Single-user, single-page if possible
- Console logs for debugging (not production error handling)

What NOT to include:
- Authentication or user accounts
- Database setup (use localStorage, dummy data, or JSON files)
- Dark/light theme switching
- Responsive design polish
- Error handling beyond console logs
- Loading states or skeleton screens
- Multi-user features
- Settings or preferences
- Email notifications or external integrations
- ANY feature that doesn't directly prove business value

**Deliverable**: A working prototype that the project owner can test immediately

#### Phase 1.5: Validation & Iteration
- Project owner tests prototype with real scenarios
- Gather feedback: Does it solve the problem? What's missing from CORE functionality?
- Iterate on core features only
- **STOP HERE until project owner says: "The core works, let's make it production-ready"**

#### Phase 2: Feature Scaffolding (Only After Core Approval)
- Set up Supabase database with proper schema
- Implement authentication
- Replace dummy data with real data persistence
- Add proper error handling
- Implement loading states

#### Phase 3: Production Polish (Final Phase)
- UI/UX refinements
- Dark/light theme
- Mobile responsiveness
- Performance optimization
- Security hardening
- Documentation

### When Starting Work
1. **Understand the Business Goal**: Always clarify what business problem we're solving
2. **Determine Current Phase**: Are we in Prototype, Scaffolding, or Polish phase?
3. **Propose Architecture**: Explain technical approach appropriate to current phase
4. **Show Trade-offs**: Present pros/cons of different implementation options
5. **Implement Incrementally**: Build in small, testable chunks
6. **Explain Decisions**: Document why each technical choice was made
7. **Pause at Phase Gates**: Explicitly stop and ask for validation before moving to next phase

### Code Organization
```
project-root/
  src/
    app/              # Next.js app directory (pages & API routes)
    components/       # React components
      ui/            # shadcn components
      features/      # Feature-specific components
    lib/             # Utility functions and shared code
      supabase/     # Supabase client and helpers
      openrouter/   # AI integration
      utils/        # General utilities
    hooks/           # Custom React hooks
    types/           # TypeScript type definitions
    config/          # Configuration files
  public/            # Static assets
  supabase/          # Supabase migrations and config
  tests/             # Test files
```

### Database Design Pattern
- Use Supabase migrations for all schema changes
- Follow PostgreSQL best practices (indexes, constraints)
- Design for Row Level Security (RLS) from the start
- Document table purposes and relationships

### Authentication Pattern
- Implement authentication early in the project
- Use Supabase RLS policies to enforce permissions at database level
- Store user preferences and settings in dedicated tables
- Consider multi-tenancy if needed for business model

### API Integration Pattern
For OpenRouter AI calls:
- Create a dedicated service layer in `src/lib/openrouter/`
- Handle errors gracefully with user-friendly messages
- Implement rate limiting and cost controls
- Cache responses when appropriate to reduce costs

### UI/UX Standards
- Use shadcn/ui components as the foundation
- Maintain consistent spacing, colors, and typography via Tailwind config
- Prioritize mobile-responsive design
- Include loading states and error handling in all user interactions

---

## Communication Guidelines for AI Agents

### Explaining Technical Decisions
When implementing features, always explain:
1. **What** you're building
2. **Why** this approach was chosen
3. **What alternatives** were considered
4. **Business impact** of this decision
5. **Potential future implications**

### Example Format:
```
I'm implementing [FEATURE] using [TECHNOLOGY].

Business Context: This solves [BUSINESS PROBLEM] by [EXPLANATION].

Technical Approach: I chose [APPROACH] because [REASONING].
- Alternative 1: [OPTION] - not chosen because [REASON]
- Alternative 2: [OPTION] - not chosen because [REASON]

Trade-offs:
+ Pros: [LIST BENEFITS]
- Cons: [LIST LIMITATIONS]

Future Considerations: [HOW THIS AFFECTS FUTURE WORK]
```

### When Encountering Problems
1. Explain what went wrong in business terms
2. Describe the technical issue clearly
3. Propose 2-3 solution options with pros/cons
4. Recommend the best option with reasoning
5. Wait for confirmation before proceeding with complex fixes

### Asking for Clarification
If business requirements are unclear:
1. State what you understand so far
2. Identify specific ambiguities
3. Ask targeted questions
4. Suggest a default approach if urgent

---

## Quality Standards

### Code Quality
- Write clear, commented code that explains the "why" not just the "what"
- Use meaningful variable and function names
- Follow consistent formatting (Prettier/ESLint)
- Prefer readability over cleverness

### Testing Approach
- Write tests for critical business logic
- Use Playwright for end-to-end testing of key user flows
- Test error cases and edge conditions
- Document test scenarios in business terms

### Documentation
- Maintain a CHANGELOG.md for significant changes
- Add README.md in complex feature directories
- Comment non-obvious code with business context

### Rules File Sync
- **CRITICAL**: Whenever `.amazonq/rules/project-rules.md` is modified, the identical changes MUST also be applied to `CLAUDE.md` in the project root, and vice versa. These two files must always remain in sync. Never update one without updating the other.

---

## Common Tasks & Patterns

### Setting Up a New Feature
1. Create feature directory: `src/components/features/[feature-name]/`
2. Define types: `src/types/[feature-name].ts`
3. Create database schema: `supabase/migrations/[timestamp]_[feature-name].sql`
4. Build UI components with shadcn/ui
5. Implement business logic in hooks or services
6. Add API routes if needed: `src/app/api/[feature-name]/`
7. Test with real user scenarios

### Integrating OpenRouter
```typescript
// src/lib/openrouter/client.ts
// Centralized AI client with error handling and cost tracking
```

### Supabase Operations
```typescript
// src/lib/supabase/queries.ts
// Database queries abstracted from components
// Use RLS policies instead of permission checks in code
```

### Environment Variables
Required `.env.local` variables:
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenRouter
OPENROUTER_API_KEY=

# Vercel (auto-populated in production)
VERCEL_URL=
```

---

## Deployment Checklist

Before deploying to Vercel:
- [ ] All environment variables configured in Vercel dashboard
- [ ] Supabase RLS policies enabled and tested
- [ ] Database migrations applied
- [ ] Error tracking configured (Sentry or similar)
- [ ] Performance testing completed
- [ ] Mobile responsiveness verified
- [ ] SEO meta tags added (if public-facing)

---

## Project-Specific Notes

### Current Phase
**Phase 1: Prototype — Core workflow complete, ready for real-world validation.**

The full internal collaboration loop is implemented and working with seed data. The tool is ready for the project owner to trial with actual report content before Phase 2 (database + auth) begins.

---

### What Is Built (as of 2026-03-19)

#### Core Workflow
- **Dashboard** (`/dashboard`): Progress banner (% complete, approved/in-progress/pending counts), status filter tabs (Pending / Draft / In Review / Revision Needed / Approved), category sidebar filter, section cards with status badge, SME name, draft preview, and contextual CTA ("Start draft →", "Continue editing →", "Address feedback →", "View section →").
- **Section Editor** (`/sections/[id]`): Full section view with metadata (category, subcategory, SME assignment, status badge). Tabbed panels: Draft Content, Notes, Sources, Prompt Override. Workflow controls for status transitions. Sections can be opened from the dashboard or directly by URL.
- **Report View** (`/report`): Consolidated view of all approved sections grouped by category. Category filter tabs. Section images (where configured). Collapsible sources disclosure per section. AI-generated Executive Summary (bullet-point format, regeneratable on demand).
- **Status workflow**: Five-state pipeline — `pending → draft → in_review → (approved | revision_needed) → in_review`. Transitions enforced with labelled buttons; invalid transitions are blocked by type system.

#### AI Draft Generation
- **Generate / Regenerate with AI** button on every section editor.
- Sends section title, category, subcategory to `/api/generate-draft` (POST).
- **Web Search** toggle: uses Tavily API to retrieve up to 5 recent web sources, sorted by domain whitelist.
- **Reference URLs**: paste URLs — server fetches content directly, falls back to Tavily Extract for paywalled/blocked pages. Failed URLs produce actionable warnings with tips.
- **Reference Text**: paste raw excerpts or data for the AI to draw from.
- **Editing Instructions**: free-text field for tone, focus, or removal directives.
- **Source Preferences**: per-session whitelist (green chips, always visible) and blacklist (collapsed count badge, expandable). Domains auto-whitelisted when a reference URL is added. Persisted via `localStorage` until Phase 2.
- **Prompt Management**: universal system prompt + user prompt template with `{{title}}`, `{{category}}`, `{{subcategory}}`, `{{period}}`, `{{references}}`, `{{webSources}}`, `{{instructions}}` placeholders. Version history (up to 10 versions) with rollback. Per-section prompt overrides that take precedence over the universal template.
- **Executive Summary**: AI-generated 4–6 bullet summary across all approved sections, regeneratable from the Report Settings page. Displayed at the top of the Report View.
- **AI model**: `openai/gpt-4o-mini` via OpenRouter. Draft generation: 800 tokens, temp 0.7. Executive summary: 600 tokens, temp 0.4.

#### Admin Suite (`/admin`)
- **Category Structure** (`/admin/structure`): Full L0 → L1 → L2 hierarchy editor. Add, rename, reorder (↑/↓), delete categories and subcategories at all levels. Renames cascade immediately to all section records (category string and subcategory string both update). Section counts shown per category.
- **Section Management** (`/admin/sections`): Create new sections (title, category/subcategory from tree, SME assignment). Delete sections. Full section list with status badges.
- **SME Management** (`/admin/team`): Add/remove SMEs from the pool. Workload view (sections per SME by status).
- **Report Settings** (`/admin/settings`): Edit report title and period. Regenerate the AI executive summary. Display of current summary with timestamp.
- **Workflow Oversight** (`/admin/workflow`): Override any section's status directly. Bulk-reset sections to Pending. List of sections currently awaiting action (in_review / revision_needed).
- **Prompt Management** (`/admin/prompts`): Edit universal prompt (system + user template). Save as new version with optional change note. Version history table with Restore. Per-section overrides: add/edit/clear via modal. Override table shows which sections have custom prompts.

#### Data Layer
- All state lives in `DataContext` (React Context, in-memory). Resets on page refresh — by design for the prototype phase.
- Seed data: 13 sections across 3 categories (Macroeconomic Topics, Supply Chain Risks, Product Categories), with realistic draft content for approved/in-progress sections.
- Category tree: 3 L0 nodes, subcategories with L1 and L2 levels (e.g. Product Categories → SEMICONDUCTORS → Analog/Discrete/Logic/High-End).

#### Environment Variables Required
```
OPENROUTER_API_KEY=     # Required for AI draft generation and executive summary
TAVILY_API_KEY=         # Required for web search and URL extraction (optional — web search gracefully disabled if absent)
```

---

### Next Priorities (Remaining Phase 1 / Pre-Phase 2)

These are improvements that remain within the prototype scope (no database or auth required):

1. **Real-content trial**: Project owner replaces seed data with actual GPSC report sections and tests the full draft → review → approve cycle with real intelligence inputs. This is the primary validation gate before Phase 2.
2. **PDF export**: ⚠️ DEFERRED — see "PDF Export: Lessons Learned" section below before attempting again.
3. **Section notes workflow**: The Notes tab exists but reviewer feedback/notes are not currently visible on the dashboard card. Consider surfacing the latest note on the "Revision Needed" card so the SME sees the feedback without opening the section.
4. **Keyboard shortcuts / UX polish**: The rename flow in admin/structure requires two clicks (click name → confirm). Minor friction but worth smoothing before wider team use.

### Phase 2 Priorities (After Core Validation)

These require the project owner to confirm the core workflow is valuable before building:

1. **Data persistence (Supabase)**: Migrate all state from in-memory context to a PostgreSQL database. Sections, category tree, SME list, report metadata, prompt config, and source preferences all need tables. State currently resets on refresh — this is the single biggest limitation for real team use.
2. **Authentication (Supabase Auth or BetterAuth)**: Add user accounts. Tie SME assignment and section editing to logged-in users. Sections should only be editable by their assigned SME (or admin).
3. **Source preferences persistence**: Migrate `localStorage` whitelist/blacklist to `user_source_prefs` table in Supabase. Schema is already designed — see Phase 2: Source Management section below.
4. **Generation logs**: Wire up the `generation_logs` table. The `// TODO Phase 2` comment is already in `src/app/api/generate-draft/route.ts` at line 138–139.
5. **Admin: Sources management page** (`/admin/sources`): App-wide domain whitelist/blacklist that overrides user preferences. Requires admin role.
6. **Role-based access control**: `sme` / `editor` / `admin` roles. Editors approve sections; SMEs can only edit their own; admins manage structure and prompts.

### Phase 2: Source Management (when auth + database are enabled)

#### Database schema required

**`user_source_prefs` table** — per-user whitelist/blacklist
```sql
CREATE TABLE user_source_prefs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  domain text NOT NULL,
  type text CHECK (type IN ('whitelist', 'blacklist')) NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, domain)
);
-- Enable RLS: users can only read/write their own rows
```

**`app_source_prefs` table** — admin-approved app-wide overrides
```sql
CREATE TABLE app_source_prefs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain text UNIQUE NOT NULL,
  type text CHECK (type IN ('whitelist', 'blacklist')) NOT NULL,
  approved_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);
-- Enable RLS: readable by all authenticated users, writable only by admins
```

**`generation_logs` table** — AI draft request history per section
```sql
CREATE TABLE generation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  section_id text NOT NULL,
  section_title text NOT NULL,
  category text NOT NULL,
  used_web_search boolean DEFAULT false,
  url_count int DEFAULT 0,
  has_reference_text boolean DEFAULT false,
  has_instructions boolean DEFAULT false,
  instructions_text text,
  sources jsonb,         -- array of {title, url, domain, snippet}
  generated_at timestamptz DEFAULT now()
);
```

#### Code migration required

- `src/hooks/use-source-preferences.ts` — replace `localStorage` reads/writes with calls to `/api/source-prefs` (GET to load, POST/DELETE to update); merge user prefs with app-wide prefs (app-wide overrides user)
- `src/app/api/source-prefs/route.ts` — new API route: GET returns merged user + app-wide prefs; POST adds a pref; DELETE removes one
- `src/app/api/generate-draft/route.ts` — replace `// TODO Phase 2:` comment with actual `db.generationLog.create(...)` call
- `src/app/admin/sources/page.tsx` — new admin page to manage app-wide whitelist/blacklist; requires admin role check

#### Admin role

Add a `role` column to the Supabase `profiles` table (`'sme' | 'editor' | 'admin'`). Admin routes check `role = 'admin'` via RLS or middleware.

---

---

## PDF Export: Lessons Learned

**Status**: Attempted 2026-03-20, reverted. Do not retry without reading this section.

### What was tried
CSS `@media print` + `window.print()` approach — no new dependencies, aimed to auto-sync with web content changes by styling the existing React tree for print.

### What went wrong

**1. Web view breakage**
Adding global `.print-only { display: none }` and associated helper classes to `globals.css` visibly corrupted the web UI header/layout even outside of print mode. Global CSS side-effects are hard to isolate in a Tailwind v4 project. Any future approach must be completely invisible to the normal web view.

**2. Print output was not usable**
- The browser's print engine sliced section content mid-card in unexpected ways despite `break-inside: avoid` — Recharts SVG charts break differently than text, and the combination of images + charts + long text inside a single card exceeded what the browser could honour cleanly.
- The dark-to-light color override using `[class*="bg-zinc-9"]` attribute selectors was too broad and produced inconsistent results — some elements went white correctly, others were partially overridden.
- The cover page + category page-break logic did not behave consistently across Chrome's print renderer.

### Requirements for the next attempt

Before building PDF export again, the following must be clear:

1. **Approach must not touch `globals.css` or any shared stylesheet.** Any print CSS must be scoped strictly to the report route (e.g. via a CSS Module imported only in `report/page.tsx`, or a `<style>` tag injected only when printing).

2. **The CSS `@media print` approach is not recommended for this app.** The combination of dark theme, Recharts SVGs, and complex card layouts makes reliable browser-native print output very difficult. Consider instead:
   - **`@react-pdf/renderer`**: Build a completely separate, purpose-built PDF template component. Fully decoupled from the web UI — no dark-theme interference. Requires maintaining a parallel document structure but gives precise control over layout, page breaks, and fonts.
   - **Server-side Puppeteer/Playwright**: A server route that spins up a headless browser, loads a light-mode-only `/report/print` route, and captures it as PDF. Zero CSS fighting; output matches the rendered page exactly.
   - **"Copy to clipboard" as interim**: A much simpler win — copy the full report as formatted plain text or Markdown to the clipboard, letting the user paste into Word/Google Docs for their own formatting.

3. **Before implementing, show the project owner a mockup or sample PDF output** and confirm the desired format (portrait vs landscape, whether charts should appear, level of formatting detail) before writing any code.

4. **Test in the browser's print preview before considering it done.** The previous attempt was not visually verified in print preview before delivery — this must be a required step.

---

## Version History
- **Version 1.0** (2024): Initial project rules structure
- **Version 1.1** (2026-02): GPSC Market Intelligence project initialized — business objectives, report structure, and prototype phase defined
- **Version 1.2** (2026-03-19): Phase 1 prototype complete — full capability summary added, next priorities updated to reflect real-world validation gate and Phase 2 roadmap
- **Version 1.3** (2026-03-20): PDF export attempted and reverted; lessons learned documented; Next Priorities updated
