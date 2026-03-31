// src/types/index.ts

export type SectionStatus =
  | "pending"
  | "draft"
  | "in_review"
  | "revision_needed"
  | "approved";

export interface SectionPromptOverride {
  systemPrompt?: string;
  userPromptTemplate?: string;
}

export interface StatusLogEntry {
  status: SectionStatus;
  timestamp: string; // ISO date string, e.g. "2026-03-30"
  note?: string;     // reviewer note captured at the time of the change
}

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
}

export interface Source {
  title: string;
  url: string;
  domain: string;
  snippet: string;
}

// Category tree — L0 → L1 → L2
export interface SubcategoryNode {
  id: string;
  name: string;
  children: SubcategoryNode[]; // empty = leaf (L1); populated = L1 with L2 children
}

export interface CategoryNode {
  id: string;
  name: string;
  subcategories: SubcategoryNode[];
}

export interface ReportMeta {
  title: string;
  period: string;
  published: boolean;
  executiveSummary: string;
  summaryUpdatedAt?: string;
}

// Prompt versioning
export interface PromptVersion {
  version: number;
  systemPrompt: string;
  userPromptTemplate: string;
  savedAt: string; // ISO date string
  note: string;
}

export interface PromptConfig {
  current: PromptVersion;
  history: PromptVersion[]; // newest-first, max 10
}

// Risk scorecard types (Supply Chain Risk sections)
export interface RiskDimension {
  score: number; // 1-5
  description: string;
}

export interface RiskRegion {
  name: string;
  score: number; // 1-5
  description: string;
}

export interface RiskScorecardData {
  overallScore: number; // 1-10
  likelihood: RiskDimension;
  impact: RiskDimension;
  velocity: RiskDimension;
  regions: [RiskRegion, RiskRegion, RiskRegion, RiskRegion];
}

// Freight trend indicators (Transport & Logistics sections)
export interface FreightTrendDimension {
  level: 1 | 2 | 3 | 4 | 5; // 1 = best for buyers, 5 = worst
  note: string;              // 1–2 sentence context
  headline?: string;         // short display value e.g. "$3,200/FEU", "62%"
}

export interface FreightTrendData {
  rates: FreightTrendDimension;        // 1=Very Low … 5=Very High
  capacity: FreightTrendDimension;     // 1=Surplus … 5=Tight
  availability: FreightTrendDimension; // 1=Excellent … 5=Critical
}

export interface DataContextValue {
  // Existing
  sections: ReportSection[];
  getSectionById: (id: string) => ReportSection | undefined;
  updateSection: (id: string, updates: Partial<ReportSection>) => void;

  // Category tree
  categoryTree: CategoryNode[];
  addCategory: (name: string) => void;
  renameCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => void;
  addSubcategory: (parentId: string, name: string) => void;
  addL2Subcategory: (l1Id: string, name: string) => void;
  renameSubcategory: (id: string, name: string) => void;
  deleteSubcategory: (id: string) => void;
  reorderCategory: (id: string, direction: "up" | "down") => void;
  reorderSubcategory: (categoryId: string, subcategoryId: string, direction: "up" | "down") => void;

  // Section CRUD
  addSection: (section: Omit<ReportSection, "lastUpdated">) => void;
  deleteSection: (id: string) => void;

  // SME management
  smeList: string[];
  updateSmeList: (smes: string[]) => void;

  // Report metadata
  reportMeta: ReportMeta;
  updateReportMeta: (meta: Partial<ReportMeta>) => void;
  isSummaryLoading: boolean;
  isSummaryStale: boolean;
  regenerateSummary: () => Promise<void>;

  // Prompt management
  promptConfig: PromptConfig;
  saveUniversalPrompt: (systemPrompt: string, userPromptTemplate: string, note: string) => void;
  rollbackUniversalPrompt: (version: number) => void;
  setSectionPromptOverride: (sectionId: string, override: SectionPromptOverride) => void;
  clearSectionPromptOverride: (sectionId: string) => void;

  // Risk scorecards
  scorecards: Record<string, RiskScorecardData>;
  updateScorecard: (sectionId: string, data: RiskScorecardData) => void;

  // Freight trend indicators
  freightTrends: Record<string, FreightTrendData>;
  updateFreightTrend: (sectionId: string, data: FreightTrendData) => void;
}

export const STATUS_LABELS: Record<SectionStatus, string> = {
  pending: "Pending",
  draft: "Draft",
  in_review: "In Review",
  revision_needed: "Revision Needed",
  approved: "Approved",
};

export const STATUS_COLORS: Record<SectionStatus, string> = {
  pending: "bg-zinc-700 text-zinc-300",
  draft: "bg-blue-900 text-blue-200",
  in_review: "bg-yellow-900 text-yellow-200",
  revision_needed: "bg-orange-900 text-orange-200",
  approved: "bg-green-900 text-green-200",
};

// Valid status transitions
export const STATUS_TRANSITIONS: Record<SectionStatus, SectionStatus[]> = {
  pending: ["draft"],
  draft: ["in_review"],
  in_review: ["approved", "revision_needed"],
  revision_needed: ["in_review"],
  approved: ["revision_needed"],
};

export const STATUS_TRANSITION_LABELS: Record<string, string> = {
  "pending→draft": "Start Draft",
  "draft→in_review": "Submit for Review",
  "in_review→approved": "Approve",
  "in_review→revision_needed": "Request Revision",
  "revision_needed→in_review": "Resubmit for Review",
  "approved→revision_needed": "Reopen",
};
