"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
} from "recharts";

const DATA = [
  { quarter: "Q1 '25", US: 2.9, EU: 1.1, China: 5.1, Global: 3.2, forecast: false },
  { quarter: "Q2 '25", US: 2.7, EU: 1.2, China: 4.9, Global: 3.0, forecast: false },
  { quarter: "Q3 '25", US: 2.5, EU: 1.3, China: 4.7, Global: 2.9, forecast: false },
  { quarter: "Q4 '25", US: 2.4, EU: 1.4, China: 4.5, Global: 2.8, forecast: false },
  { quarter: "Q1 '26*", US: 2.2, EU: 1.4, China: 4.4, Global: 2.8, forecast: true },
  { quarter: "Q2 '26*", US: 2.0, EU: 1.5, China: 4.3, Global: 2.9, forecast: true },
];

const COLORS = {
  US: "#3b82f6",
  EU: "#a78bfa",
  China: "#f59e0b",
  Global: "#34d399",
};

const TOOLTIP_STYLE = {
  backgroundColor: "#18181b",
  border: "1px solid #3f3f46",
  borderRadius: "6px",
  fontSize: "12px",
  color: "#d4d4d8",
};

export function GDPOutlookChart() {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-zinc-500">GDP Growth YoY % — quarterly</p>
        <p className="text-xs text-zinc-600">* IMF forecast</p>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={DATA} margin={{ top: 4, right: 8, left: -16, bottom: 0 }} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
          <XAxis
            dataKey="quarter"
            tick={{ fill: "#71717a", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[0, 6]}
            tick={{ fill: "#71717a", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            cursor={{ fill: "#27272a" }}
            formatter={(value) => [`${Number(value).toFixed(1)}%`, ""]}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px", color: "#a1a1aa" }}
            iconType="circle"
            iconSize={8}
          />
          {(["US", "EU", "China", "Global"] as const).map((key) => (
            <Bar key={key} dataKey={key} fill={COLORS[key]} radius={[2, 2, 0, 0]}>
              {DATA.map((entry, i) => (
                <Cell
                  key={i}
                  fill={COLORS[key]}
                  fillOpacity={entry.forecast ? 0.4 : 1}
                />
              ))}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
