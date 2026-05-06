// src/components/features/intel/rag-badge.tsx
import { cn } from "@/lib/utils";
import { RagStatus } from "@/lib/data/intel-seed";

const RAG_STYLES: Record<RagStatus, string> = {
  green: "bg-green-950/60 border-green-700/50 text-green-400",
  amber: "bg-amber-950/60 border-amber-700/50 text-amber-400",
  red:   "bg-red-950/60 border-red-700/50 text-red-400",
};

const RAG_DOT: Record<RagStatus, string> = {
  green: "bg-green-400",
  amber: "bg-amber-400",
  red:   "bg-red-400",
};

interface RagBadgeProps {
  rag: RagStatus;
  label: string;
  size?: "sm" | "md";
}

export function RagBadge({ rag, label, size = "md" }: RagBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
        RAG_STYLES[rag]
      )}
    >
      <span className={cn("rounded-full flex-shrink-0", RAG_DOT[rag], size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2")} />
      {label}
    </span>
  );
}
