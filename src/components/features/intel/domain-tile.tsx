// src/components/features/intel/domain-tile.tsx
"use client";

import { cn } from "@/lib/utils";
import { DomainSignal, RagStatus } from "@/lib/data/intel-seed";
import { RagBadge } from "./rag-badge";
import { DeltaChip } from "./delta-chip";

const TILE_ACCENT: Record<RagStatus, string> = {
  green: "border-l-green-600",
  amber: "border-l-amber-500",
  red:   "border-l-red-600",
};

const SCORE_COLOR: Record<RagStatus, string> = {
  green: "text-green-400",
  amber: "text-amber-400",
  red:   "text-red-400",
};

interface DomainTileProps {
  domain: DomainSignal;
  rag?: RagStatus;       // override for live-computed values (e.g. SC risk)
  ragLabel?: string;
  compositeScore?: number;
  isActive: boolean;
  onClick: () => void;
}

export function DomainTile({ domain, rag, ragLabel, compositeScore, isActive, onClick }: DomainTileProps) {
  const effectiveRag = rag ?? domain.rag;
  const effectiveLabel = ragLabel ?? domain.ragLabel;
  const effectiveScore = compositeScore ?? domain.compositeScore;

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex flex-col gap-3 p-5 rounded-lg border border-l-4 text-left transition-all duration-200",
        "bg-zinc-900 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/80",
        TILE_ACCENT[effectiveRag],
        isActive && "ring-1 ring-zinc-500 bg-zinc-800/80 border-zinc-600"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">
            {domain.label}
          </p>
          <div className="flex items-center gap-2">
            <span className={cn("text-2xl font-bold tabular-nums", SCORE_COLOR[effectiveRag])}>
              {effectiveScore}
              <span className="text-sm font-normal text-zinc-600">/10</span>
            </span>
            <DeltaChip direction={domain.deltaDirection} value={domain.delta} />
          </div>
        </div>
        <RagBadge rag={effectiveRag} label={effectiveLabel} />
      </div>

      {/* Signal bullets */}
      <ul className="space-y-1.5 flex-1">
        {domain.signals.map((signal, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-zinc-400 leading-snug">
            <span className="text-zinc-600 flex-shrink-0 mt-0.5">•</span>
            <span>{signal}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
        <span className="text-xs text-zinc-600">
          Prev: <span className="text-zinc-500">{domain.previousScore}/10</span>
        </span>
        <span className={cn(
          "text-xs font-medium transition-colors",
          isActive ? "text-zinc-300" : "text-zinc-500 group-hover:text-zinc-300"
        )}>
          {isActive ? "Close ✕" : "Explore →"}
        </span>
      </div>
    </button>
  );
}
