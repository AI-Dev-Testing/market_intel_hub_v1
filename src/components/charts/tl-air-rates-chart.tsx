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

// Mock data: Air cargo yield USD/kg
// Reflects: 2024 holiday surge, 2025 normalization, steady plateau in 2026
const DATA = [
  { month: "Sep '24", AsiaUSWC: 3.20, AsiaEurope: 2.85 },
  { month: "Oct '24", AsiaUSWC: 3.55, AsiaEurope: 3.10 },
  { month: "Nov '24", AsiaUSWC: 4.20, AsiaEurope: 3.75 },
  { month: "Dec '24", AsiaUSWC: 4.65, AsiaEurope: 4.10 },
  { month: "Jan '25", AsiaUSWC: 3.90, AsiaEurope: 3.40 },
  { month: "Feb '25", AsiaUSWC: 3.30, AsiaEurope: 2.95 },
  { month: "Mar '25", AsiaUSWC: 3.05, AsiaEurope: 2.70 },
  { month: "Apr '25", AsiaUSWC: 2.85, AsiaEurope: 2.55 },
  { month: "May '25", AsiaUSWC: 2.70, AsiaEurope: 2.40 },
  { month: "Jun '25", AsiaUSWC: 2.75, AsiaEurope: 2.45 },
  { month: "Jul '25", AsiaUSWC: 2.90, AsiaEurope: 2.60 },
  { month: "Aug '25", AsiaUSWC: 3.10, AsiaEurope: 2.75 },
  { month: "Sep '25", AsiaUSWC: 3.00, AsiaEurope: 2.70 },
  { month: "Oct '25", AsiaUSWC: 3.15, AsiaEurope: 2.80 },
  { month: "Nov '25", AsiaUSWC: 3.40, AsiaEurope: 3.05 },
  { month: "Dec '25", AsiaUSWC: 3.70, AsiaEurope: 3.30 },
  { month: "Jan '26", AsiaUSWC: 3.05, AsiaEurope: 2.75 },
  { month: "Feb '26", AsiaUSWC: 2.85, AsiaEurope: 2.55 },
];

const TOOLTIP_STYLE = {
  backgroundColor: "#18181b",
  border: "1px solid #3f3f46",
  borderRadius: "6px",
  fontSize: "12px",
  color: "#d4d4d8",
};

export function TLAirRatesChart() {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-zinc-500">Air Freight Yield — USD/kg</p>
        <p className="text-xs text-zinc-600">Source: TAC Index / IATA</p>
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
            domain={[1.5, 5.0]}
            tick={{ fill: "#71717a", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `$${Number(v).toFixed(2)}`}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            cursor={{ stroke: "#52525b" }}
            formatter={(value) => [`$${Number(value).toFixed(2)}/kg`, ""]}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px", color: "#a1a1aa" }}
            iconType="circle"
            iconSize={8}
          />
          <Line type="monotone" dataKey="AsiaUSWC"   stroke="#3b82f6" strokeWidth={2} dot={false} name="Asia–US WC" />
          <Line type="monotone" dataKey="AsiaEurope" stroke="#a78bfa" strokeWidth={2} dot={false} name="Asia–Europe" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
