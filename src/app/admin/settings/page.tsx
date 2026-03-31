// src/app/admin/settings/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useData } from "@/contexts/data-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AdminSettingsPage() {
  const { sections, reportMeta, updateReportMeta, isSummaryLoading, isSummaryStale, regenerateSummary } = useData();
  const [title, setTitle] = useState(reportMeta.title);
  const [period, setPeriod] = useState(reportMeta.period);
  const [published, setPublished] = useState(reportMeta.published);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);

  const isDirty =
    title !== reportMeta.title ||
    period !== reportMeta.period ||
    published !== reportMeta.published;

  const incompleteSections = sections.filter((s) => s.status !== "approved");

  const handlePublishToggle = () => {
    const turningOn = !published;
    if (turningOn && incompleteSections.length > 0) {
      setShowPublishConfirm(true);
    } else {
      setPublished((v) => !v);
    }
  };

  // After save, isDirty becomes false and the button disables — no flash state needed
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateReportMeta({ title: title.trim(), period: period.trim(), published });
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

      {/* Publish confirmation modal */}
      {showPublishConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-sm w-full shadow-xl mx-4">
            <h2 className="text-sm font-semibold text-zinc-100 mb-2">Publish with incomplete sections?</h2>
            <p className="text-xs text-zinc-400 mb-3">
              {incompleteSections.length} section{incompleteSections.length !== 1 ? "s are" : " is"} not yet approved:
            </p>
            <ul className="space-y-1 mb-4 max-h-40 overflow-y-auto">
              {incompleteSections.map((s) => (
                <li key={s.id} className="text-xs text-zinc-400 flex items-center gap-2">
                  <span className={cn(
                    "px-1.5 py-0.5 rounded-full text-xs",
                    s.status === "revision_needed" ? "bg-orange-900/50 text-orange-300" :
                    s.status === "in_review" ? "bg-yellow-900/50 text-yellow-300" :
                    s.status === "draft" ? "bg-blue-900/50 text-blue-300" :
                    "bg-zinc-800 text-zinc-400"
                  )}>{s.status.replace("_", " ")}</span>
                  {s.title}
                </li>
              ))}
            </ul>
            <div className="flex gap-2 justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowPublishConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => { setPublished(true); setShowPublishConfirm(false); }}
              >
                Publish anyway
              </Button>
            </div>
          </div>
        </div>
      )}

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
              onClick={handlePublishToggle}
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
        </div>
      </form>

      {/* Executive Summary */}
      <div className="mt-8 space-y-3 pt-6 border-t border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-zinc-200">Executive Summary</h3>
            {isSummaryStale && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-950/50 border border-amber-800/60 text-amber-400">
                Outdated
              </span>
            )}
          </div>
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
        {isSummaryStale && (
          <p className="text-xs text-amber-500/80">
            One or more sections were approved after this summary was last generated. Regenerate to reflect the latest content.
          </p>
        )}
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
