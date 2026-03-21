"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { useData } from "@/contexts/data-context";
import { RiskScorecardData } from "@/types";

const RISKS = [
  { key: "geo",        sectionId: "sc-geopolitical", label: "Geopolitical",  color: "#3b82f6" },
  { key: "logistics",  sectionId: "sc-logistics",    label: "Logistics",     color: "#f59e0b" },
  { key: "climate",    sectionId: "sc-climate",      label: "Climate",       color: "#f97316" },
  { key: "compliance", sectionId: "sc-compliance",   label: "Compliance",    color: "#ef4444" },
];

const TOOLTIP_STYLE = {
  backgroundColor: "#18181b",
  border: "1px solid #3f3f46",
  borderRadius: "6px",
  fontSize: "12px",
  color: "#d4d4d8",
};

function regionalComposite(data: RiskScorecardData): number {
  const sum = data.regions.reduce((acc, r) => acc + r.score, 0);
  return Math.round(sum / data.regions.length);
}

export function SCOverviewChart() {
  const { scorecards } = useData();

  const radarData = [
    {
      dim: "Likelihood",
      ...Object.fromEntries(RISKS.map(({ key, sectionId }) => [key, scorecards[sectionId]?.likelihood.score ?? 0])),
    },
    {
      dim: "Impact",
      ...Object.fromEntries(RISKS.map(({ key, sectionId }) => [key, scorecards[sectionId]?.impact.score ?? 0])),
    },
    {
      dim: "Velocity",
      ...Object.fromEntries(RISKS.map(({ key, sectionId }) => [key, scorecards[sectionId]?.velocity.score ?? 0])),
    },
    {
      dim: "Regional Exposure",
      ...Object.fromEntries(RISKS.map(({ key, sectionId }) => [key, scorecards[sectionId] ? regionalComposite(scorecards[sectionId]) : 0])),
    },
  ];

  return (
    <div>
      <p className="text-xs text-zinc-600 mb-2">
        All axes 0–5 risk scale. Regional Exposure = average across Americas / Europe / China / SE Asia.
      </p>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
          <PolarGrid stroke="#3f3f46" />
          <PolarAngleAxis dataKey="dim" tick={{ fill: "#71717a", fontSize: 11 }} />
          <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
          {RISKS.map(({ key, label, color }) => (
            <Radar
              key={key}
              name={label}
              dataKey={key}
              stroke={color}
              fill={color}
              fillOpacity={0.07}
              strokeWidth={2}
            />
          ))}
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Legend wrapperStyle={{ fontSize: 11, color: "#71717a" }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
