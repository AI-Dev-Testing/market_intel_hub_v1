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
- Update this CLAUDE.md file when architectural decisions change
- Maintain a CHANGELOG.md for significant changes
- Add README.md in complex feature directories
- Comment non-obvious code with business context

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
**Phase 1: Prototype** — Initializing the project and building the core internal collaboration workflow. Focus on report structure, AI draft generation, and the revision/approval pipeline. No authentication, no database, no external publishing yet.

### Known Issues
- Project just initialized — no known issues yet

### Next Priorities
1. Build report structure UI with hierarchical categories/sub-categories
2. Implement AI draft generation for a single report section (proof of concept)
3. Build basic workflow states (Draft > Review > Revision > Approved)
4. Create a status dashboard showing section progress

### Questions to Resolve
- What AI model/provider to use for draft generation (OpenRouter model selection)?
- What does the report category taxonomy look like in full detail?
- How many revision cycles are typical before approval?
- Are there different approval roles (e.g., section reviewer vs. final approver)?

---

## Version History
- **Version 1.0** (2024): Initial CLAUDE.md structure
- **Version 1.1** (2026-02): GPSC Market Intelligence project initialized — business objectives, report structure, and prototype phase defined
