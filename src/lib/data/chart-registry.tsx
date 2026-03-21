"use client";

import type { ComponentType } from "react";
import { MacroOverviewChart } from "@/components/charts/macro-overview-chart";
import { ManufacturingPMIChart } from "@/components/charts/manufacturing-pmi-chart";
import { GDPOutlookChart } from "@/components/charts/gdp-outlook-chart";
import { FXRiskChart } from "@/components/charts/fx-risk-chart";
import { CentralBankRatesChart } from "@/components/charts/central-bank-rates-chart";
import { EnergyPricesChart } from "@/components/charts/energy-prices-chart";
import { SCOverviewChart } from "@/components/charts/sc-overview-chart";
import { GeopoliticalRiskChart } from "@/components/charts/sc-geopolitical-chart";
import { LogisticsRiskChart } from "@/components/charts/sc-logistics-chart";
import { ClimateRiskChart } from "@/components/charts/sc-climate-chart";
import { ComplianceRiskChart } from "@/components/charts/sc-compliance-chart";
import { TLOverviewChart } from "@/components/charts/tl-overview-chart";
import { TLOceanRatesChart } from "@/components/charts/tl-ocean-rates-chart";
import { TLAirRatesChart } from "@/components/charts/tl-air-rates-chart";
import { TLTradeLanesChart } from "@/components/charts/tl-trade-lanes-chart";

// Maps section IDs to their chart component.
// Only sections listed here will display a chart in the editor and report view.
export const SECTION_CHARTS: Record<string, ComponentType> = {
  "macro-overview": MacroOverviewChart,
  "macro-pmi":    ManufacturingPMIChart,
  "macro-gdp":    GDPOutlookChart,
  "macro-fx":     FXRiskChart,
  "macro-rates":  CentralBankRatesChart,
  "macro-energy": EnergyPricesChart,
  "sc-overview":     SCOverviewChart,
  "sc-geopolitical": GeopoliticalRiskChart,
  "sc-logistics":    LogisticsRiskChart,
  "sc-climate":      ClimateRiskChart,
  "sc-compliance":   ComplianceRiskChart,
  "tl-overview":     TLOverviewChart,
  "tl-ocean-rates":  TLOceanRatesChart,
  "tl-air-rates":    TLAirRatesChart,
  "tl-trade-lanes":  TLTradeLanesChart,
};
