// Macro indicator snapshot data — updated once per reporting cycle (monthly/quarterly).
// Edit values here when new data is published; no component code changes needed.

export type IndicatorStatus = "positive" | "caution" | "elevated" | "critical";

export interface MacroIndicator {
  label: string;
  primary: string;
  secondary?: string;
  trend: "up" | "down" | "stable" | "mixed";
  trendLabel: string;
  status: IndicatorStatus;
  signal: string;
}

export const MACRO_INDICATORS: MacroIndicator[] = [
  {
    label: "Manufacturing PMI",
    primary: "US 53.1",
    secondary: "CN 51.4 · EU 50.8",
    trend: "up",
    trendLabel: "Expanding",
    status: "positive",
    signal: "Expansion broadening — new orders sub-index at 18-month high across all three regions",
  },
  {
    label: "GDP Growth",
    primary: "US +2.0%",
    secondary: "CN +4.3% · EU +1.5%",
    trend: "stable",
    trendLabel: "Steady",
    status: "caution",
    signal: "US moderating on fiscal drag; EU stabilising; China stimulus-dependent",
  },
  {
    label: "FX Risk",
    primary: "BRL −9.7%",
    secondary: "MXN −6.3% · JPY −5.2%",
    trend: "down",
    trendLabel: "Weakening",
    status: "elevated",
    signal: "4 of 6 monitored currencies now above risk threshold; BRL breached 6.00",
  },
  {
    label: "Central Bank Rates",
    primary: "Fed 3.00%",
    secondary: "ECB 1.50% · PBOC 2.75%",
    trend: "down",
    trendLabel: "Easing",
    status: "positive",
    signal: "Fed cut 25bp in April; ECB cut 25bp in March; PBOC eased 10bp in April",
  },
  {
    label: "Energy Prices",
    primary: "Brent $74/bbl",
    secondary: "TTF €33 · Coal $108/t",
    trend: "down",
    trendLabel: "Softening",
    status: "positive",
    signal: "Crude easing on OPEC+ compliance slippage; TTF normalised post-winter; coal declining",
  },
  {
    label: "Equity Volatility (VIX)",
    primary: "VIX 18.4",
    secondary: "52-wk range: 12.1–28.6",
    trend: "stable",
    trendLabel: "Contained",
    status: "caution",
    signal: "Elevated vs historical mean (15.5) but below stress threshold; tariff headline risk persists",
  },
];
