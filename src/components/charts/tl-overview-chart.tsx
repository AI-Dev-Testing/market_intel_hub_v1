"use client";

import { useData } from "@/contexts/data-context";

const FREIGHT_LABELS = ["Very Low", "Low", "Moderate", "Elevated", "Very High"];
const FREIGHT_ARROWS = ["↓↓", "↓", "→", "↑", "↑↑"];

const LEVEL_COLORS = {
  1: { bg: "bg-emerald-950/30", border: "border-emerald-900/50", text: "text-emerald-400" },
  2: { bg: "bg-emerald-950/20", border: "border-emerald-900/40", text: "text-emerald-400" },
  3: { bg: "bg-amber-950/20",   border: "border-amber-900/40",   text: "text-amber-400"   },
  4: { bg: "bg-orange-950/20",  border: "border-orange-900/40",  text: "text-orange-400"  },
  5: { bg: "bg-red-950/20",     border: "border-red-900/40",     text: "text-red-400"     },
};


const MODES = [
  { id: "tl-ocean-rates", label: "Ocean Freight" },
  { id: "tl-air-rates",   label: "Air Freight"   },
  { id: "tl-trade-lanes", label: "Trade Lanes"   },
] as const;

const DIMENSIONS = ["rates", "capacity", "availability"] as const;

const DIMENSION_LABELS: Record<typeof DIMENSIONS[number], string> = {
  rates:        "Rates",
  capacity:     "Capacity",
  availability: "Availability",
};

export function TLOverviewChart() {
  const { freightTrends } = useData();

  const headlineMetrics = [
    {
      label: "FBX Composite",
      value: freightTrends["tl-ocean-rates"]?.rates?.headline ?? "$3,200/FEU",
      sub: "Ocean freight composite",
      level: (freightTrends["tl-ocean-rates"]?.rates?.level ?? 4) as 1 | 2 | 3 | 4 | 5,
    },
    {
      label: "Air Cargo Yield",
      value: freightTrends["tl-air-rates"]?.rates?.headline ?? "$2.85/kg",
      sub: "Asia–US WC lane",
      level: (freightTrends["tl-air-rates"]?.rates?.level ?? 3) as 1 | 2 | 3 | 4 | 5,
    },
    {
      label: "Schedule Reliability",
      value: freightTrends["tl-trade-lanes"]?.capacity?.headline ?? "62%",
      sub: "Industry-wide, Sea-Intelligence",
      level: (freightTrends["tl-trade-lanes"]?.capacity?.level ?? 3) as 1 | 2 | 3 | 4 | 5,
    },
  ];

  return (
    <div className="space-y-5">
      {/* ── Headline KPIs ── */}
      <div>
        <p className="text-xs font-medium text-zinc-500 mb-3 uppercase tracking-wide">
          Headline Metrics
        </p>
        <div className="grid grid-cols-3 gap-3">
          {headlineMetrics.map((m) => {
            const cfg = LEVEL_COLORS[m.level];
            return (
              <div key={m.label} className={`rounded-lg border p-3 ${cfg.bg} ${cfg.border}`}>
                <p className="text-xs font-medium text-zinc-400 mb-1.5">{m.label}</p>
                <p className={`text-sm font-semibold mb-0.5 ${cfg.text}`}>{m.value}</p>
                <p className="text-xs text-zinc-500 leading-snug">{m.sub}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Freight Conditions Matrix (live from context) ── */}
      <div>
        <p className="text-xs font-medium text-zinc-500 mb-3 uppercase tracking-wide">
          Freight Conditions
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                <th className="text-left text-zinc-600 font-medium pb-2 pr-3 w-28" />
                {MODES.map((m) => (
                  <th key={m.id} className="text-center text-zinc-400 font-medium pb-2 px-2">
                    {m.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DIMENSIONS.map((dim) => (
                <tr key={dim} className="border-t border-zinc-800/60">
                  <td className="text-zinc-500 py-2.5 pr-3 font-medium">
                    {DIMENSION_LABELS[dim]}
                  </td>
                  {MODES.map((mode) => {
                    const level = (freightTrends[mode.id]?.[dim]?.level ?? 3) as 1 | 2 | 3 | 4 | 5;
                    const cfg = LEVEL_COLORS[level];
                    return (
                      <td key={mode.id} className="px-2 py-2">
                        <div
                          className={`rounded-md border text-center py-1.5 px-2 ${cfg.bg} ${cfg.border}`}
                        >
                          <span className={`font-semibold ${cfg.text}`}>
                            {FREIGHT_ARROWS[level - 1]} {FREIGHT_LABELS[level - 1]}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Red Sea Alert ── */}
      <div className="flex items-start gap-2 rounded-md border border-orange-900/40 bg-orange-950/20 px-3 py-2.5">
        <span className="text-orange-400 text-xs mt-0.5 shrink-0">⚠</span>
        <p className="text-xs text-orange-200/80 leading-relaxed">
          <strong>Red Sea / Suez:</strong> Cape of Good Hope diversions ongoing — adding ~10–14 days
          transit and ~$800–1,200/FEU cost premium on Asia–Europe lanes. No near-term resolution
          expected.
        </p>
      </div>
    </div>
  );
}
