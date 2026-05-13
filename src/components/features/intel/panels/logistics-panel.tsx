// src/components/features/intel/panels/logistics-panel.tsx
"use client";

import { useState } from "react";
import { useData } from "@/contexts/data-context";
import { SECTION_CHARTS } from "@/lib/data/chart-registry";
import { RagBadge } from "../rag-badge";
import { DeltaChip } from "../delta-chip";
import { DomainSignal } from "@/lib/data/intel-seed";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { TLOverviewChart } from "@/components/charts/tl-overview-chart";
import { cn } from "@/lib/utils";

const RATES_LABELS: Record<number, string> = { 1: "Very Low", 2: "Low", 3: "Moderate", 4: "Elevated", 5: "Very High" };
const CAPACITY_LABELS: Record<number, string> = { 1: "Surplus", 2: "Ample", 3: "Balanced", 4: "Constrained", 5: "Tight" };
const AVAILABILITY_LABELS: Record<number, string> = { 1: "Excellent", 2: "Good", 3: "Normal", 4: "Limited", 5: "Critical" };
const ARROWS: Record<number, string> = { 1: "↓↓", 2: "↓", 3: "→", 4: "↑", 5: "↑↑" };

function levelColor(level: number) {
  if (level <= 2) return { text: "text-emerald-400", bg: "bg-emerald-950/30", border: "border-emerald-900/50" };
  if (level === 3) return { text: "text-amber-400",   bg: "bg-amber-950/20",   border: "border-amber-900/40"   };
  if (level === 4) return { text: "text-orange-400",  bg: "bg-orange-950/20",  border: "border-orange-900/40"  };
  return               { text: "text-red-400",    bg: "bg-red-950/20",    border: "border-red-900/40"    };
}

interface SubMode {
  sectionId: string;
  label: string;
  headline: string;
  sub: string;
}

const SUB_MODES: SubMode[] = [
  { sectionId: "tl-ocean-rates",  label: "Ocean Freight",  headline: "$3,200/FEU", sub: "FBX composite" },
  { sectionId: "tl-air-rates",    label: "Air Freight",    headline: "$2.85/kg",   sub: "Asia–US WC lane" },
  { sectionId: "tl-trade-lanes",  label: "Trade Lanes",    headline: "62% on-time", sub: "Schedule reliability" },
];

interface LogisticsPanelProps {
  domain: DomainSignal;
}

export function LogisticsPanel({ domain }: LogisticsPanelProps) {
  const { sections, freightTrends } = useData();
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  const tlSections = sections.filter((s) => s.category === "Transport & Logistics" && s.id !== "tl-overview");
  const approvedCount = sections.filter((s) => s.category === "Transport & Logistics" && s.status === "approved").length;

  const activeSection = activeSectionId ? sections.find((s) => s.id === activeSectionId) : null;
  const ActiveChart = activeSectionId ? SECTION_CHARTS[activeSectionId] : undefined;
  const activeTrend = activeSectionId ? freightTrends[activeSectionId] : null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">{domain.label}</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            {approvedCount}/{tlSections.length + 1} sections approved
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RagBadge rag={domain.rag} label={domain.ragLabel} />
          <DeltaChip direction={domain.deltaDirection} value={domain.delta} />
        </div>
      </div>

      {/* Overview chart — always visible */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-4">Market Overview</p>
        <TLOverviewChart />
      </div>

      {/* Sub-mode cards */}
      <div>
        <p className="text-xs font-medium text-zinc-500 mb-3 uppercase tracking-wide">Drill Down</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SUB_MODES.map(({ sectionId, label, headline, sub }) => {
            const trend = freightTrends[sectionId];
            const ratesLevel = trend?.rates?.level ?? 3;
            const liveHeadline = trend?.rates?.headline ?? headline;
            const c = levelColor(ratesLevel);
            const isActive = activeSectionId === sectionId;

            return (
              <button
                key={sectionId}
                onClick={() => setActiveSectionId(isActive ? null : sectionId)}
                className={cn(
                  "text-left rounded-lg border p-4 transition-all",
                  c.bg, c.border,
                  isActive ? "ring-2 ring-zinc-500" : "hover:ring-1 hover:ring-zinc-600"
                )}
              >
                <p className="text-xs font-medium text-zinc-400 mb-2">{label}</p>
                <p className={cn("text-xl font-bold tabular-nums", c.text)}>{liveHeadline}</p>
                <p className="text-xs text-zinc-500 mt-1">{sub}</p>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-800/60">
                  <span className={cn("text-xs font-semibold", c.text)}>
                    {ARROWS[ratesLevel]} {RATES_LABELS[ratesLevel]}
                  </span>
                  <span className="text-xs text-zinc-600">
                    {isActive ? "Close ✕" : "View chart →"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Expanded detail */}
      {activeSection !== undefined && activeSectionId && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-200">
              {SUB_MODES.find((m) => m.sectionId === activeSectionId)?.label}
            </h3>
            <button
              onClick={() => setActiveSectionId(null)}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Close ✕
            </button>
          </div>

          {/* Chart */}
          {ActiveChart && (
            <div className="border-b border-zinc-800 pb-4">
              <ActiveChart />
            </div>
          )}

          {/* Freight conditions for this mode */}
          {activeTrend && (
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-3">Freight Conditions</p>
              <div className="grid grid-cols-3 gap-3">
                {(["rates", "capacity", "availability"] as const).map((dim) => {
                  const d = activeTrend[dim];
                  const labels = dim === "rates" ? RATES_LABELS : dim === "capacity" ? CAPACITY_LABELS : AVAILABILITY_LABELS;
                  const c = levelColor(d.level);
                  return (
                    <div key={dim} className={cn("rounded-lg border p-3", c.bg, c.border)}>
                      <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5 capitalize">{dim}</p>
                      <p className={cn("text-sm font-bold", c.text)}>
                        {ARROWS[d.level]} {labels[d.level]}
                      </p>
                      {d.headline && <p className={cn("text-xs font-semibold mt-0.5", c.text)}>{d.headline}</p>}
                      <p className="text-xs text-zinc-500 mt-1 leading-snug">{d.note}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Draft if available */}
          {activeSection?.draft ? (
            <div className="border-t border-zinc-800 pt-4">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">Intelligence Brief</p>
              <MarkdownContent content={activeSection.draft} className="text-sm text-zinc-300 leading-relaxed" />
            </div>
          ) : (
            <p className="text-xs text-zinc-600 border-t border-zinc-800 pt-4">
              No draft yet — section is pending.
            </p>
          )}
        </div>
      )}

      {/* Top signals */}
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
    </div>
  );
}
