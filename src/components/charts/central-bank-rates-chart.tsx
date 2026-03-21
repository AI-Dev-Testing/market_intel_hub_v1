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

const RATE_DATA = [
  { month: "Mar '24", Fed: 5.50, ECB: 4.00, PBOC: 3.45 },
  { month: "Apr '24", Fed: 5.50, ECB: 4.00, PBOC: 3.45 },
  { month: "May '24", Fed: 5.50, ECB: 4.00, PBOC: 3.45 },
  { month: "Jun '24", Fed: 5.50, ECB: 3.65, PBOC: 3.45 },
  { month: "Jul '24", Fed: 5.50, ECB: 3.65, PBOC: 3.35 },
  { month: "Aug '24", Fed: 5.50, ECB: 3.65, PBOC: 3.35 },
  { month: "Sep '24", Fed: 5.25, ECB: 3.25, PBOC: 3.35 },
  { month: "Oct '24", Fed: 5.25, ECB: 2.90, PBOC: 3.35 },
  { month: "Nov '24", Fed: 5.00, ECB: 2.90, PBOC: 3.20 },
  { month: "Dec '24", Fed: 4.75, ECB: 2.50, PBOC: 3.10 },
  { month: "Jan '25", Fed: 4.50, ECB: 2.50, PBOC: 3.10 },
  { month: "Feb '25", Fed: 4.50, ECB: 2.15, PBOC: 3.10 },
  { month: "Mar '25", Fed: 4.25, ECB: 2.15, PBOC: 3.10 },
  { month: "Apr '25", Fed: 4.25, ECB: 1.90, PBOC: 3.10 },
  { month: "May '25", Fed: 4.00, ECB: 1.90, PBOC: 3.00 },
  { month: "Jun '25", Fed: 4.00, ECB: 1.75, PBOC: 3.00 },
  { month: "Jul '25", Fed: 3.75, ECB: 1.75, PBOC: 2.95 },
  { month: "Aug '25", Fed: 3.75, ECB: 1.75, PBOC: 2.95 },
  { month: "Sep '25", Fed: 3.50, ECB: 1.75, PBOC: 2.95 },
  { month: "Oct '25", Fed: 3.50, ECB: 1.75, PBOC: 2.90 },
  { month: "Nov '25", Fed: 3.25, ECB: 1.75, PBOC: 2.90 },
  { month: "Dec '25", Fed: 3.25, ECB: 1.75, PBOC: 2.90 },
  { month: "Jan '26", Fed: 3.25, ECB: 1.75, PBOC: 2.85 },
  { month: "Feb '26", Fed: 3.25, ECB: 1.75, PBOC: 2.85 },
];

const TOOLTIP_STYLE = {
  backgroundColor: "#18181b",
  border: "1px solid #3f3f46",
  borderRadius: "6px",
  fontSize: "12px",
  color: "#d4d4d8",
};

const CURRENT = {
  Fed: "3.25%",
  ECB: "1.75%",
  PBOC: "2.85%",
};

export function CentralBankRatesChart() {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-zinc-500">Policy rates — 24-month history</p>
        <div className="flex gap-3 text-xs">
          <span className="text-blue-400">Fed <span className="text-zinc-400">{CURRENT.Fed}</span></span>
          <span className="text-violet-400">ECB <span className="text-zinc-400">{CURRENT.ECB}</span></span>
          <span className="text-amber-400">PBOC <span className="text-zinc-400">{CURRENT.PBOC}</span></span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={RATE_DATA} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
          <XAxis
            dataKey="month"
            tick={{ fill: "#71717a", fontSize: 11 }}
            interval={5}
            tickLine={false}
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
            cursor={{ stroke: "#52525b" }}
            formatter={(value) => [`${Number(value).toFixed(2)}%`, ""]}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px", color: "#a1a1aa" }}
            iconType="circle"
            iconSize={8}
          />
          <Line type="stepAfter" dataKey="Fed"  stroke="#3b82f6" strokeWidth={2} dot={false} />
          <Line type="stepAfter" dataKey="ECB"  stroke="#a78bfa" strokeWidth={2} dot={false} />
          <Line type="stepAfter" dataKey="PBOC" stroke="#f59e0b" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
