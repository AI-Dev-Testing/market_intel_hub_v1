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
    primary: "US 52.4",
    secondary: "CN 51.1 · EU 50.2",
    trend: "up",
    trendLabel: "Expanding",
    status: "positive",
    signal: "First broad-based expansion since mid-2024",
  },
  {
    label: "GDP Growth",
    primary: "US +2.2%",
    secondary: "CN +4.4% · EU +1.4%",
    trend: "stable",
    trendLabel: "Moderating",
    status: "caution",
    signal: "EU recovery remains fragile; US outperforming",
  },
  {
    label: "FX Risk",
    primary: "BRL −8.4%",
    secondary: "MXN −5.1% · JPY −4.7%",
    trend: "down",
    trendLabel: "Weakening",
    status: "elevated",
    signal: "3 of 6 monitored currencies above risk threshold",
  },
  {
    label: "Central Bank Rates",
    primary: "Fed 3.25%",
    secondary: "ECB 1.75% · PBOC 2.85%",
    trend: "down",
    trendLabel: "Easing",
    status: "caution",
    signal: "All three banks in active cutting cycles",
  },
  {
    label: "Energy Prices",
    primary: "Brent $80/bbl",
    secondary: "TTF €52 · Coal $116/t",
    trend: "mixed",
    trendLabel: "Mixed",
    status: "caution",
    signal: "Gas normalising; crude firming on OPEC+ discipline",
  },
];
