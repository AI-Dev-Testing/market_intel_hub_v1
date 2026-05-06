// src/components/features/intel/signal-strip.tsx
"use client";

import { cn } from "@/lib/utils";
import { INTEL_SEED, RagStatus, scoreToRag, scoreToLabel } from "@/lib/data/intel-seed";
import { useData } from "@/contexts/data-context";

const RAG_STRIP: Record<RagStatus, string> = {
  green: "border-green-700/40 text-green-400 hover:bg-green-950/40",
  amber: "border-amber-700/40 text-amber-400 hover:bg-amber-950/40",
  red:   "border-red-700/40 text-red-400 hover:bg-red-950/40",
};

const RAG_DOT: Record<RagStatus, string> = {
  green: "bg-green-400",
  amber: "bg-amber-400",
  red:   "bg-red-400",
};

const ARROW: Record<string, string> = { up: "↑", down: "↓", flat: "→" };
const ARROW_COLOR: Record<string, string> = { up: "text-red-400", down: "text-green-400", flat: "text-zinc-500" };

interface SignalStripProps {
  activePanel: string | null;
  onDomainClick: (drillPath: string) => void;
}

export function SignalStrip({ activePanel, onDomainClick }: SignalStripProps) {
  const { scorecards } = useData();

  // Compute live SC risk composite from scorecards (average of 4 SC sections)
  const scIds = ["sc-compliance", "sc-climate", "sc-logistics", "sc-geopolitical"];
  const scScores = scIds.map((id) => scorecards[id]?.overallScore ?? 0);
  const scComposite = Math.round(scScores.reduce((a, b) => a + b, 0) / scScores.length);
  const scRag = scoreToRag(scComposite);
  const scLabel = scoreToLabel(scComposite);

  // Overall posture = highest single domain score
  const allScores = INTEL_SEED.domains.map((d) =>
    d.id === "sc-risk" ? scComposite : d.compositeScore
  );
  const overallScore = Math.max(...allScores);
  const overallRag = scoreToRag(overallScore);
  const overallLabel = scoreToLabel(overallScore);

  return (
    <div className="border-b border-zinc-800 bg-zinc-900/60 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-[1920px] px-4 sm:px-6 lg:px-10 py-2.5 flex items-center gap-3 flex-wrap">
        {/* Overall posture */}
        <div className="flex items-center gap-2 pr-3 border-r border-zinc-700/50">
          <span className="text-xs text-zinc-500 font-medium uppercase tracking-wide">Posture</span>
          <span className={cn(
            "text-xs font-semibold px-2 py-0.5 rounded-full border",
            overallRag === "red" ? "bg-red-950/60 border-red-700/50 text-red-300" :
            overallRag === "amber" ? "bg-amber-950/60 border-amber-700/50 text-amber-300" :
            "bg-green-950/60 border-green-700/50 text-green-300"
          )}>
            {overallLabel}
          </span>
        </div>

        {/* Domain chips */}
        <div className="flex items-center gap-2 flex-wrap">
          {INTEL_SEED.domains.map((domain) => {
            const rag = domain.id === "sc-risk" ? scRag : domain.rag;
            const label = domain.id === "sc-risk" ? scLabel : domain.ragLabel;
            const isActive = activePanel === domain.drillPath;

            return (
              <button
                key={domain.id}
                onClick={() => onDomainClick(domain.drillPath)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-all",
                  RAG_STRIP[rag],
                  isActive ? "ring-1 ring-offset-1 ring-offset-zinc-900 ring-current bg-zinc-800/60" : "bg-zinc-900/40"
                )}
              >
                <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", RAG_DOT[rag])} />
                <span className="text-zinc-300">{domain.label}</span>
                <span className={cn("text-xs", ARROW_COLOR[domain.deltaDirection])}>
                  {ARROW[domain.deltaDirection]}
                </span>
                <span className="text-zinc-500">{label}</span>
              </button>
            );
          })}
        </div>

        <div className="ml-auto text-xs text-zinc-600">{INTEL_SEED.lastUpdated}</div>
      </div>
    </div>
  );
}
