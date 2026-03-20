// src/app/admin/page.tsx
"use client";

import Link from "next/link";
import { useData } from "@/contexts/data-context";

const adminModules = [
  {
    href: "/admin/structure",
    title: "Category Structure",
    description: "Add, rename, reorder, or delete report categories and subcategories (L0 → L1 → L2).",
    icon: "🗂",
  },
  {
    href: "/admin/sections",
    title: "Section Management",
    description: "Create new report sections, reassign categories, or remove sections from the report.",
    icon: "📄",
  },
  {
    href: "/admin/team",
    title: "SME Management",
    description: "Manage the pool of assignable subject matter experts and view per-SME workload.",
    icon: "👥",
  },
  {
    href: "/admin/settings",
    title: "Report Settings",
    description: "Edit the report title, period, and other metadata shown across the app.",
    icon: "⚙️",
  },
  {
    href: "/admin/workflow",
    title: "Workflow Oversight",
    description: "Override section statuses, bulk-reset sections, and monitor sections awaiting action.",
    icon: "🔁",
  },
  {
    href: "/admin/prompts",
    title: "Prompt Management",
    description: "Edit the universal AI prompt template, manage version history, and add per-section prompt overrides.",
    icon: "🤖",
  },
];

export default function AdminPage() {
  const { sections, categoryTree, smeList, reportMeta } = useData();

  const stats = [
    { label: "Total sections", value: sections.length },
    { label: "Categories", value: categoryTree.length },
    { label: "SMEs", value: smeList.length },
    {
      label: "Approved",
      value: sections.filter((s) => s.status === "approved").length,
    },
    {
      label: "Needs action",
      value: sections.filter(
        (s) => s.status === "revision_needed" || s.status === "in_review"
      ).length,
    },
  ];

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-zinc-100">Admin</h1>
        <p className="text-sm text-zinc-400 mt-1">
          {reportMeta.title} — {reportMeta.period}
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-5 gap-3 mb-10">
        {stats.map(({ label, value }) => (
          <div
            key={label}
            className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-center"
          >
            <p className="text-xl font-semibold text-zinc-100">{value}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Module cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {adminModules.map((mod) => (
          <Link
            key={mod.href}
            href={mod.href}
            className="group block bg-zinc-900 border border-zinc-800 rounded-lg p-5 hover:border-zinc-600 transition-colors"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl leading-none mt-0.5">{mod.icon}</span>
              <div>
                <p className="text-sm font-semibold text-zinc-200 group-hover:text-zinc-100 transition-colors">
                  {mod.title}
                </p>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                  {mod.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
