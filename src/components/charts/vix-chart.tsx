"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

const DATA = [
  { month: "Jun '25", vix: 16.2 },
  { month: "Jul '25", vix: 14.8 },
  { month: "Aug '25", vix: 19.3 },
  { month: "Sep '25", vix: 22.1 },
  { month: "Oct '25", vix: 18.7 },
  { month: "Nov '25", vix: 15.4 },
  { month: "Dec '25", vix: 12.1 },
  { month: "Jan '26", vix: 17.6 },
  { month: "Feb '26", vix: 28.6 },
  { month: "Mar '26", vix: 21.4 },
  { month: "Apr '26", vix: 19.8 },
  { month: "May '26", vix: 18.4 },
];

const TOOLTIP_STYLE = {
  backgroundColor: "#18181b",
  border: "1px solid #3f3f46",
  borderRadius: "6px",
  fontSize: "12px",
  color: "#e4e4e7",
};

export function VIXChart() {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-zinc-500">CBOE VIX — 12-month trend</p>
        <div className="flex gap-3 text-xs">
          <span className="text-zinc-400">Current: <span className="text-zinc-200 font-medium">18.4</span></span>
          <span className="text-zinc-600">Mean: 15.5</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={DATA} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
          <XAxis
            dataKey="month"
            tick={{ fill: "#71717a", fontSize: 11 }}
            tickLine={false}
            interval={1}
          />
          <YAxis
            domain={[8, 35]}
            tick={{ fill: "#71717a", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            labelStyle={{ color: "#f4f4f5" }}
            itemStyle={{ color: "#e4e4e7" }}
            cursor={{ stroke: "#52525b" }}
            formatter={(value) => [Number(value).toFixed(1), "VIX"]}
          />
          {/* Historical mean */}
          <ReferenceLine
            y={15.5}
            stroke="#52525b"
            strokeDasharray="4 2"
            label={{ value: "Mean 15.5", position: "right", fill: "#52525b", fontSize: 10 }}
          />
          {/* Stress threshold */}
          <ReferenceLine
            y={25}
            stroke="#7f1d1d"
            strokeDasharray="4 2"
            label={{ value: "Stress 25", position: "right", fill: "#7f1d1d", fontSize: 10 }}
          />
          <Line
            type="monotone"
            dataKey="vix"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#f59e0b" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
