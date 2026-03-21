"use client";

import { useData } from "@/contexts/data-context";
import { RiskScorecard } from "./sc-risk-scorecard";

export function ComplianceRiskChart() {
  const { scorecards } = useData();
  const data = scorecards["sc-compliance"];
  if (!data) return null;
  return <RiskScorecard data={data} />;
}
