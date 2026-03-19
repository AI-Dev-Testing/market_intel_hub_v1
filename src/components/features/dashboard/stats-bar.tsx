// src/components/features/dashboard/stats-bar.tsx
import { ReportSection, SectionStatus, STATUS_LABELS, STATUS_COLORS } from "@/types";

interface StatsBarProps {
  sections: ReportSection[];
}

const STATUS_ORDER: SectionStatus[] = [
  "pending", "draft", "in_review", "revision_needed", "approved"
];

export function StatsBar({ sections }: StatsBarProps) {
  const counts = STATUS_ORDER.reduce<Record<SectionStatus, number>>(
    (acc, status) => {
      acc[status] = sections.filter((s) => s.status === status).length;
      return acc;
    },
    {} as Record<SectionStatus, number>
  );

  return (
    <div className="grid grid-cols-5 gap-3 mb-6">
      {STATUS_ORDER.map((status) => (
        <div key={status} className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
          <div className="text-2xl font-bold text-zinc-100">{counts[status]}</div>
          <div className="text-xs text-zinc-400 mt-1">{STATUS_LABELS[status]}</div>
        </div>
      ))}
    </div>
  );
}
