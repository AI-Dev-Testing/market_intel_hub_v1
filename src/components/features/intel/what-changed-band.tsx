// src/components/features/intel/what-changed-band.tsx
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { INTEL_SEED } from "@/lib/data/intel-seed";
import { useData } from "@/contexts/data-context";

export function WhatChangedBand() {
  const { sections, reportMeta } = useData();
  const [summary, setSummary] = useState(INTEL_SEED.whatChangedSummary);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const regenerate = async () => {
    setLoading(true);
    try {
      const approved = sections.filter((s) => s.status === "approved");
      const res = await fetch("/api/executive-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sections: approved.map((s) => ({ title: s.title, category: s.category, draft: s.draft })),
          reportTitle: reportMeta.title,
          reportPeriod: reportMeta.period,
          mode: "what-changed",
        }),
      });
      const data = await res.json();
      if (data.summary) setSummary(data.summary);
    } catch (err) {
      console.error("[WhatChangedBand]", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-b border-zinc-800 bg-zinc-900/30">
      <div className="mx-auto w-full max-w-[1920px] px-4 sm:px-6 lg:px-10 py-3">
        <div className="flex items-start gap-3">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors flex-shrink-0 mt-0.5"
          >
            <span className="text-zinc-600">{expanded ? "▼" : "▶"}</span>
            <span className="uppercase tracking-wide">What Changed This Quarter</span>
          </button>

          {expanded && (
            <p className="text-xs text-zinc-400 leading-relaxed flex-1">{summary}</p>
          )}

          <button
            onClick={regenerate}
            disabled={loading}
            className={cn(
              "flex-shrink-0 text-xs px-2.5 py-1 rounded border transition-colors",
              loading
                ? "border-zinc-700 text-zinc-600 cursor-not-allowed"
                : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
            )}
          >
            {loading ? "Generating…" : "↺ Refresh"}
          </button>
        </div>
      </div>
    </div>
  );
}
