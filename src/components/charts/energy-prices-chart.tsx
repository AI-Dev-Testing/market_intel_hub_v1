"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const BRENT = [
  { month: "Sep '25", actual: 74.2 },
  { month: "Oct '25", actual: 76.8 },
  { month: "Nov '25", actual: 73.1 },
  { month: "Dec '25", actual: 74.9 },
  { month: "Jan '26", actual: 78.3 },
  { month: "Feb '26", actual: 80.1, forecast: 80.1 },
  { month: "Mar '26", forecast: 79.5 },
  { month: "Apr '26", forecast: 78.0 },
  { month: "May '26", forecast: 77.0 },
];

const TTF = [
  { month: "Sep '25", actual: 38.4 },
  { month: "Oct '25", actual: 42.1 },
  { month: "Nov '25", actual: 45.6 },
  { month: "Dec '25", actual: 48.3 },
  { month: "Jan '26", actual: 52.7 },
  { month: "Feb '26", actual: 49.2, forecast: 49.2 },
  { month: "Mar '26", forecast: 44.0 },
  { month: "Apr '26", forecast: 36.0 },
  { month: "May '26", forecast: 30.5 },
];

const COAL = [
  { month: "Sep '25", actual: 131.2 },
  { month: "Oct '25", actual: 128.4 },
  { month: "Nov '25", actual: 124.7 },
  { month: "Dec '25", actual: 121.3 },
  { month: "Jan '26", actual: 118.5 },
  { month: "Feb '26", actual: 115.8, forecast: 115.8 },
  { month: "Mar '26", forecast: 113.0 },
  { month: "Apr '26", forecast: 111.0 },
  { month: "May '26", forecast: 109.5 },
];

const TOOLTIP_STYLE = {
  backgroundColor: "#18181b",
  border: "1px solid #3f3f46",
  borderRadius: "6px",
  fontSize: "12px",
  color: "#d4d4d8",
};

type DataPoint = { month: string; actual?: number; forecast?: number };

function CommodityChart({
  data,
  color,
  label,
  unit,
  domainPad,
}: {
  data: DataPoint[];
  color: string;
  label: string;
  unit: string;
  domainPad: number;
}) {
  const allVals = data.flatMap((d) => [d.actual, d.forecast].filter((v): v is number => v != null));
  const min = Math.floor(Math.min(...allVals) - domainPad);
  const max = Math.ceil(Math.max(...allVals) + domainPad);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-medium text-zinc-400">{label}</p>
        <p className="text-xs text-zinc-600">{unit}</p>
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <LineChart data={data} margin={{ top: 2, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
          <XAxis
            dataKey="month"
            tick={{ fill: "#71717a", fontSize: 10 }}
            tickLine={false}
            interval={1}
          />
          <YAxis
            domain={[min, max]}
            tick={{ fill: "#71717a", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            cursor={{ stroke: "#52525b" }}
            formatter={(v) => [`${Number(v).toFixed(1)} ${unit}`, ""]}
          />
          <ReferenceLine x="Feb '26" stroke="#3f3f46" strokeDasharray="3 3" />
          <Line
            type="monotone"
            dataKey="actual"
            stroke={color}
            strokeWidth={2}
            dot={false}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="forecast"
            stroke={color}
            strokeWidth={2}
            dot={false}
            strokeDasharray="5 3"
            strokeOpacity={0.6}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function EnergyPricesChart() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-5 text-xs text-zinc-600 mb-1">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-5 h-px bg-zinc-400" />
          Actual
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-5 border-t border-dashed border-zinc-400" />
          Forecast
        </span>
      </div>
      <CommodityChart data={BRENT} color="#f97316" label="Brent Crude Oil"       unit="$/bbl"  domainPad={3} />
      <CommodityChart data={TTF}   color="#60a5fa" label="Dutch TTF Natural Gas"  unit="€/MWh"  domainPad={3} />
      <CommodityChart data={COAL}  color="#a78bfa" label="Newcastle Thermal Coal" unit="$/t"    domainPad={3} />
    </div>
  );
}
