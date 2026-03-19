# GPSC Market Intelligence Report

Internal collaborative web application for GPSC Market Intelligence report production. SMEs collaborate on intelligence collection across defined report sections, with AI-assisted drafting and a structured review/approval workflow.

---

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Updating Section Background Images

Each report section in the Report view displays a thematic background image pulled from [Unsplash](https://unsplash.com). All image mappings live in a single file:

**`src/lib/data/section-images.ts`**

### How it works

The file exports a `SECTION_IMAGES` object that maps each section ID to an Unsplash photo URL:

```ts
"macro-gdp": "https://images.unsplash.com/photo-<PHOTO_ID>?auto=format&fit=crop&w=800&q=60",
```

The section IDs correspond to sections defined in `src/lib/data/sections.ts`.

### To swap an image

1. Go to [unsplash.com](https://unsplash.com) and find a photo you like.
2. Click the photo, then click **Download** → right-click the downloaded image or copy the URL from the browser address bar after clicking through. The photo ID is the long alphanumeric string in the URL, e.g. `photo-1486325212027-8081e485255e`.
3. Open `src/lib/data/section-images.ts`.
4. Find the section you want to update (e.g. `"macro-gdp"`).
5. Replace the existing photo ID with your new one:

```ts
// Before
"macro-gdp": "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=60",

// After — paste your new photo ID
"macro-gdp": "https://images.unsplash.com/photo-YOUR_NEW_PHOTO_ID?auto=format&fit=crop&w=800&q=60",
```

6. Save the file. The change appears immediately in the dev server.

### To add an image for a new section

If a new section is added to `src/lib/data/sections.ts`, add a matching entry in `section-images.ts` using its `id` field as the key. Sections without a mapped image fall back to a plain dark header bar — they still work, just without a photo.

### Current section → image mapping

| Section ID | Topic |
|---|---|
| `macro-gdp` | Global GDP Outlook |
| `macro-inflation` | Inflation & Monetary Policy |
| `macro-fx` | Currency & FX Risk |
| `macro-rates` | Interest Rate Environment |
| `sc-geopolitical` | Geopolitical Disruptions |
| `sc-logistics` | Logistics & Shipping |
| `sc-supplier` | Supplier Concentration Risk |
| `semi-analog` | Semiconductors: Analog |
| `semi-discrete` | Semiconductors: Discrete |
| `semi-logic` | Semiconductors: Logic |
| `semi-highend` | Semiconductors: High-End |
| `passive-cap` | Passive Components: Capacitors |
| `em-connectors` | Electromechanical: Connectors |
