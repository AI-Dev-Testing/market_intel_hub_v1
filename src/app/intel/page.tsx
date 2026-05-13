// src/app/intel/page.tsx
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useData } from "@/contexts/data-context";
import { INTEL_SEED, scoreToRag, scoreToLabel } from "@/lib/data/intel-seed";
import { SignalStrip } from "@/components/features/intel/signal-strip";
import { WhatChangedBand } from "@/components/features/intel/what-changed-band";
import { DomainTile } from "@/components/features/intel/domain-tile";
import { IntelPanel, BreadcrumbItem } from "@/components/features/intel/intel-panel";
import { PanelPlaceholder } from "@/components/features/intel/panel-placeholder";
import { MacroPanel } from "@/components/features/intel/panels/macro-panel";
import { ScRiskPanel } from "@/components/features/intel/panels/sc-risk-panel";
import { LogisticsPanel } from "@/components/features/intel/panels/logistics-panel";

export default function IntelHubPage() {
  const { scorecards } = useData();
  const [activePanel, setActivePanel] = useState<string | null>(null);

  // Compute live SC risk composite from scorecards
  const scIds = ["sc-compliance", "sc-climate", "sc-logistics", "sc-geopolitical"];
  const scScores = scIds.map((id) => scorecards[id]?.overallScore ?? 0);
  const scComposite = Math.round(scScores.reduce((a, b) => a + b, 0) / scScores.length);
  const scRag = scoreToRag(scComposite);
  const scLabel = scoreToLabel(scComposite);

  const openPanel = useCallback((drillPath: string) => {
    setActivePanel((prev) => (prev === drillPath ? null : drillPath));
  }, []);

  const closePanel = useCallback(() => setActivePanel(null), []);

  const activeDomain = INTEL_SEED.domains.find((d) => d.drillPath === activePanel) ?? null;

  const breadcrumbs: BreadcrumbItem[] = activeDomain
    ? [
        { label: "Intel Hub", onClick: closePanel },
        { label: activeDomain.label },
      ]
    : [{ label: "Intel Hub" }];

  return (
    <div className="min-h-screen bg-zinc-950">
      <SignalStrip activePanel={activePanel} onDomainClick={openPanel} />
      <WhatChangedBand />

      <div className="mx-auto w-full max-w-[1920px] px-4 sm:px-6 lg:px-10 py-8">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-zinc-100">Intelligence Hub</h1>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full border border-zinc-700 text-zinc-500 bg-zinc-900">
              Preview
            </span>
          </div>
          <p className="text-sm text-zinc-500">
            Select a domain to explore signals, trends, and risk indicators.
          </p>
        </div>

        {/* 5-tile grid */}
        <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
          {INTEL_SEED.domains.map((domain) => (
            <DomainTile
              key={domain.id}
              domain={domain}
              rag={domain.id === "sc-risk" ? scRag : undefined}
              ragLabel={domain.id === "sc-risk" ? scLabel : undefined}
              compositeScore={domain.id === "sc-risk" ? scComposite : undefined}
              isActive={activePanel === domain.drillPath}
              onClick={() => openPanel(domain.drillPath)}
            />
          ))}
        </div>

        {/* Footer note */}
        <p className="mt-8 text-xs text-zinc-700 text-center">
          Data reflects approved sections as of {INTEL_SEED.lastUpdated} · QoQ deltas vs Q1 2026
        </p>
      </div>

      {/* Centered panel */}
      <IntelPanel open={!!activePanel} onClose={closePanel} breadcrumbs={breadcrumbs}>
        {activeDomain && (
          activeDomain.id === "macro"    ? <MacroPanel domain={activeDomain} /> :
          activeDomain.id === "sc-risk"   ? <ScRiskPanel domain={activeDomain} /> :
          activeDomain.id === "logistics" ? <LogisticsPanel domain={activeDomain} /> :
          <PanelPlaceholder domain={activeDomain} />
        )}
      </IntelPanel>
    </div>
  );
}
