// src/app/admin/settings/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useData } from "@/contexts/data-context";

export default function AdminSettingsPage() {
  const { reportMeta, updateReportMeta } = useData();
  const [title, setTitle] = useState(reportMeta.title);
  const [period, setPeriod] = useState(reportMeta.period);
  const [saved, setSaved] = useState(false);

  const isDirty = title !== reportMeta.title || period !== reportMeta.period;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateReportMeta({ title: title.trim(), period: period.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <div className="text-xs text-zinc-500 mb-1">
          <Link href="/admin" className="hover:text-zinc-300">Admin</Link>
          {" / "}Report Settings
        </div>
        <h1 className="text-xl font-semibold text-zinc-100">Report Settings</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Edit metadata shown across the dashboard, report view, and nav bar.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label className="block text-xs text-zinc-400 mb-1.5">Report title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-zinc-500"
          />
          <p className="text-xs text-zinc-600 mt-1">
            Shown in the navigation bar and report page header.
          </p>
        </div>

        <div>
          <label className="block text-xs text-zinc-400 mb-1.5">Report period</label>
          <input
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            placeholder="e.g. Q2 2026"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-zinc-500"
          />
          <p className="text-xs text-zinc-600 mt-1">
            Shown in the dashboard subtitle and report page.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={!isDirty}
            className="px-4 py-2 text-sm bg-zinc-100 text-zinc-900 font-medium rounded-md hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save changes
          </button>
          {saved && (
            <span className="text-xs text-green-400">Saved</span>
          )}
        </div>
      </form>

      <div className="mt-10 border-t border-zinc-800 pt-6">
        <p className="text-xs text-zinc-500">
          <strong className="text-zinc-400">Note:</strong> All data is held in memory and resets on page refresh (Phase 1 prototype). Database persistence will be added in Phase 2.
        </p>
      </div>
    </div>
  );
}
