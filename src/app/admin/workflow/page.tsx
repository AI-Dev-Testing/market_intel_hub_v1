// src/app/admin/workflow/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useData } from "@/contexts/data-context";
import { SectionStatus, STATUS_LABELS, STATUS_COLORS } from "@/types";

const ALL_STATUSES: SectionStatus[] = [
  "pending",
  "draft",
  "in_review",
  "revision_needed",
  "approved",
];

export default function AdminWorkflowPage() {
  const { sections, updateSection } = useData();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<SectionStatus>("pending");
  const [filterStatus, setFilterStatus] = useState<SectionStatus | "all">("all");
  const [confirmBulk, setConfirmBulk] = useState(false);

  const filtered = sections.filter(
    (s) => filterStatus === "all" || s.status === filterStatus
  );

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((s) => s.id)));
    }
  };

  const applyBulk = () => {
    selected.forEach((id) => updateSection(id, { status: bulkStatus }));
    setSelected(new Set());
    setConfirmBulk(false);
  };

  // Sections needing admin attention
  const needsAction = sections.filter(
    (s) => s.status === "in_review" || s.status === "revision_needed"
  );

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <div className="text-xs text-zinc-500 mb-1">
          <Link href="/admin" className="hover:text-zinc-300">Admin</Link>
          {" / "}Workflow Oversight
        </div>
        <h1 className="text-xl font-semibold text-zinc-100">Workflow Oversight</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Override section statuses and monitor sections awaiting action.
        </p>
      </div>

      {/* Needs action banner */}
      {needsAction.length > 0 && (
        <div className="mb-6 bg-yellow-950/30 border border-yellow-900/50 rounded-lg px-4 py-3">
          <p className="text-xs font-medium text-yellow-400 mb-2">
            {needsAction.length} section{needsAction.length !== 1 ? "s" : ""} awaiting action
          </p>
          <div className="space-y-1">
            {needsAction.map((s) => (
              <div key={s.id} className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[s.status]}`}>
                  {STATUS_LABELS[s.status]}
                </span>
                <Link
                  href={`/sections/${s.id}`}
                  className="text-xs text-zinc-300 hover:text-zinc-100 hover:underline"
                >
                  {s.title}
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controls row */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs text-zinc-400">Filter:</label>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value as SectionStatus | "all"); setSelected(new Set()); }}
            className="text-xs bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-zinc-200 outline-none focus:border-zinc-500"
          >
            <option value="all">All statuses</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>

        {selected.size > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-zinc-400">{selected.size} selected →</span>
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value as SectionStatus)}
              className="text-xs bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-zinc-200 outline-none focus:border-zinc-500"
            >
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
            {confirmBulk ? (
              <>
                <span className="text-xs text-orange-400">Apply to {selected.size}?</span>
                <button onClick={applyBulk} className="text-xs text-orange-400 hover:text-orange-300">Yes</button>
                <button onClick={() => setConfirmBulk(false)} className="text-xs text-zinc-500 hover:text-zinc-300">No</button>
              </>
            ) : (
              <button
                onClick={() => setConfirmBulk(true)}
                className="text-xs px-3 py-1.5 bg-zinc-700 text-zinc-200 rounded hover:bg-zinc-600"
              >
                Apply
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/60">
              <th className="px-4 py-2.5 w-8">
                <input
                  type="checkbox"
                  checked={filtered.length > 0 && selected.size === filtered.length}
                  onChange={toggleAll}
                  className="accent-zinc-400"
                />
              </th>
              <th className="text-left text-xs text-zinc-500 font-medium px-3 py-2.5">Section</th>
              <th className="text-left text-xs text-zinc-500 font-medium px-3 py-2.5 hidden sm:table-cell">Category</th>
              <th className="text-left text-xs text-zinc-500 font-medium px-3 py-2.5">Status</th>
              <th className="text-left text-xs text-zinc-500 font-medium px-3 py-2.5">Override</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((section) => (
              <tr
                key={section.id}
                className="border-b border-zinc-800/60 last:border-0 hover:bg-zinc-900/40"
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(section.id)}
                    onChange={() => toggleSelect(section.id)}
                    className="accent-zinc-400"
                  />
                </td>
                <td className="px-3 py-3">
                  <Link
                    href={`/sections/${section.id}`}
                    className="text-zinc-200 hover:text-zinc-100 hover:underline text-xs"
                  >
                    {section.title}
                  </Link>
                </td>
                <td className="px-3 py-3 text-xs text-zinc-500 hidden sm:table-cell">
                  {section.category}
                </td>
                <td className="px-3 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[section.status]}`}>
                    {STATUS_LABELS[section.status]}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <select
                    value={section.status}
                    onChange={(e) =>
                      updateSection(section.id, { status: e.target.value as SectionStatus })
                    }
                    className="text-xs bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-zinc-200 outline-none focus:border-zinc-500"
                  >
                    {ALL_STATUSES.map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-xs text-zinc-600">
                  No sections match this filter
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
