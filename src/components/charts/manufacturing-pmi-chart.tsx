"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

const DATA = [
  { month: "Sep '24", US: 47.2, EU: 44.8, China: 49.7 },
  { month: "Oct '24", US: 46.5, EU: 45.1, China: 50.1 },
  { month: "Nov '24", US: 47.8, EU: 44.3, China: 49.8 },
  { month: "Dec '24", US: 48.4, EU: 45.6, China: 50.5 },
  { month: "Jan '25", US: 49.1, EU: 46.2, China: 50.2 },
  { month: "Feb '25", US: 50.2, EU: 47.1, China: 49.9 },
  { month: "Mar '25", US: 50.8, EU: 47.8, China: 51.1 },
  { month: "Apr '25", US: 51.5, EU: 48.3, China: 50.8 },
  { month: "May '25", US: 51.2, EU: 47.9, China: 49.6 },
  { month: "Jun '25", US: 50.6, EU: 49.2, China: 50.3 },
  { month: "Jul '25", US: 51.9, EU: 49.8, China: 50.7 },
  { month: "Aug '25", US: 52.3, EU: 50.1, China: 51.2 },
  { month: "Sep '25", US: 51.8, EU: 49.5, China: 50.9 },
  { month: "Oct '25", US: 52.1, EU: 50.3, China: 51.4 },
  { month: "Nov '25", US: 51.4, EU: 49.7, China: 50.5 },
  { month: "Dec '25", US: 52.6, EU: 50.8, China: 51.1 },
  { month: "Jan '26", US: 51.9, EU: 50.2, China: 50.8 },
  { month: "Feb '26", US: 52.4, EU: 49.9, China: 51.3 },
];

const TOOLTIP_STYLE = {
  backgroundColor: "#18181b",
  border: "1px solid #3f3f46",
  borderRadius: "6px",
  fontSize: "12px",
  color: "#d4d4d8",
};

export function ManufacturingPMIChart() {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-zinc-500">Manufacturing PMI — 18-month trend</p>
        <p className="text-xs text-zinc-600">Above 50 = expansion</p>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={DATA} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
          <XAxis
            dataKey="month"
            tick={{ fill: "#71717a", fontSize: 11 }}
            interval={2}
            tickLine={false}
          />
          <YAxis
            domain={[42, 56]}
            tick={{ fill: "#71717a", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            cursor={{ stroke: "#52525b" }}
            formatter={(value) => [Number(value).toFixed(1), ""]}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px", color: "#a1a1aa" }}
            iconType="circle"
            iconSize={8}
          />
          <ReferenceLine
            y={50}
            stroke="#52525b"
            strokeDasharray="4 2"
            label={{ value: "50", position: "right", fill: "#52525b", fontSize: 10 }}
          />
          <Line type="monotone" dataKey="US"    stroke="#3b82f6" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="EU"    stroke="#a78bfa" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="China" stroke="#f59e0b" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
