// src/lib/data/intel-seed.ts
// Phase 1 seed data for the Intel Hub.
// QoQ deltas are hardcoded against a "last quarter" snapshot until Phase 2 persistence.

export type RagStatus = "green" | "amber" | "red";
export type DeltaDirection = "up" | "down" | "flat";

export interface DomainSignal {
  id: string;
  label: string;
  rag: RagStatus;
  ragLabel: string;
  compositeScore: number; // 1–10
  previousScore: number;  // last quarter, hardcoded
  delta: number;          // compositeScore - previousScore
  deltaDirection: DeltaDirection;
  signals: string[];      // 2–3 top signal bullets
  drillPath: string;      // panel route key
}

export interface IntelSeedData {
  domains: DomainSignal[];
  whatChangedSummary: string; // placeholder until AI generation is wired
  lastUpdated: string;
}

export const INTEL_SEED: IntelSeedData = {
  lastUpdated: "May 2026",
  whatChangedSummary:
    "Macroeconomic outlook has improved to Green/Improving as PMI expansion broadens (US 53.1, EU 50.8, CN 51.4) and all three central banks delivered additional Q2 cuts. " +
    "FX risk has intensified — BRL breached 6.00 (−9.7% YTD), 4 of 6 currencies now above threshold. " +
    "Energy costs are now a tailwind: Brent $74/bbl, TTF €33, coal $108/t — all declining. " +
    "Compliance & ESG risk remains Critical (10/10) with EUDR enforcement expanding. " +
    "Ocean freight elevated with transpacific rates up 18% QoQ on tariff front-loading.",
  domains: [
    {
      id: "macro",
      label: "Macroeconomic",
      rag: "green",
      ragLabel: "Improving",
      compositeScore: 4,
      previousScore: 5,
      delta: -1,
      deltaDirection: "down",
      signals: [
        "PMI expansion broadening — US 53.1, China 51.4, Eurozone 50.8; new orders at 18-month high",
        "BRL breached 6.00 (−9.7% YTD); MXN −6.3%, JPY −5.2% — 4 of 6 currencies above risk threshold",
        "Fed cut to 3.00% in April; ECB at 1.50%; PBOC eased to 2.75% — financing conditions supportive",
      ],
      drillPath: "macro",
    },
    {
      id: "sc-risk",
      label: "Supply Chain Risks",
      rag: "red",
      ragLabel: "Elevated",
      compositeScore: 8,
      previousScore: 7,
      delta: 1,
      deltaDirection: "up",
      signals: [
        "Compliance & ESG at Critical (10/10) — EUDR & UFLPA enforcement expanding",
        "Climate risk High (8/10) — typhoon season begins April, SEA OSAT exposure",
        "Logistics Elevated (6/10) — Red Sea diversion adding 10–14 days Asia–Europe",
      ],
      drillPath: "sc-risk",
    },
    {
      id: "electrical",
      label: "Electrical Commodities",
      rag: "amber",
      ragLabel: "Watch",
      compositeScore: 5,
      previousScore: 5,
      delta: 0,
      deltaDirection: "flat",
      signals: [
        "Analog semiconductors stable — lead times 12–16 weeks, inventory normalising",
        "MLCC pricing stabilised; spot 8–12% below contract — buyer-favourable",
        "Logic ICs at historical norms; AI infrastructure demand driving upside risk",
      ],
      drillPath: "electrical",
    },
    {
      id: "mechanical",
      label: "Mechanical Commodities",
      rag: "amber",
      ragLabel: "Watch",
      compositeScore: 4,
      previousScore: 4,
      delta: 0,
      deltaDirection: "flat",
      signals: [
        "Connectors supply stable; no material disruption signals",
        "Discrete power components — pricing pressure from 2025 overbuild persisting",
        "EV and industrial power recovery expected to tighten supply by Q3 2026",
      ],
      drillPath: "mechanical",
    },
    {
      id: "logistics",
      label: "Logistics",
      rag: "red",
      ragLabel: "Elevated",
      compositeScore: 7,
      previousScore: 6,
      delta: 1,
      deltaDirection: "up",
      signals: [
        "Ocean FBX composite ~$3,200/FEU — 30–45% above pre-disruption baseline",
        "Air freight stable at $2.85/kg; belly capacity suppressing freighter rates",
        "Schedule reliability 62% industry-wide — 8pp below pre-COVID baseline",
      ],
      drillPath: "logistics",
    },
  ],
};

// Maps score 1–10 to RAG status
export function scoreToRag(score: number): RagStatus {
  if (score <= 3) return "green";
  if (score <= 6) return "amber";
  return "red";
}

// Maps score 1–10 to label
export function scoreToLabel(score: number): string {
  if (score <= 2) return "Low";
  if (score <= 3) return "Moderate";
  if (score <= 6) return "Elevated";
  if (score <= 8) return "High";
  return "Critical";
}
