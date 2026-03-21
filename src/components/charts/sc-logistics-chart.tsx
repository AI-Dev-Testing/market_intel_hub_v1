"use client";

import { useData } from "@/contexts/data-context";
import { RiskScorecard } from "./sc-risk-scorecard";

export function LogisticsRiskChart() {
  const { scorecards } = useData();
  const data = scorecards["sc-logistics"];
  if (!data) return null;
  return <RiskScorecard data={data} />;
}
