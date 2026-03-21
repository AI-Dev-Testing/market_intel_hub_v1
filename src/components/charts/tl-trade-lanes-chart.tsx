"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

// Mock data: Schedule reliability % by trade lane (Sea-Intelligence GLP Index)
// Lower = more disrupted; 70% is approximate pre-COVID baseline
const DATA = [
  { period: "Sep '24", Transpacific: 52, AsiaEurope: 48, TransAmericas: 58, Transatlantic: 65 },
  { period: "Nov '24", Transpacific: 55, AsiaEurope: 50, TransAmericas: 60, Transatlantic: 67 },
  { period: "Jan '25", Transpacific: 57, AsiaEurope: 52, TransAmericas: 61, Transatlantic: 68 },
  { period: "Mar '25", Transpacific: 60, AsiaEurope: 55, TransAmericas: 63, Transatlantic: 70 },
  { period: "May '25", Transpacific: 62, AsiaEurope: 57, TransAmericas: 65, Transatlantic: 71 },
  { period: "Feb '26", Transpacific: 59, AsiaEurope: 54, TransAmericas: 62, Transatlantic: 71 },
];

const TOOLTIP_STYLE = {
  backgroundColor: "#18181b",
  border: "1px solid #3f3f46",
  borderRadius: "6px",
  fontSize: "12px",
  color: "#d4d4d8",
};

export function TLTradeLanesChart() {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-zinc-500">Schedule Reliability % by Trade Lane</p>
        <p className="text-xs text-zinc-600">Source: Sea-Intelligence GLP Index</p>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={DATA} margin={{ top: 4, right: 8, left: -16, bottom: 0 }} barCategoryGap="25%">
          <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
          <XAxis
            dataKey="period"
            tick={{ fill: "#71717a", fontSize: 11 }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "#71717a", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            cursor={{ fill: "#27272a" }}
            formatter={(value) => [`${value}%`, ""]}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px", color: "#a1a1aa" }}
            iconType="square"
            iconSize={8}
          />
          <ReferenceLine
            y={70}
            stroke="#52525b"
            strokeDasharray="4 2"
            label={{ value: "70% pre-COVID baseline", position: "insideTopRight", fill: "#52525b", fontSize: 10 }}
          />
          <Bar dataKey="Transpacific"   fill="#3b82f6" radius={[2, 2, 0, 0]} />
          <Bar dataKey="AsiaEurope"     fill="#a78bfa" radius={[2, 2, 0, 0]} name="Asia–Europe" />
          <Bar dataKey="TransAmericas"  fill="#f59e0b" radius={[2, 2, 0, 0]} name="Trans-Americas" />
          <Bar dataKey="Transatlantic"  fill="#34d399" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
