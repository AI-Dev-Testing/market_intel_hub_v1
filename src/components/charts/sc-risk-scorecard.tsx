"use client";

type DimensionData = { score: number; description: string };
type RegionData    = { name: string; score: number; description: string };

export type ScorecardData = {
  overallScore: number; // 1–10
  likelihood:  DimensionData;
  impact:      DimensionData;
  velocity:    DimensionData;
  regions: [RegionData, RegionData, RegionData, RegionData]; // Americas / Europe / China / SE Asia
};

function getRiskColors(score: number) {
  if (score <= 2) return { bg: "bg-emerald-950/60", text: "text-emerald-400", label: "Low" };
  if (score === 3) return { bg: "bg-amber-950/60",  text: "text-amber-400",  label: "Moderate" };
  if (score === 4) return { bg: "bg-red-950/60",    text: "text-red-400",    label: "High" };
  return             { bg: "bg-red-950/80",    text: "text-red-300",    label: "Critical" };
}

function getOverall(score: number) {
  if (score <= 3) return { label: "Low",      color: "text-emerald-400", dot: "bg-emerald-500" };
  if (score <= 5) return { label: "Moderate", color: "text-amber-400",   dot: "bg-amber-500" };
  if (score <= 7) return { label: "Elevated", color: "text-orange-400",  dot: "bg-orange-500" };
  if (score <= 9) return { label: "High",     color: "text-red-400",     dot: "bg-red-500" };
  return                 { label: "Critical", color: "text-red-300",     dot: "bg-red-400" };
}

function DimensionCard({ title, data }: { title: string; data: DimensionData }) {
  const c = getRiskColors(data.score);
  return (
    <div className={`rounded-lg p-3 ${c.bg}`}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">{title}</p>
        <span className={`text-xs font-bold ${c.text}`}>{data.score}/5</span>
      </div>
      <p className={`text-sm font-semibold ${c.text} mb-0.5`}>{c.label}</p>
      <p className="text-xs text-zinc-500 leading-snug">{data.description}</p>
    </div>
  );
}

function RegionRow({ region }: { region: RegionData }) {
  const c = getRiskColors(region.score);
  return (
    <div className="flex items-start gap-3 py-2 border-b border-zinc-800 last:border-0">
      <span className={`shrink-0 text-xs font-semibold w-20 ${c.text}`}>{region.name}</span>
      <span className={`shrink-0 text-xs ${c.text} w-14`}>{c.label}</span>
      <span className="text-xs text-zinc-500 leading-snug">{region.description}</span>
    </div>
  );
}

export function RiskScorecard({ data }: { data: ScorecardData }) {
  const overall = getOverall(data.overallScore);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className={`inline-block w-2 h-2 rounded-full ${overall.dot}`} />
        <span className="text-xs text-zinc-500">Overall Risk</span>
        <span className={`text-sm font-bold ${overall.color}`}>{data.overallScore}/10 — {overall.label}</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <DimensionCard title="Likelihood" data={data.likelihood} />
        <DimensionCard title="Impact"     data={data.impact}     />
        <DimensionCard title="Velocity"   data={data.velocity}   />
      </div>

      <div>
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">Regional Exposure</p>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3">
          {data.regions.map((r) => <RegionRow key={r.name} region={r} />)}
        </div>
      </div>
    </div>
  );
}
