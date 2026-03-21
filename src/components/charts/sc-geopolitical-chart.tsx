"use client";

import { useData } from "@/contexts/data-context";
import { RiskScorecard } from "./sc-risk-scorecard";

export function GeopoliticalRiskChart() {
  const { scorecards } = useData();
  const data = scorecards["sc-geopolitical"];
  if (!data) return null;
  return <RiskScorecard data={data} />;
}
