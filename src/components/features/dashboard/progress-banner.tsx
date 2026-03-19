import { ReportSection } from "@/types";

interface ProgressBannerProps {
  sections: ReportSection[];
}

export function ProgressBanner({ sections }: ProgressBannerProps) {
  const total = sections.length;
  const approved = sections.filter((s) => s.status === "approved").length;
  const inProgress = sections.filter((s) => ["draft", "in_review", "revision_needed"].includes(s.status)).length;
  const pct = total > 0 ? Math.round((approved / total) * 100) : 0;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-zinc-200">Report Completion</span>
        <span className="text-sm font-bold text-zinc-100">{pct}%</span>
      </div>
      <div className="w-full bg-zinc-800 rounded-full h-2 mb-3">
        <div
          className="bg-green-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center gap-4 text-xs text-zinc-500">
        <span className="text-green-400 font-medium">{approved} approved</span>
        <span>{inProgress} in progress</span>
        <span>{total - approved - inProgress} pending</span>
        <span className="ml-auto">{total} total sections</span>
      </div>
    </div>
  );
}
