"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Mock data: FBX Composite + key sub-indexes (USD/FEU)
// Reflects: post-Red Sea spike (late 2024), partial normalization (mid 2025),
// tariff-driven re-elevation (Q1 2026)
const DATA = [
  { month: "Sep '24", Composite: 3850, Transpacific: 5100, AsiaEurope: 4200 },
  { month: "Oct '24", Composite: 3600, Transpacific: 4800, AsiaEurope: 4050 },
  { month: "Nov '24", Composite: 3200, Transpacific: 4300, AsiaEurope: 3700 },
  { month: "Dec '24", Composite: 2950, Transpacific: 3900, AsiaEurope: 3400 },
  { month: "Jan '25", Composite: 2700, Transpacific: 3500, AsiaEurope: 3100 },
  { month: "Feb '25", Composite: 2500, Transpacific: 3200, AsiaEurope: 2900 },
  { month: "Mar '25", Composite: 2350, Transpacific: 3050, AsiaEurope: 2700 },
  { month: "Apr '25", Composite: 2200, Transpacific: 2850, AsiaEurope: 2500 },
  { month: "May '25", Composite: 2100, Transpacific: 2700, AsiaEurope: 2400 },
  { month: "Jun '25", Composite: 2250, Transpacific: 2900, AsiaEurope: 2550 },
  { month: "Jul '25", Composite: 2400, Transpacific: 3100, AsiaEurope: 2700 },
  { month: "Aug '25", Composite: 2600, Transpacific: 3350, AsiaEurope: 2900 },
  { month: "Sep '25", Composite: 2750, Transpacific: 3500, AsiaEurope: 3050 },
  { month: "Oct '25", Composite: 2900, Transpacific: 3700, AsiaEurope: 3200 },
  { month: "Nov '25", Composite: 3050, Transpacific: 3900, AsiaEurope: 3350 },
  { month: "Dec '25", Composite: 3200, Transpacific: 4200, AsiaEurope: 3550 },
  { month: "Jan '26", Composite: 3400, Transpacific: 4550, AsiaEurope: 3700 },
  { month: "Feb '26", Composite: 3200, Transpacific: 4300, AsiaEurope: 3600 },
];

const TOOLTIP_STYLE = {
  backgroundColor: "#18181b",
  border: "1px solid #3f3f46",
  borderRadius: "6px",
  fontSize: "12px",
  color: "#d4d4d8",
};

export function TLOceanRatesChart() {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-zinc-500">Ocean Freight Rates — FBX Index (USD/FEU)</p>
        <p className="text-xs text-zinc-600">Source: Freightos Baltic Exchange</p>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={DATA} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
          <XAxis
            dataKey="month"
            tick={{ fill: "#71717a", fontSize: 11 }}
            interval={2}
            tickLine={false}
          />
          <YAxis
            domain={[1500, 5500]}
            tick={{ fill: "#71717a", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            cursor={{ stroke: "#52525b" }}
            formatter={(value) => [`$${Number(value).toLocaleString()}`, ""]}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px", color: "#a1a1aa" }}
            iconType="circle"
            iconSize={8}
          />
          <Line type="monotone" dataKey="Composite"    stroke="#3b82f6" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="Transpacific" stroke="#f59e0b" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="AsiaEurope"   stroke="#a78bfa" strokeWidth={2} dot={false} name="Asia–Europe" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
