// src/components/features/intel/panel-placeholder.tsx
// Temporary placeholder content for drill-down panels.
// Each domain panel will be replaced in Phase 1-B through 1-D.

import { RagBadge } from "./rag-badge";
import { DeltaChip } from "./delta-chip";
import { DomainSignal } from "@/lib/data/intel-seed";

interface PanelPlaceholderProps {
  domain: DomainSignal;
}

export function PanelPlaceholder({ domain }: PanelPlaceholderProps) {
  return (
    <div className="p-6 space-y-6">
      {/* Domain summary header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">{domain.label}</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Detailed drill-down — coming in next build phase</p>
        </div>
        <div className="flex items-center gap-2">
          <RagBadge rag={domain.rag} label={domain.ragLabel} />
          <DeltaChip direction={domain.deltaDirection} value={domain.delta} />
        </div>
      </div>

      {/* Signal preview */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Top Signals</p>
        <ul className="space-y-2">
          {domain.signals.map((signal, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-zinc-300 leading-snug">
              <span className="text-zinc-600 flex-shrink-0 mt-0.5">•</span>
              <span>{signal}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Placeholder state */}
      <div className="rounded-lg border border-dashed border-zinc-700 bg-zinc-900/20 p-8 text-center space-y-2">
        <p className="text-sm font-medium text-zinc-400">Detailed analysis coming soon</p>
        <p className="text-xs text-zinc-600">
          Charts, dimensional breakdowns, and topic-level drill-downs will appear here in the next phase.
        </p>
      </div>
    </div>
  );
}
