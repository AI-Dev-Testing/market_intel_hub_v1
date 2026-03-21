"use client";

import { useData } from "@/contexts/data-context";
import { RiskScorecard } from "./sc-risk-scorecard";

export function ClimateRiskChart() {
  const { scorecards } = useData();
  const data = scorecards["sc-climate"];
  if (!data) return null;
  return <RiskScorecard data={data} />;
}
