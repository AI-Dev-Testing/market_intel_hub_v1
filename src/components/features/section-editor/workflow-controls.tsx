"use client";

import { Button } from "@/components/ui/button";
import {
  ReportSection,
  SectionStatus,
  STATUS_LABELS,
  STATUS_TRANSITIONS,
  STATUS_TRANSITION_LABELS,
  STATUS_COLORS,
} from "@/types";
import { cn } from "@/lib/utils";

interface WorkflowControlsProps {
  section: ReportSection;
  onStatusChange: (newStatus: SectionStatus) => void;
}

const PIPELINE: SectionStatus[] = ["pending", "draft", "in_review", "approved"];

const PIPELINE_LABELS: Record<SectionStatus, string> = {
  pending: "Pending",
  draft: "Draft",
  in_review: "Review",
  approved: "Approved",
  revision_needed: "Revision",
};

export function WorkflowControls({ section, onStatusChange }: WorkflowControlsProps) {
  const nextStatuses = STATUS_TRANSITIONS[section.status];
  const currentIdx = PIPELINE.indexOf(section.status);
  const isRevision = section.status === "revision_needed";

  const getButtonVariant = (nextStatus: SectionStatus) => {
    if (nextStatus === "approved") return "default";
    if (nextStatus === "revision_needed") return "destructive";
    return "outline";
  };

  return (
    <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-900">
      <h3 className="text-sm font-medium text-zinc-300 mb-4">Workflow</h3>

      {/* Pipeline Stepper */}
      <div className="flex items-center mb-4">
        {PIPELINE.map((stage, idx) => {
          const isPast = !isRevision && currentIdx > idx;
          const isCurrent = stage === section.status && !isRevision;

          return (
            <div key={stage} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors",
                    isPast
                      ? "bg-green-700 border-green-600 text-green-100"
                      : isCurrent
                      ? "bg-zinc-700 border-zinc-400 text-zinc-100"
                      : "bg-zinc-800 border-zinc-700 text-zinc-600"
                  )}
                >
                  {isPast ? "✓" : idx + 1}
                </div>
                <span
                  className={cn(
                    "text-xs mt-1 text-center",
                    isCurrent ? "text-zinc-200" : isPast ? "text-green-500" : "text-zinc-600"
                  )}
                >
                  {PIPELINE_LABELS[stage]}
                </span>
              </div>
              {idx < PIPELINE.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-1 mb-4 transition-colors",
                    isPast ? "bg-green-700" : "bg-zinc-800"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Revision badge */}
      {isRevision && (
        <div className="mb-3 px-3 py-2 bg-orange-950/50 border border-orange-900/50 rounded-md">
          <p className="text-xs text-orange-400 font-medium">⚠ Revision Requested</p>
          <p className="text-xs text-orange-500/70 mt-0.5">Address feedback, then resubmit for review</p>
        </div>
      )}

      {/* Current status badge */}
      {!isRevision && (
        <div className="mb-3">
          <span className={cn("text-xs px-2 py-1 rounded-full", STATUS_COLORS[section.status])}>
            {STATUS_LABELS[section.status]}
          </span>
        </div>
      )}

      {/* Action buttons */}
      {nextStatuses.length > 0 ? (
        <div className="flex flex-col gap-2">
          {nextStatuses.map((nextStatus) => {
            const label = STATUS_TRANSITION_LABELS[`${section.status}→${nextStatus}`] || STATUS_LABELS[nextStatus];
            return (
              <Button
                key={nextStatus}
                variant={getButtonVariant(nextStatus)}
                size="sm"
                className="w-full justify-center"
                onClick={() => onStatusChange(nextStatus)}
              >
                {label}
              </Button>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-zinc-500">No transitions available</p>
      )}
    </div>
  );
}
