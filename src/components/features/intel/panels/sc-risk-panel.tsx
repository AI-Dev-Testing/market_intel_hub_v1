// src/components/features/intel/panels/sc-risk-panel.tsx
"use client";

import { useState } from "react";
import { useData } from "@/contexts/data-context";
import { SECTION_CHARTS } from "@/lib/data/chart-registry";
import { RagBadge } from "../rag-badge";
import { DeltaChip } from "../delta-chip";
import { DomainSignal, RagStatus } from "@/lib/data/intel-seed";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { cn } from "@/lib/utils";

interface SubRisk {
  sectionId: string;
  label: string;
  previousScore: number;
}

const SUB_RISKS: SubRisk[] = [
  { sectionId: "sc-compliance",   label: "Compliance & ESG",          previousScore: 9 },
  { sectionId: "sc-climate",      label: "Natural Hazard & Climate",  previousScore: 7 },
  { sectionId: "sc-logistics",    label: "Logistics & Transportation", previousScore: 6 },
  { sectionId: "sc-geopolitical", label: "Geopolitical & Trade",      previousScore: 5 },
];

function scoreToRag(score: number): RagStatus {
  if (score <= 3) return "green";
  if (score <= 6) return "amber";
  return "red";
}

function scoreToLabel(score: number): string {
  if (score <= 2) return "Low";
  if (score <= 3) return "Moderate";
  if (score <= 6) return "Elevated";
  if (score <= 8) return "High";
  return "Critical";
}

const SCORE_COLOR: Record<RagStatus, string> = {
  green: "text-green-400",
  amber: "text-amber-400",
  red:   "text-red-400",
};

const CARD_BORDER: Record<RagStatus, string> = {
  green: "border-green-900/50 bg-emerald-950/20",
  amber: "border-amber-900/40 bg-amber-950/15",
  red:   "border-red-900/40 bg-red-950/15",
};

interface ScRiskPanelProps {
  domain: DomainSignal;
}

export function ScRiskPanel({ domain }: ScRiskPanelProps) {
  const { scorecards, sections } = useData();
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  const scSections = sections.filter((s) => s.category === "Supply Chain Risks" && s.id !== "sc-overview");
  const approvedCount = scSections.filter((s) => s.status === "approved").length;

  const activeSection = activeSectionId ? sections.find((s) => s.id === activeSectionId) : null;
  const ActiveChart = activeSectionId ? SECTION_CHARTS[activeSectionId] : undefined;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">{domain.label}</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            {approvedCount}/{scSections.length} sections approved
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RagBadge rag={domain.rag} label={domain.ragLabel} />
          <DeltaChip direction={domain.deltaDirection} value={domain.delta} />
        </div>
      </div>

      {/* Sub-risk cards */}
      <div>
        <p className="text-xs font-medium text-zinc-500 mb-3 uppercase tracking-wide">
          Risk Categories
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SUB_RISKS.map(({ sectionId, label, previousScore }) => {
            const scorecard = scorecards[sectionId];
            const score = scorecard?.overallScore ?? 0;
            const rag = scoreToRag(score);
            const ragLabel = scoreToLabel(score);
            const delta = score - previousScore;
            const isActive = activeSectionId === sectionId;

            return (
              <button
                key={sectionId}
                onClick={() => setActiveSectionId(isActive ? null : sectionId)}
                className={cn(
                  "text-left rounded-lg border p-4 transition-all",
                  CARD_BORDER[rag],
                  isActive ? "ring-2 ring-zinc-500" : "hover:ring-1 hover:ring-zinc-600"
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-xs font-medium text-zinc-400 leading-tight">{label}</p>
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded-full shrink-0 font-medium",
                    rag === "red"   ? "bg-red-900/50 text-red-400" :
                    rag === "amber" ? "bg-amber-900/50 text-amber-400" :
                                     "bg-emerald-900/50 text-emerald-400"
                  )}>
                    {ragLabel}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("text-2xl font-bold tabular-nums", SCORE_COLOR[rag])}>
                    {score}
                    <span className="text-sm font-normal text-zinc-600">/10</span>
                  </span>
                  <span className={cn(
                    "text-xs font-medium",
                    delta > 0 ? "text-red-400" : delta < 0 ? "text-green-400" : "text-zinc-500"
                  )}>
                    {delta > 0 ? `↑ +${delta}` : delta < 0 ? `↓ ${delta}` : "→ flat"}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-1.5">
                  Prev: {previousScore}/10 · {isActive ? "Close ✕" : "View detail →"}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Expanded section detail */}
      {activeSection && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-200">{activeSection.title}</h3>
            <button
              onClick={() => setActiveSectionId(null)}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Close ✕
            </button>
          </div>

          {/* Scorecard chart (already renders dimensions + regions) */}
          {ActiveChart && (
            <div className="border-b border-zinc-800 pb-4">
              <ActiveChart />
            </div>
          )}

          {/* Draft content */}
          {activeSection.draft && (
            <div className="border-t border-zinc-800 pt-4">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">
                Intelligence Brief
              </p>
              <MarkdownContent
                content={activeSection.draft}
                className="text-sm text-zinc-300 leading-relaxed"
              />
            </div>
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
