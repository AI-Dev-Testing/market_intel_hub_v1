"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";

const FX_DATA = [
  { currency: "CNY", ytd: -2.1, rate: "7.28",  m1: "-0.3%", m3: "-0.8%",  volatility: "Low"    },
  { currency: "EUR", ytd: -1.5, rate: "1.072", m1: "-0.6%", m3: "-0.9%",  volatility: "Low"    },
  { currency: "INR", ytd: -3.2, rate: "86.40", m1: "-0.5%", m3: "-1.8%",  volatility: "Medium" },
  { currency: "JPY", ytd: -4.7, rate: "151.2", m1: "-0.9%", m3: "-2.4%",  volatility: "Medium" },
  { currency: "MXN", ytd: -5.1, rate: "20.31", m1: "-1.4%", m3: "-3.1%",  volatility: "Medium" },
  { currency: "BRL", ytd: -8.4, rate: "5.89",  m1: "-2.1%", m3: "-5.2%",  volatility: "High"   },
];

function barColor(ytd: number): string {
  const abs = Math.abs(ytd);
  if (abs < 2.5) return "#71717a"; // zinc-500 — low risk
  if (abs < 5)   return "#f59e0b"; // amber-400 — medium risk
  return "#f87171";                // red-400 — high risk
}

const VOLATILITY_STYLES: Record<string, string> = {
  Low:    "text-zinc-400 bg-zinc-800",
  Medium: "text-amber-400 bg-amber-950/40",
  High:   "text-red-400 bg-red-950/40",
};

const TOOLTIP_STYLE = {
  backgroundColor: "#18181b",
  border: "1px solid #3f3f46",
  borderRadius: "6px",
  fontSize: "12px",
  color: "#d4d4d8",
};

export function FXRiskChart() {
  return (
    <div className="space-y-4">
      {/* Horizontal bar chart — YTD % change vs USD */}
      <div>
        <p className="text-xs text-zinc-500 mb-2">YTD % change vs USD (2026)</p>
        <ResponsiveContainer width="100%" height={170}>
          <BarChart
            data={FX_DATA}
            layout="vertical"
            margin={{ top: 0, right: 40, left: 4, bottom: 0 }}
          >
            <XAxis
              type="number"
              domain={[-10, 0]}
              tick={{ fill: "#71717a", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis
              type="category"
              dataKey="currency"
              tick={{ fill: "#a1a1aa", fontSize: 12, fontWeight: 500 }}
              tickLine={false}
              axisLine={false}
              width={36}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              cursor={{ fill: "#27272a" }}
              formatter={(value) => [`${Number(value).toFixed(1)}%`, "YTD vs USD"]}
            />
            <Bar dataKey="ytd" radius={[0, 3, 3, 0]} label={{ position: "right", fill: "#71717a", fontSize: 11, formatter: (v: unknown) => `${v}%` }}>
              {FX_DATA.map((entry, i) => (
                <Cell key={i} fill={barColor(entry.ytd)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Data table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs min-w-[420px]">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left text-zinc-500 font-medium pb-2 pr-3">Currency</th>
              <th className="text-right text-zinc-500 font-medium pb-2 px-3">Rate vs USD</th>
              <th className="text-right text-zinc-500 font-medium pb-2 px-3">1M Δ</th>
              <th className="text-right text-zinc-500 font-medium pb-2 px-3">3M Δ</th>
              <th className="text-right text-zinc-500 font-medium pb-2 px-3">YTD Δ</th>
              <th className="text-right text-zinc-500 font-medium pb-2 pl-3">Volatility</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {FX_DATA.map((row) => (
              <tr key={row.currency}>
                <td className="py-2 pr-3 font-medium text-zinc-300">{row.currency}</td>
                <td className="py-2 px-3 text-right text-zinc-400 tabular-nums">{row.rate}</td>
                <td className="py-2 px-3 text-right text-red-400 tabular-nums">{row.m1}</td>
                <td className="py-2 px-3 text-right text-red-400 tabular-nums">{row.m3}</td>
                <td className="py-2 px-3 text-right text-red-400 tabular-nums font-medium">{row.ytd}%</td>
                <td className="py-2 pl-3 text-right">
                  <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${VOLATILITY_STYLES[row.volatility]}`}>
                    {row.volatility}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-zinc-600 mt-2">All values vs USD. Negative = currency weakened against dollar.</p>
      </div>
    </div>
  );
}
