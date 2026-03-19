// src/components/features/dashboard/section-card.tsx
import Link from "next/link";
import { ReportSection, STATUS_LABELS, STATUS_COLORS } from "@/types";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  section: ReportSection;
}

export function SectionCard({ section }: SectionCardProps) {
  return (
    <Link href={`/sections/${section.id}`}>
      <div className="group bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-600 transition-colors cursor-pointer">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-sm font-medium text-zinc-100 group-hover:text-white leading-tight">
            {section.title}
          </h3>
          <span className={cn("text-xs px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0", STATUS_COLORS[section.status])}>
            {STATUS_LABELS[section.status]}
          </span>
        </div>
        <p className="text-xs text-zinc-500 mb-3">{section.subcategory}</p>
        {section.draft ? (
          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
            {section.draft}
          </p>
        ) : (
          <p className="text-xs text-zinc-600 italic">No draft yet</p>
        )}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800">
          <span className="text-xs text-zinc-500">
            {section.assignedSme || <span className="text-zinc-600 italic">Unassigned</span>}
          </span>
          <span className="text-xs text-zinc-600">{section.lastUpdated}</span>
        </div>
      </div>
    </Link>
  );
}
