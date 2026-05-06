// src/components/features/intel/panels/macro-panel.tsx
"use client";

import { useState } from "react";
import { MACRO_INDICATORS, IndicatorStatus } from "@/lib/data/macro-indicators";
import { SECTION_CHARTS } from "@/lib/data/chart-registry";
import { useData } from "@/contexts/data-context";
import { RagBadge } from "../rag-badge";
import { DeltaChip } from "../delta-chip";
import { DomainSignal } from "@/lib/data/intel-seed";
import { MarkdownContent } from "@/components/ui/markdown-content";

const STATUS_CONFIG: Record<
  IndicatorStatus,
  { bg: string; border: string; pill: string; pillText: string }
> = {
  positive: {
    bg: "bg-emerald-950/30",
    border: "border-emerald-900/50",
    pill: "bg-emerald-900/60",
    pillText: "text-emerald-400",
  },
  caution: {
    bg: "bg-amber-950/20",
    border: "border-amber-900/40",
    pill: "bg-amber-900/50",
    pillText: "text-amber-400",
  },
  elevated: {
    bg: "bg-orange-950/20",
    border: "border-orange-900/40",
    pill: "bg-orange-900/50",
    pillText: "text-orange-400",
  },
  critical: {
    bg: "bg-red-950/20",
    border: "border-red-900/40",
    pill: "bg-red-900/50",
    pillText: "text-red-400",
  },
};

const TREND_ARROWS: Record<string, string> = {
  up: "↑",
  down: "↓",
  stable: "→",
  mixed: "↕",
};

// Map indicator labels to section IDs
const INDICATOR_SECTION_MAP: Record<string, string> = {
  "Manufacturing PMI": "macro-pmi",
  "GDP Growth": "macro-gdp",
  "FX Risk": "macro-fx",
  "Central Bank Rates": "macro-rates",
  "Energy Prices": "macro-energy",
  "Equity Volatility (VIX)": "macro-vix",
};

interface MacroPanelProps {
  domain: DomainSignal;
}

export function MacroPanel({ domain }: MacroPanelProps) {
  const { sections } = useData();
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  const macroSections = sections.filter((s) => s.category === "Macroeconomic Outlook");
  const approvedCount = macroSections.filter((s) => s.status === "approved").length;

  const activeSection = activeSectionId
    ? sections.find((s) => s.id === activeSectionId)
    : null;
  const ActiveChart = activeSectionId ? SECTION_CHARTS[activeSectionId] : undefined;

  return (
    <div className="p-6 space-y-6">
      {/* Domain summary header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">{domain.label}</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            {approvedCount}/{macroSections.length} sections approved
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RagBadge rag={domain.rag} label={domain.ragLabel} />
          <DeltaChip direction={domain.deltaDirection} value={domain.delta} />
        </div>
      </div>

      {/* KPI Indicator Cards */}
      <div>
        <p className="text-xs font-medium text-zinc-500 mb-3 uppercase tracking-wide">
          Key Indicators
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {MACRO_INDICATORS.map((ind) => {
            const cfg = STATUS_CONFIG[ind.status];
            const sectionId = INDICATOR_SECTION_MAP[ind.label];
            const isActive = activeSectionId === sectionId;
            return (
              <button
                key={ind.label}
                onClick={() => setActiveSectionId(isActive ? null : sectionId)}
                title={ind.signal}
                className="text-left group"
              >
                <div
                  className={`rounded-lg border p-3 h-full flex flex-col justify-between transition-all ${cfg.bg} ${cfg.border} ${
                    isActive
                      ? "ring-2 ring-zinc-500"
                      : "group-hover:ring-1 group-hover:ring-zinc-600"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-xs font-medium text-zinc-400 leading-tight">
                      {ind.label}
                    </p>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 ${cfg.pill} ${cfg.pillText}`}
                    >
                      {TREND_ARROWS[ind.trend]} {ind.trendLabel}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-zinc-100 mb-0.5">
                    {ind.primary}
                  </p>
                  {ind.secondary && (
                    <p className="text-xs text-zinc-500">{ind.secondary}</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Expanded section detail — read-only chart + draft content */}
      {activeSection && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-200">{activeSection.title}</h3>
            <button
              onClick={() => setActiveSectionId(null)}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Close ✕
            </button>
          </div>

          {ActiveChart && (
            <div className="border-b border-zinc-800 pb-4">
              <ActiveChart />
            </div>
          )}

          {activeSection.draft && (
            <MarkdownContent content={activeSection.draft} className="text-sm text-zinc-300 leading-relaxed" />
          )}
        </div>
      )}

      {/* Signal bullets */}
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
