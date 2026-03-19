// src/components/features/section-editor/workflow-controls.tsx
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

export function WorkflowControls({ section, onStatusChange }: WorkflowControlsProps) {
  const nextStatuses = STATUS_TRANSITIONS[section.status];

  const getButtonVariant = (nextStatus: SectionStatus): "default" | "destructive" | "outline" => {
    if (nextStatus === "approved") return "default";
    if (nextStatus === "revision_needed") return "destructive";
    return "outline";
  };

  return (
    <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-900">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-zinc-300">Workflow</h3>
        <span className={cn("text-xs px-2 py-1 rounded-full", STATUS_COLORS[section.status])}>
          {STATUS_LABELS[section.status]}
        </span>
      </div>
      {nextStatuses.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {nextStatuses.map((nextStatus) => {
            const label = STATUS_TRANSITION_LABELS[`${section.status}→${nextStatus}`] || STATUS_LABELS[nextStatus];
            return (
              <Button
                key={nextStatus}
                variant={getButtonVariant(nextStatus)}
                size="sm"
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
