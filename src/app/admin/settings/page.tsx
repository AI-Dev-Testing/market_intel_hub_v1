// src/app/admin/settings/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useData } from "@/contexts/data-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AdminSettingsPage() {
  const { reportMeta, updateReportMeta, isSummaryLoading, regenerateSummary } = useData();
  const [title, setTitle] = useState(reportMeta.title);
  const [period, setPeriod] = useState(reportMeta.period);
  const [published, setPublished] = useState(reportMeta.published);
  const [saved, setSaved] = useState(false);

  const isDirty =
    title !== reportMeta.title ||
    period !== reportMeta.period ||
    published !== reportMeta.published;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateReportMeta({ title: title.trim(), period: period.trim(), published });
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

        {/* Report Phase toggle */}
        <div className="space-y-2">
          <label className="block text-xs text-zinc-400">Report phase</label>
          <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3">
            <div>
              <p className="text-sm font-medium text-zinc-300">
                {published ? "Published" : "Drafting"}
              </p>
              <p className="text-xs text-zinc-600">
                {published
                  ? "Report is live — executive summary auto-updates when sections are approved"
                  : "Report is in drafting phase — summary will not auto-update"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => { setPublished((v) => !v); }}
              className={cn(
                "relative w-11 h-6 rounded-full transition-colors flex-shrink-0",
                published ? "bg-blue-500" : "bg-zinc-700"
              )}
            >
              <span
                className={cn(
                  "absolute top-1 left-0 w-4 h-4 rounded-full bg-white shadow transition-transform",
                  published ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
          </div>
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

      {/* Executive Summary */}
      <div className="mt-8 space-y-3 pt-6 border-t border-zinc-800">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-zinc-200">Executive Summary</h3>
          <Button
            size="sm"
            variant="outline"
            onClick={regenerateSummary}
            disabled={isSummaryLoading}
          >
            {isSummaryLoading ? "Generating..." : "Regenerate Summary"}
          </Button>
        </div>
        <p className="text-xs text-zinc-600">
          AI-generated summary of all approved sections.{" "}
          {reportMeta.summaryUpdatedAt
            ? `Last updated ${new Date(reportMeta.summaryUpdatedAt).toLocaleString()}.`
            : "Not yet generated."}
        </p>
        {reportMeta.executiveSummary ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-xs text-zinc-400 whitespace-pre-wrap leading-relaxed">
            {reportMeta.executiveSummary}
          </div>
        ) : (
          <p className="text-xs text-zinc-600 italic">
            No summary yet — click &quot;Regenerate Summary&quot; to generate one.
          </p>
        )}
      </div>

      <div className="mt-8 border-t border-zinc-800 pt-6">
        <p className="text-xs text-zinc-500">
          <strong className="text-zinc-400">Note:</strong> All data is held in memory and resets on page refresh (Phase 1 prototype). Database persistence will be added in Phase 2.
        </p>
      </div>
    </div>
  );
}
