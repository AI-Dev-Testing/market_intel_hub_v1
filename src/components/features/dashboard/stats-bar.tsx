"use client";

import { ReportSection, SectionStatus, STATUS_LABELS } from "@/types";
import { cn } from "@/lib/utils";

interface StatsBarProps {
  sections: ReportSection[];
  selectedStatus: SectionStatus | null;
  onStatusSelect: (status: SectionStatus | null) => void;
}

const STATUS_ORDER: SectionStatus[] = [
  "pending", "draft", "in_review", "revision_needed", "approved"
];

export function StatsBar({ sections, selectedStatus, onStatusSelect }: StatsBarProps) {
  const counts = STATUS_ORDER.reduce<Record<SectionStatus, number>>(
    (acc, status) => {
      acc[status] = sections.filter((s) => s.status === status).length;
      return acc;
    },
    {} as Record<SectionStatus, number>
  );

  return (
    <div className="grid grid-cols-5 gap-3 mb-6">
      {STATUS_ORDER.map((status) => {
        const isSelected = selectedStatus === status;
        return (
          <button
            key={status}
            onClick={() => onStatusSelect(isSelected ? null : status)}
            className={cn(
              "bg-zinc-900 rounded-lg p-4 border text-left transition-all",
              isSelected
                ? "border-zinc-500 ring-1 ring-zinc-500"
                : "border-zinc-800 hover:border-zinc-600"
            )}
          >
            <div className="text-2xl font-bold text-zinc-100">{counts[status]}</div>
            <div className="text-xs text-zinc-400 mt-1">{STATUS_LABELS[status]}</div>
            {isSelected && (
              <div className="text-xs text-zinc-500 mt-1">Click to clear</div>
            )}
          </button>
        );
      })}
    </div>
  );
}
