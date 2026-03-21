"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useData } from "@/contexts/data-context";
import { RiskScorecardData, RiskDimension, RiskRegion } from "@/types";

// ---------- colour helpers (mirrors sc-risk-scorecard) ----------

function getRiskLabel(score: number): string {
  if (score <= 2) return "Low";
  if (score === 3) return "Moderate";
  if (score === 4) return "High";
  return "Critical";
}

function getRiskColor(score: number): string {
  if (score <= 2) return "text-emerald-400";
  if (score === 3) return "text-amber-400";
  if (score === 4) return "text-red-400";
  return "text-red-300";
}

function getOverallLabel(score: number): string {
  if (score <= 3) return "Low";
  if (score <= 5) return "Moderate";
  if (score <= 7) return "Elevated";
  if (score <= 9) return "High";
  return "Critical";
}

function getOverallColor(score: number): string {
  if (score <= 3) return "text-emerald-400";
  if (score <= 5) return "text-amber-400";
  if (score <= 7) return "text-orange-400";
  return "text-red-400";
}

// ---------- score pill buttons ----------

function ScorePills({
  value,
  max,
  onChange,
}: {
  value: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => {
        const active = n === value;
        const color =
          n <= 2
            ? active
              ? "bg-emerald-800 text-emerald-300 border-emerald-600"
              : "border-zinc-700 text-zinc-500 hover:border-emerald-700"
            : n === 3
            ? active
              ? "bg-amber-900 text-amber-300 border-amber-600"
              : "border-zinc-700 text-zinc-500 hover:border-amber-700"
            : n === 4
            ? active
              ? "bg-red-900 text-red-300 border-red-700"
              : "border-zinc-700 text-zinc-500 hover:border-red-800"
            : active
            ? "bg-red-950 text-red-300 border-red-600"
            : "border-zinc-700 text-zinc-500 hover:border-red-700";
        return (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`w-7 h-7 text-xs font-semibold rounded border transition-colors ${color}`}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}

// ---------- dimension row ----------

function DimensionEditor({
  title,
  dim,
  onChange,
}: {
  title: string;
  dim: RiskDimension;
  onChange: (d: RiskDimension) => void;
}) {
  const [desc, setDesc] = useState(dim.description);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">{title}</span>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold ${getRiskColor(dim.score)}`}>
            {getRiskLabel(dim.score)}
          </span>
          <ScorePills
            value={dim.score}
            max={5}
            onChange={(v) => onChange({ ...dim, score: v })}
          />
        </div>
      </div>
      <textarea
        className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-300 resize-none focus:outline-none focus:border-zinc-500"
        rows={2}
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        onBlur={() => onChange({ ...dim, description: desc })}
        placeholder={`${title} description…`}
      />
    </div>
  );
}

// ---------- region row ----------

function RegionEditor({
  region,
  onChange,
}: {
  region: RiskRegion;
  onChange: (r: RiskRegion) => void;
}) {
  const [desc, setDesc] = useState(region.description);

  return (
    <div className="py-2 border-b border-zinc-800 last:border-0 space-y-1.5">
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold w-20 ${getRiskColor(region.score)}`}>
          {region.name}
        </span>
        <div className="flex items-center gap-2">
          <span className={`text-xs ${getRiskColor(region.score)}`}>
            {getRiskLabel(region.score)}
          </span>
          <ScorePills
            value={region.score}
            max={5}
            onChange={(v) => onChange({ ...region, score: v })}
          />
        </div>
      </div>
      <textarea
        className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-300 resize-none focus:outline-none focus:border-zinc-500"
        rows={2}
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        onBlur={() => onChange({ ...region, description: desc })}
        placeholder="Regional factor description…"
      />
    </div>
  );
}

// ---------- main panel ----------

export function RiskScoresPanel({ sectionId }: { sectionId: string }) {
  const { scorecards, updateScorecard } = useData();
  const data = scorecards[sectionId];
  const [open, setOpen] = useState(false);

  if (!data) return null;

  const overall = data.overallScore;

  function patch(updates: Partial<RiskScorecardData>) {
    updateScorecard(sectionId, { ...data, ...updates });
  }

  function updateDim(key: "likelihood" | "impact" | "velocity", d: RiskDimension) {
    patch({ [key]: d });
  }

  function updateRegion(index: number, r: RiskRegion) {
    const next = [...data.regions] as RiskScorecardData["regions"];
    next[index] = r;
    patch({ regions: next });
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950">
      {/* header / toggle */}
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-zinc-200">Risk Scores</span>
          <span className={`text-xs font-semibold ${getOverallColor(overall)}`}>
            {overall}/10 — {getOverallLabel(overall)}
          </span>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-zinc-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-zinc-500" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-zinc-800 pt-4">
          {/* Overall score */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide w-28">
              Overall Score
            </span>
            <div className="flex items-center gap-2">
              <button
                className="w-6 h-6 rounded border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 text-sm leading-none flex items-center justify-center"
                onClick={() => patch({ overallScore: Math.max(1, overall - 1) })}
              >
                −
              </button>
              <span className={`text-sm font-bold w-16 text-center ${getOverallColor(overall)}`}>
                {overall}/10
              </span>
              <button
                className="w-6 h-6 rounded border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 text-sm leading-none flex items-center justify-center"
                onClick={() => patch({ overallScore: Math.min(10, overall + 1) })}
              >
                +
              </button>
              <span className={`text-xs ${getOverallColor(overall)}`}>
                {getOverallLabel(overall)}
              </span>
            </div>
          </div>

          {/* Dimensions */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Risk Dimensions (1–5)</p>
            <DimensionEditor title="Likelihood" dim={data.likelihood} onChange={(d) => updateDim("likelihood", d)} />
            <DimensionEditor title="Impact"     dim={data.impact}     onChange={(d) => updateDim("impact", d)} />
            <DimensionEditor title="Velocity"   dim={data.velocity}   onChange={(d) => updateDim("velocity", d)} />
          </div>

          {/* Regional breakdown */}
          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">Regional Exposure (1–5)</p>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3">
              {data.regions.map((r, i) => (
                <RegionEditor key={r.name} region={r} onChange={(updated) => updateRegion(i, updated)} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
