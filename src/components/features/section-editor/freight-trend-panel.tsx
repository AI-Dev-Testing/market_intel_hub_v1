"use client";

import { useState } from "react";
import { useData } from "@/contexts/data-context";
import { FreightTrendData, FreightTrendDimension } from "@/types";

// ---------- label helpers ----------

const RATES_LABELS: Record<number, string> = {
  1: "Very Low",
  2: "Low",
  3: "Moderate",
  4: "Elevated",
  5: "Very High",
};

const CAPACITY_LABELS: Record<number, string> = {
  1: "Surplus",
  2: "Ample",
  3: "Balanced",
  4: "Constrained",
  5: "Tight",
};

const AVAILABILITY_LABELS: Record<number, string> = {
  1: "Excellent",
  2: "Good",
  3: "Normal",
  4: "Limited",
  5: "Critical",
};

const ARROWS: Record<number, string> = {
  1: "↓↓",
  2: "↓",
  3: "→",
  4: "↑",
  5: "↑↑",
};

function getColors(level: number) {
  if (level <= 2) return {
    bg: "bg-emerald-950/60",
    border: "border-emerald-800/50",
    arrow: "text-emerald-400",
    label: "text-emerald-300",
  };
  if (level === 3) return {
    bg: "bg-amber-950/60",
    border: "border-amber-800/50",
    arrow: "text-amber-400",
    label: "text-amber-300",
  };
  if (level === 4) return {
    bg: "bg-orange-950/60",
    border: "border-orange-800/50",
    arrow: "text-orange-400",
    label: "text-orange-300",
  };
  return {
    bg: "bg-red-950/60",
    border: "border-red-800/50",
    arrow: "text-red-400",
    label: "text-red-300",
  };
}

// ---------- score pill ----------

function ScorePill({
  value,
  active,
  level,
  onClick,
}: {
  value: 1 | 2 | 3 | 4 | 5;
  active: boolean;
  level: number;
  onClick: () => void;
}) {
  const colors = getColors(value);
  return (
    <button
      onClick={onClick}
      className={`w-7 h-7 rounded text-xs font-semibold transition-all ${
        active
          ? `${colors.bg} ${colors.border} border ${colors.label}`
          : "bg-zinc-800 border border-zinc-700 text-zinc-500 hover:border-zinc-500"
      }`}
    >
      {value}
    </button>
  );
}

// ---------- single KPI card ----------

function TrendCard({
  title,
  dim,
  labels,
  onChange,
}: {
  title: string;
  dim: FreightTrendDimension;
  labels: Record<number, string>;
  onChange: (updated: FreightTrendDimension) => void;
}) {
  const colors = getColors(dim.level);

  return (
    <div className={`rounded-lg border p-4 flex flex-col gap-3 ${colors.bg} ${colors.border}`}>
      {/* Header */}
      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">{title}</p>

      {/* Arrow + label */}
      <div className="flex items-baseline gap-2">
        <span className={`text-4xl font-black leading-none ${colors.arrow}`}>
          {ARROWS[dim.level]}
        </span>
        <span className={`text-xl font-bold leading-none ${colors.label}`}>
          {labels[dim.level]}
        </span>
      </div>

      {/* Key Metric */}
      <input
        type="text"
        placeholder="Key metric (e.g. $3,200/FEU)"
        value={dim.headline ?? ""}
        onChange={(e) => onChange({ ...dim, headline: e.target.value })}
        className="w-full text-xs bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
      />

      {/* Note */}
      <textarea
        value={dim.note}
        onChange={(e) => onChange({ ...dim, note: e.target.value })}
        rows={3}
        placeholder="Add context note..."
        className="w-full resize-none rounded bg-zinc-900/70 border border-zinc-700 text-zinc-300 text-xs px-2 py-1.5 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
      />

      {/* Score pills */}
      <div className="flex gap-1.5">
        {([1, 2, 3, 4, 5] as const).map((v) => (
          <ScorePill
            key={v}
            value={v}
            active={dim.level === v}
            level={dim.level}
            onClick={() => onChange({ ...dim, level: v })}
          />
        ))}
      </div>
    </div>
  );
}

// ---------- main panel ----------

interface FreightTrendPanelProps {
  sectionId: string;
}

export function FreightTrendPanel({ sectionId }: FreightTrendPanelProps) {
  const { freightTrends, updateFreightTrend } = useData();
  const data = freightTrends[sectionId];

  // Local state for immediate UI feedback
  const [local, setLocal] = useState<FreightTrendData | null>(data ?? null);

  if (!local) return null;

  const handleChange = (key: keyof FreightTrendData, updated: FreightTrendDimension) => {
    const next = { ...local, [key]: updated };
    setLocal(next);
    updateFreightTrend(sectionId, next);
  };

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
      <p className="text-xs font-medium text-zinc-500 mb-3 uppercase tracking-wide">
        Freight Market Pulse
      </p>
      <div className="grid grid-cols-3 gap-3">
        <TrendCard
          title="Rates"
          dim={local.rates}
          labels={RATES_LABELS}
          onChange={(updated) => handleChange("rates", updated)}
        />
        <TrendCard
          title="Capacity"
          dim={local.capacity}
          labels={CAPACITY_LABELS}
          onChange={(updated) => handleChange("capacity", updated)}
        />
        <TrendCard
          title="Availability"
          dim={local.availability}
          labels={AVAILABILITY_LABELS}
          onChange={(updated) => handleChange("availability", updated)}
        />
      </div>
    </div>
  );
}
