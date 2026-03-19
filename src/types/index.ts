// src/types/index.ts

export type SectionStatus =
  | "pending"
  | "draft"
  | "in_review"
  | "revision_needed"
  | "approved";

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
}

export interface DataContextValue {
  sections: ReportSection[];
  getSectionById: (id: string) => ReportSection | undefined;
  updateSection: (id: string, updates: Partial<ReportSection>) => void;
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
