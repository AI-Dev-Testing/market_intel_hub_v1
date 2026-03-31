import Link from "next/link";
import { ReportSection, SectionStatus, STATUS_LABELS, STATUS_COLORS } from "@/types";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  section: ReportSection;
}

const URGENCY_BORDER: Partial<Record<SectionStatus, string>> = {
  revision_needed: "border-l-orange-500",
  in_review: "border-l-yellow-600",
  approved: "border-l-green-700",
};

const CTA_HINTS: Record<SectionStatus, string> = {
  pending: "Start draft →",
  draft: "Continue editing →",
  in_review: "Awaiting review →",
  revision_needed: "Address feedback →",
  approved: "View section →",
};

export function SectionCard({ section }: SectionCardProps) {
  const urgencyBorder = URGENCY_BORDER[section.status];

  return (
    <Link href={`/sections/${section.id}`}>
      <div
        className={cn(
          "group bg-zinc-900 border border-l-4 rounded-lg p-4 hover:border-zinc-600 transition-colors cursor-pointer h-full flex flex-col",
          urgencyBorder ?? "border-l-zinc-800",
          "border-t-zinc-800 border-r-zinc-800 border-b-zinc-800"
        )}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-sm font-medium text-zinc-100 group-hover:text-white leading-tight">
            {section.title}
          </h3>
          <span className={cn("text-xs px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0", STATUS_COLORS[section.status])}>
            {STATUS_LABELS[section.status]}
          </span>
        </div>
        <p className="text-xs text-zinc-500 mb-3">{section.subcategory}</p>
        <div className="flex-1 space-y-2">
          {section.status === "revision_needed" && section.notes?.trim() ? (
            <div className="bg-orange-950/40 border border-orange-900/40 rounded-md px-2.5 py-1.5">
              <p className="text-xs text-orange-300/80 line-clamp-1 leading-relaxed">
                ⚠ {section.notes}
              </p>
            </div>
          ) : section.draft ? (
            <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
              {section.draft}
            </p>
          ) : (
            <p className="text-xs text-zinc-600 italic">No draft yet</p>
          )}
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800">
          <span className="text-xs text-zinc-500">
            {section.assignedSme || <span className="text-zinc-600 italic">Unassigned</span>}
          </span>
          <span className="text-xs text-zinc-500 group-hover:text-zinc-300 transition-colors">
            {CTA_HINTS[section.status]}
          </span>
        </div>
      </div>
    </Link>
  );
}
