"use client";

import { MACRO_INDICATORS, IndicatorStatus } from "@/lib/data/macro-indicators";

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

export function MacroOverviewChart() {
  return (
    <div>
      <p className="text-xs font-medium text-zinc-500 mb-3 uppercase tracking-wide">
        Key Indicators
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {MACRO_INDICATORS.map((ind) => {
          const cfg = STATUS_CONFIG[ind.status];
          return (
            <div
              key={ind.label}
              className={`rounded-lg border p-3 ${cfg.bg} ${cfg.border}`}
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
                <p className="text-xs text-zinc-500 mb-2">{ind.secondary}</p>
              )}
              <p className="text-xs text-zinc-400 leading-snug border-t border-zinc-800 pt-2 mt-1">
                {ind.signal}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
