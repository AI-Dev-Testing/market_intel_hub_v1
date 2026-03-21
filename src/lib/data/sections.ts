// src/lib/data/sections.ts
import { CategoryNode, FreightTrendData, PromptConfig, ReportMeta, ReportSection, RiskScorecardData } from "@/types";

export const INITIAL_SECTIONS: ReportSection[] = [
  {
    id: "macro-overview",
    title: "Macroeconomic Outlook at a Glance",
    category: "Macroeconomic Outlook",
    subcategory: "Macro Overview",
    assignedSme: "John Chen",
    status: "approved",
    draft: "Macroeconomic conditions in Q1 2026 present a cautiously improving outlook. Manufacturing activity has returned to expansionary territory globally — US PMI 52.4, China 51.1, Eurozone 50.2 — the first broad-based expansion since mid-2024, signalling improving demand conditions for H2 2026 sourcing. GDP growth remains resilient but uneven: the US holds at 2.2% while the EU continues to lag at 1.4%, with China stabilising around 4.4–4.5%. Currency risk is the primary procurement concern, with BRL (−8.4%), MXN (−5.1%), and JPY (−4.7%) all recording meaningful YTD depreciations against the USD — unhedged exposure in these currencies requires urgent reassessment for H2 contracts. All three major central banks are in active easing cycles (Fed 3.25%, ECB 1.75%, PBOC 2.85%), providing a supportive financing backdrop for capital equipment procurement. Energy costs present a mixed picture: Brent has firmed to $80/bbl on OPEC+ discipline, while European natural gas is retracing sharply from January peaks — a meaningful tailwind for European manufacturing costs through Q2.",
    lastUpdated: "2026-03-20",
    notes: "",
  },
  {
    id: "macro-pmi",
    title: "Manufacturing PMI Tracker",
    category: "Macroeconomic Outlook",
    subcategory: "Manufacturing PMI",
    assignedSme: "John Chen",
    status: "approved",
    draft: "Global manufacturing activity has returned to expansionary territory in Q1 2026 after an extended contraction. The US ISM Manufacturing PMI reached 52.4 in February 2026, its highest reading in 18 months, driven by new orders recovery in automotive and capital goods. China's PMI held above 51 on the back of policy stimulus, while the Eurozone edged above the 50 threshold for the first time since mid-2024. The broad-based recovery signals improving demand conditions across electronics and industrial components — a positive leading indicator for procurement teams planning H2 2026 volumes.",
    lastUpdated: "2026-03-15",
    notes: "",
  },
  {
    id: "macro-gdp",
    title: "GDP Outlook",
    category: "Macroeconomic Outlook",
    subcategory: "GDP Outlook",
    assignedSme: "John Chen",
    status: "approved",
    draft: "Global GDP growth is projected at 2.8–2.9% through H1 2026, moderating from the 3.1% expansion seen in Q1 2025. The US economy continues to outperform with 2.2% growth forecasted for Q1 2026, though higher-for-longer rate expectations are beginning to weigh on capital expenditure. China's growth trajectory is stabilising around 4.4–4.5%, supported by targeted fiscal stimulus but constrained by weak domestic consumption and property sector headwinds. The EU recovery remains the most fragile, with Q1 2026 growth expected at 1.4% as energy costs and export demand pressures persist.",
    lastUpdated: "2026-03-15",
    notes: "",
  },
  {
    id: "macro-fx",
    title: "Currency & FX Risk Assessment",
    category: "Macroeconomic Outlook",
    subcategory: "Currency & FX Risk Assessment",
    assignedSme: "John Chen",
    status: "approved",
    draft: "All six monitored currencies have weakened against the USD year-to-date, with the Brazilian Real (-8.4%) and Mexican Peso (-5.1%) facing the most significant depreciation driven by political risk and commodity price softness. The Japanese Yen (-4.7%) remains under pressure despite recent Bank of Japan intervention, adding cost exposure for electronics components sourced from Japanese suppliers. CNY weakness has been controlled (-2.1%) through PBOC management, limiting direct procurement cost impact from Chinese suppliers. Procurement teams with unhedged exposure in BRL, MXN, or JPY should assess contract repricing risk for H2 2026.",
    lastUpdated: "2026-03-15",
    notes: "",
  },
  {
    id: "macro-rates",
    title: "Central Bank Rate Environment",
    category: "Macroeconomic Outlook",
    subcategory: "Central Bank Rate Environment",
    assignedSme: "John Chen",
    status: "approved",
    draft: "All three major central banks are in active easing cycles following aggressive rate hikes in 2023–2024. The Federal Reserve has cut rates by 225 basis points from the 5.50% peak, currently holding at 3.25% after pausing the cutting cycle in Q4 2025. The ECB has been the most aggressive cutter, reducing its deposit rate from 4.00% to 1.75% — a 225bp reduction — as eurozone growth underperformed. The PBOC has eased steadily to 2.85% (1Y LPR) to support economic recovery. Lower rates generally support electronics demand by reducing borrowing costs for capital equipment and consumer credit, though the pace of further cuts is increasingly data-dependent.",
    lastUpdated: "2026-03-15",
    notes: "",
  },
  {
    id: "macro-energy",
    title: "Energy Prices Outlook",
    category: "Macroeconomic Outlook",
    subcategory: "Energy Prices",
    assignedSme: "John Chen",
    status: "approved",
    draft: "Energy commodity prices present a mixed picture for Q2 2026. Brent crude has firmed to $80/bbl on OPEC+ supply discipline and improving demand signals from China, though forward markets suggest modest softening to $77 by May. Dutch TTF natural gas surged to €52/MWh in January on cold European weather but is retracing toward €30–35 by spring as LNG supply normalises — a significant tailwind for European manufacturing costs. Newcastle thermal coal continues its orderly decline from the post-2022 highs, now at $116/t and trending toward $109 by mid-year as Chinese domestic output recovers and global industrial demand remains subdued.",
    lastUpdated: "2026-03-15",
    notes: "",
  },
  {
    id: "sc-overview",
    title: "Supply Chain Risk Dashboard",
    category: "Supply Chain Risks",
    subcategory: "Risk Overview",
    assignedSme: "Sarah Martinez",
    status: "approved",
    draft: "Overall supply chain risk posture for Q2 2026 is ELEVATED, with Compliance/ESG (10/10) and Natural Hazard/Climate (8/10) emerging as the highest-priority categories requiring immediate attention from procurement leadership. Regulatory enforcement density — particularly in Europe under EUDR, CSRD, and EU Battery Regulation — has reached levels where gaps in supplier traceability now represent a production-stop risk, not merely a reputational concern. Natural hazard exposure is acutely concentrated in Southeast Asia, where Taiwan and Japan semiconductor fabrication clusters enter peak typhoon season in April concurrent with above-average monsoon risk to Malaysia and Thailand OSAT operations. Logistics disruption (6/10) remains structurally elevated on Red Sea rerouting, while Geopolitical/Trade risk (5/10) sits at a moderate-and-manageable level with policy escalation potential but no immediate forced-action triggers. Procurement teams should prioritise ESG traceability remediation and climate business continuity planning before the H2 2026 sourcing cycle begins.",
    lastUpdated: "2026-03-18",
    notes: "",
  },
  {
    id: "sc-compliance",
    title: "Compliance & ESG Risk",
    category: "Supply Chain Risks",
    subcategory: "Compliance / ESG",
    assignedSme: "Sarah Martinez",
    status: "draft",
    draft: "Compliance and ESG risk has reached a critical threshold for electronics procurement teams in Q2 2026, driven by converging enforcement regimes across multiple jurisdictions. The EU Deforestation Regulation (EUDR), now in active enforcement for large operators, extends due diligence obligations to upstream mineral and packaging suppliers — an area where many electronics supply chains have limited traceability coverage. The Uyghur Forced Labor Prevention Act (UFLPA) enforcement actions in the US have expanded beyond solar to electronics, with CBP issuing withhold-and-examine notices to importers with indirect exposure through Chinese cotton, polysilicon, and aluminum supply chains. The EU Battery Regulation's traceability and carbon footprint requirements take effect progressively from 2026, requiring battery-adjacent component suppliers to provide digital product passports. Audit capacity in Southeast Asia and Latin America remains critically constrained, with third-party auditors reporting 8–12 week lead times for Tier 2 supplier assessments. Procurement teams are advised to accelerate upstream supplier mapping, prioritise remediation for flagged entities, and establish documented due diligence trails before Q3 2026 contract renewals.",
    lastUpdated: "2026-03-18",
    notes: "",
  },
  {
    id: "sc-climate",
    title: "Natural Hazard & Climate Risk",
    category: "Supply Chain Risks",
    subcategory: "Natural Hazard / Climate",
    assignedSme: "Sarah Martinez",
    status: "draft",
    draft: "Natural hazard and climate risk presents the most acute near-term supply chain disruption scenario for Q2 2026, with the Pacific typhoon season beginning in April and directly threatening semiconductor fabrication clusters in Taiwan, Japan, and South Korea — regions accounting for over 70% of advanced-node wafer capacity. Meteorological forecasts indicate a more active-than-average typhoon season for the Western Pacific corridor, while above-average monsoon rainfall is projected for peninsular Malaysia and northern Thailand, both of which host significant OSAT infrastructure for packaging and testing. Historical disruption data from Typhoon Morakot (2009) and the 2011 Thailand floods demonstrates that a single severe weather event in these geographies can extend lead times by 8–16 weeks and trigger industry-wide allocation. Business continuity planning for critical sub-tier suppliers in climate-exposed zones remains materially underdeveloped; procurement teams with single-source exposure to SEA-based OSAT, substrate, or connector suppliers should initiate immediate buffer stock reviews and alternative sourcing assessments.",
    lastUpdated: "2026-03-18",
    notes: "",
  },
  {
    id: "sc-logistics",
    title: "Logistics & Transportation Risk",
    category: "Supply Chain Risks",
    subcategory: "Logistics & Transportation",
    assignedSme: "Sarah Martinez",
    status: "in_review",
    draft: "Logistics and transportation risk remains structurally elevated in Q2 2026, anchored by the continued Red Sea disruption and constrained air freight capacity that has persisted since late 2023. Vessel rerouting around the Cape of Good Hope has added 10–14 days to Asia-Europe transit times, with carrier surcharges keeping ocean freight rates 30–45% above pre-disruption baselines on key trade lanes. Air freight, while still 35% above pre-COVID reference levels, is showing modest softening as belly capacity from passenger recovery gradually supplements dedicated cargo operations. The Strait of Malacca remains the primary concentration risk for Southeast Asia component flows — any escalation of regional tensions or severe weather event at Singaporean or Malaysian ports would simultaneously affect semiconductor, passive component, and connector shipments. Procurement teams are advised to review safety stock buffers for critical components on Asia-Europe lanes and ensure carrier diversification across at least two ocean-freight partnerships for high-value consignments.",
    lastUpdated: "2026-03-18",
    notes: "",
  },
  {
    id: "sc-geopolitical",
    title: "Geopolitical & Trade Risk",
    category: "Supply Chain Risks",
    subcategory: "Geopolitical / Trade",
    assignedSme: "Sarah Martinez",
    status: "approved",
    draft: "Geopolitical and trade risk sits at a moderate level for Q2 2026, with US-China export control escalation remaining the primary structural concern for electronics procurement. The US Bureau of Industry and Security (BIS) has continued to expand the Entity List with Chinese semiconductor equipment and advanced chip designers, indirectly affecting component sourcing strategies for buyers with Chinese Tier 2 exposure. Tariff structures under Section 301 and the anticipated review of IEEPA-based measures on electronics imports maintain price uncertainty for procurement planning through H2 2026. In Europe, dual-use export control harmonisation under the EU's updated Dual-Use Regulation is increasing compliance complexity for distributors, with reclassification notices affecting specific analog and RF component families. Near-term escalation probability is assessed as moderate — no imminent forced-action trigger is visible — but the velocity of potential new restrictions remains high, given the precedent of overnight entity list additions. Procurement teams should maintain current classification hygiene, ensure broker readiness for rapid commodity reclassification, and continue dual-sourcing progress for components with single-source concentration in restricted geographies.",
    lastUpdated: "2026-03-18",
    notes: "",
  },
  {
    id: "semi-analog",
    title: "Analog Semiconductors Market Update",
    category: "Product Categories",
    subcategory: "SEMICONDUCTORS > Analog",
    assignedSme: "David Kim",
    status: "approved",
    draft: "Analog semiconductor demand remains resilient in automotive and industrial applications, offsetting weakness in consumer electronics. Major suppliers Texas Instruments and ADI report inventory normalization with lead times stabilizing at 12-16 weeks.",
    lastUpdated: "2026-03-14",
    notes: "",
  },
  {
    id: "semi-discrete",
    title: "Discrete Semiconductors Outlook",
    category: "Product Categories",
    subcategory: "SEMICONDUCTORS > Discrete",
    assignedSme: "David Kim",
    status: "in_review",
    draft: "Power discrete components face pricing pressure as inventory levels remain elevated following the 2025 overbuild cycle. MOSFETs and IGBTs show early signs of demand recovery in EV and industrial power segments, with pricing expected to stabilize by Q3 2026.",
    lastUpdated: "2026-03-17",
    notes: "",
  },
  {
    id: "semi-logic",
    title: "Logic ICs Supply & Demand",
    category: "Product Categories",
    subcategory: "SEMICONDUCTORS > Logic",
    assignedSme: "David Kim",
    status: "draft",
    draft: "Standard logic IC inventory levels have normalized across the distribution channel. Lead times for commodity logic have returned to historical norms of 8-12 weeks. Demand growth is driven by AI infrastructure buildout and automotive electronics content increases.",
    lastUpdated: "2026-03-18",
    notes: "",
  },
  {
    id: "semi-highend",
    title: "High-End Semiconductors (FPGA/ASIC)",
    category: "Product Categories",
    subcategory: "SEMICONDUCTORS > High-End",
    assignedSme: "",
    status: "pending",
    draft: "",
    lastUpdated: "2026-03-10",
    notes: "",
  },
  {
    id: "passive-cap",
    title: "Capacitors Market Intelligence",
    category: "Product Categories",
    subcategory: "PASSIVE COMPONENTS > Capacitors",
    assignedSme: "Lisa Park",
    status: "approved",
    draft: "MLCC pricing has stabilized following the Q1 2026 correction driven by excess inventory. Murata and TDK have announced modest price increases for automotive-grade MLCCs effective Q2 2026. Overall capacitor market conditions favor buyers with spot pricing 8-12% below contract.",
    lastUpdated: "2026-03-13",
    notes: "",
  },
  {
    id: "em-connectors",
    title: "Connectors Supply Update",
    category: "Product Categories",
    subcategory: "ELECTROMECHANICAL > Connectors",
    assignedSme: "Marcus Johnson",
    status: "pending",
    draft: "",
    lastUpdated: "2026-03-10",
    notes: "",
  },

  // Transport & Logistics
  {
    id: "tl-overview",
    title: "Transport & Logistics at a Glance",
    category: "Transport & Logistics",
    subcategory: "TL Overview",
    assignedSme: "John Chen",
    status: "approved",
    draft: "Transport and logistics conditions in Q2 2026 are characterized by elevated ocean freight costs and ongoing structural disruption from Red Sea/Suez diversions. The FBX composite holds above $3,200/FEU, with transpacific eastbound rates surging 18% quarter-on-quarter as importers front-load shipments ahead of US tariff deadlines — compressed booking windows and equipment tightness at Manzanillo and Lázaro Cárdenas are the primary near-term operational risks. Air freight remains a controlled cost: TAC yield is stable at $2.85/kg on the Asia–US West Coast lane as robust belly capacity from passenger airlines — operating at 98% of pre-COVID levels — suppresses freighter-only rates, with no material sea-to-air modal shift detected in the electronics segment. Industry-wide schedule reliability sits at 62% (Sea-Intelligence GLP index), still 8 percentage points below the pre-COVID 70% baseline, though the Transatlantic lane outperforms at 71% on-time. Overall capacity conditions are moderate: alliance blank sailing volumes are normalising post-Q1 surge, vessel utilisation is tracking at ~88% on transpacific lanes, and charter market availability remains ample. Procurement teams should monitor transpacific booking windows closely, ensure buffer stock accounts for schedule variability on Red Sea-diverted lanes, and avoid reliance on air freight as a cost-equivalent fallback given the current rate premium.",
    lastUpdated: "2026-03-21",
    notes: "",
  },
  {
    id: "tl-ocean-rates",
    title: "Ocean Freight Rates & Index",
    category: "Transport & Logistics",
    subcategory: "Ocean Freight Rates & Index",
    assignedSme: "",
    status: "pending",
    draft: "",
    lastUpdated: "2026-03-20",
    notes: "Key sources: Freightos FBX composite + sub-indexes (FBX01 Transpacific EB, FBX11 Asia–N.Europe, FBX13 Transatlantic), Drewry WCI, SCFI. Include capacity signals: blank sailings (Sea-Intelligence), equipment availability, port congestion at LA/LB, Rotterdam, Shanghai/Ningbo, Manzanillo.",
  },
  {
    id: "tl-air-rates",
    title: "Air Freight Rates & Capacity",
    category: "Transport & Logistics",
    subcategory: "Air Freight Rates & Capacity",
    assignedSme: "",
    status: "pending",
    draft: "",
    lastUpdated: "2026-03-20",
    notes: "Key sources: TAC Index, IATA Air Cargo Market Statistics, Xeneta Air. Cover belly capacity vs. dedicated freighter split. Focus on Asia–North America and Asia–Europe lanes. Flag any sea-to-air modal shift signals.",
  },
  {
    id: "tl-trade-lanes",
    title: "Key Trade Lane Developments",
    category: "Transport & Logistics",
    subcategory: "Key Trade Lane Developments",
    assignedSme: "",
    status: "pending",
    draft: "",
    lastUpdated: "2026-03-20",
    notes: "Cover 4 lanes: Transpacific (China→US), Asia–Europe (Red Sea/Suez diversion status), Trans-Americas/Near-shore (China→Mexico, nearshoring flows), Transatlantic (US↔EU). Include schedule reliability % (Sea-Intelligence GLP index) per lane.",
  },
];

// Kept for backwards-compat with any remaining static imports; context now owns the live tree.
export const CATEGORIES = [
  "Macroeconomic Topics",
  "Supply Chain Risks",
  "Product Categories",
] as const;

export const INITIAL_CATEGORY_TREE: CategoryNode[] = [
  {
    id: "cat-macro",
    name: "Macroeconomic Outlook",
    subcategories: [
      { id: "sub-macro-overview", name: "Macro Overview",                 children: [] },
      { id: "sub-pmi",            name: "Manufacturing PMI",              children: [] },
      { id: "sub-gdp",   name: "GDP Outlook",                   children: [] },
      { id: "sub-fx",    name: "Currency & FX Risk Assessment",  children: [] },
      { id: "sub-rates",  name: "Central Bank Rate Environment",  children: [] },
      { id: "sub-energy", name: "Energy Prices",                   children: [] },
    ],
  },
  {
    id: "cat-sc",
    name: "Supply Chain Risks",
    subcategories: [
      { id: "sub-sc-overview",     name: "Risk Overview",              children: [] },
      { id: "sub-sc-compliance",   name: "Compliance / ESG",           children: [] },
      { id: "sub-sc-climate",      name: "Natural Hazard / Climate",   children: [] },
      { id: "sub-sc-logistics",    name: "Logistics & Transportation", children: [] },
      { id: "sub-sc-geopolitical", name: "Geopolitical / Trade",       children: [] },
    ],
  },
  {
    id: "cat-product",
    name: "Product Categories",
    subcategories: [
      {
        id: "sub-semi",
        name: "SEMICONDUCTORS",
        children: [
          { id: "sub-semi-analog",    name: "Analog",    children: [] },
          { id: "sub-semi-discrete",  name: "Discrete",  children: [] },
          { id: "sub-semi-logic",     name: "Logic",     children: [] },
          { id: "sub-semi-highend",   name: "High-End",  children: [] },
        ],
      },
      {
        id: "sub-passive",
        name: "PASSIVE COMPONENTS",
        children: [
          { id: "sub-passive-cap", name: "Capacitors", children: [] },
        ],
      },
      {
        id: "sub-em",
        name: "ELECTROMECHANICAL",
        children: [
          { id: "sub-em-connectors", name: "Connectors", children: [] },
        ],
      },
    ],
  },
  {
    id: "cat-tl",
    name: "Transport & Logistics",
    subcategories: [
      { id: "sub-tl-overview",    name: "TL Overview",                   children: [] },
      { id: "sub-tl-ocean-rates", name: "Ocean Freight Rates & Index",   children: [] },
      { id: "sub-tl-air-rates",   name: "Air Freight Rates & Capacity",  children: [] },
      { id: "sub-tl-trade-lanes", name: "Key Trade Lane Developments",   children: [] },
    ],
  },
];

export const INITIAL_SME_LIST: string[] = [
  "John Chen",
  "Sarah Martinez",
  "David Kim",
  "Lisa Park",
  "Marcus Johnson",
];

export const INITIAL_REPORT_META: ReportMeta = {
  title: "GPSC Market Intelligence Report",
  period: "Q2 2026",
  published: false,
  executiveSummary: "",
};

// The initial universal prompt — extracted verbatim from the original hardcoded buildPrompt()
// function in src/lib/openrouter/client.ts, with dynamic values replaced by {{placeholders}}.
export const DEFAULT_USER_PROMPT_TEMPLATE = `You are a market intelligence analyst writing a section for a GPSC (Government and Public Sector Contracts) Market Intelligence Report.

Write a concise 2-3 paragraph intelligence brief for the following section:

Section Title: {{title}}
Category: {{category}}
Subcategory: {{subcategory}}
Report Date: {{period}}

Requirements:
- Write in a professional, factual intelligence report style
- Include specific data points, trends, and forward-looking statements where appropriate
- Focus on supply chain, procurement, and market conditions relevant to GPSC buyers
- Keep each paragraph 3-5 sentences
- Do NOT use headers, bullet points, or markdown formatting — plain prose only{{references}}{{webSources}}{{instructions}}

Begin writing the intelligence brief now:`;

export const INITIAL_PROMPT_CONFIG: PromptConfig = {
  current: {
    version: 1,
    systemPrompt: "",
    userPromptTemplate: DEFAULT_USER_PROMPT_TEMPLATE,
    savedAt: "2026-03-15",
    note: "Initial prompt",
  },
  history: [],
};

export const INITIAL_SCORECARDS: Record<string, RiskScorecardData> = {
  "sc-geopolitical": {
    overallScore: 5,
    likelihood: {
      score: 3,
      description: "Policy changes possible but near-term enforcement variability is manageable; no imminent escalation signalled",
    },
    impact: {
      score: 4,
      description: "Customs delays, tariff cost exposure, restricted party list compliance gaps affecting Tier 2 sourcing",
    },
    velocity: {
      score: 4,
      description: "New export controls or sanctions can take effect within days; entity list additions are unpredictable",
    },
    regions: [
      { name: "Americas", score: 3, description: "US tariff variability and UFLPA enforcement actions increasing; near-shoring momentum creating compliance complexity" },
      { name: "Europe",   score: 3, description: "EU dual-use export controls tightening; sanctions compliance burden growing across distributor networks" },
      { name: "China",    score: 4, description: "US-China export control escalation; restricted party list exposure across Tier 2 and Tier 3 suppliers" },
      { name: "SE Asia",  score: 3, description: "Growing alternative sourcing hub but audit and HS classification coverage gaps remain unaddressed" },
    ],
  },
  "sc-logistics": {
    overallScore: 6,
    likelihood: {
      score: 4,
      description: "Red Sea diversions continue; air freight capacity constrained; port congestion episodic",
    },
    impact: {
      score: 3,
      description: "Asia-Europe transit time +10–14 days; air freight 35% above baseline; missed commit risk moderate",
    },
    velocity: {
      score: 3,
      description: "Disruptions build over days to weeks; early warning signals (vessel tracking, weather) generally available",
    },
    regions: [
      { name: "Americas", score: 2, description: "Port congestion easing on both coasts; air freight capacity improving but rates remain elevated" },
      { name: "Europe",   score: 4, description: "Red Sea rerouting via Cape of Good Hope adds 10–14 days to Asia-Europe lanes; carrier surcharges persisting" },
      { name: "China",    score: 3, description: "Port capacity stable; labour disruption risk low; inbound congestion risk as typhoon season approaches" },
      { name: "SE Asia",  score: 4, description: "Major transit hub concentration at Strait of Malacca; OSAT and component export delays tied to Red Sea rerouting" },
    ],
  },
  "sc-climate": {
    overallScore: 8,
    likelihood: {
      score: 4,
      description: "Above-average typhoon season forecast for Western Pacific; monsoon risk elevated for peninsular Malaysia and Thailand",
    },
    impact: {
      score: 5,
      description: "Single severe event can extend lead times 8–16 weeks; industry-wide allocation risk for advanced-node wafers and OSAT",
    },
    velocity: {
      score: 5,
      description: "Typhoons and floods develop within 48–72 hours; little advance warning for supply chain repositioning",
    },
    regions: [
      { name: "Americas", score: 2, description: "Hurricane risk limited to specific Q3 routes; Panama Canal low-water recurring but manageable" },
      { name: "Europe",   score: 2, description: "Minimal direct manufacturing exposure; energy supply disruption tail risk remains" },
      { name: "China",    score: 3, description: "Typhoon risk to coastal clusters; Yangtze river flooding risk for inland logistics" },
      { name: "SE Asia",  score: 5, description: "Taiwan/Japan fab clusters enter peak typhoon season April; OSAT flooding risk in Malaysia/Thailand; little advance warning" },
    ],
  },
  "sc-compliance": {
    overallScore: 10,
    likelihood: {
      score: 5,
      description: "Known traceability gaps; enforcement expanding under EUDR, UFLPA, EU Battery Regulation",
    },
    impact: {
      score: 5,
      description: "Production holds, customer escalations, legal and reputational exposure",
    },
    velocity: {
      score: 3,
      description: "Moderate ramp — but a major audit finding can trigger immediate production stops",
    },
    regions: [
      { name: "Americas", score: 3, description: "UFLPA enforcement expanding; SEC climate disclosure rules adding traceability demand" },
      { name: "Europe",   score: 5, description: "EUDR, CSRD, EU Battery Regulation, CBAM all active or imminent — highest regulatory density globally" },
      { name: "China",    score: 4, description: "Forced labour scrutiny on upstream materials; audit access restrictions hampering third-party verification" },
      { name: "SE Asia",  score: 4, description: "Tin/tantalum/cobalt mining ESG gaps; labour audit backlogs 8–12 weeks for Tier 2 suppliers" },
    ],
  },
};

export const INITIAL_FREIGHT_TRENDS: Record<string, FreightTrendData> = {
  "tl-ocean-rates": {
    rates:        { level: 4, headline: "$3,200/FEU", note: "FBX composite elevated ~$3,200/FEU; tariff front-loading ahead of US peak season driving spot rate pressure." },
    capacity:     { level: 3, headline: "~88% utilisation", note: "Alliance blank sailing volumes normalizing after Q1 surge; vessel utilization at ~88% on Transpacific lanes." },
    availability: { level: 3, headline: "Balanced", note: "Equipment availability balanced in major hubs; minor dry-box shortages reported at Manzanillo." },
  },
  "tl-air-rates": {
    rates:        { level: 3, headline: "$2.85/kg", note: "TAC Index yield at $2.85/kg on Asia–US WC lane, stable QoQ; belly capacity suppressing freighter-only rates." },
    capacity:     { level: 2, headline: "98% pre-COVID", note: "Belly capacity robust with passenger travel at 98% of pre-COVID levels; ample freighter lift available." },
    availability: { level: 2, headline: "Ample", note: "Charter market quiet; no significant modal shift from ocean to air observed in electronics segment." },
  },
  "tl-trade-lanes": {
    rates:        { level: 4, headline: "EB +18% QoQ", note: "Transpacific EB rates up 18% QoQ on tariff-driven demand pull; Asia–Europe stable despite Cape diversion costs." },
    capacity:     { level: 3, headline: "62% on-time", note: "Schedule reliability at 62% industry-wide (Sea-Intelligence); Transatlantic outperforming at 71% on-time." },
    availability: { level: 3, headline: "Manzanillo tight", note: "Near-shore lanes (China–Mexico) seeing space tightness; Manzanillo and Lázaro Cárdenas congestion elevated." },
  },
};
