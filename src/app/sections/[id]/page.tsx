// src/app/sections/[id]/page.tsx
"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useData } from "@/contexts/data-context";
import { DraftPanel } from "@/components/features/section-editor/draft-panel";
import { WorkflowControls } from "@/components/features/section-editor/workflow-controls";
import { RiskScoresPanel } from "@/components/features/section-editor/risk-scores-panel";
import { FreightTrendPanel } from "@/components/features/section-editor/freight-trend-panel";
import { SECTION_CHARTS } from "@/lib/data/chart-registry";
import { SectionStatus, STATUS_COLORS, STATUS_LABELS, StatusLogEntry, Source } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export default function SectionEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { getSectionById, updateSection, scorecards } = useData();
  const section = getSectionById(id);
  const [notes, setNotes] = useState(section?.notes ?? "");
  const [imageUrl, setImageUrl] = useState(section?.imageUrl ?? "");
  const [imageError, setImageError] = useState(false);
  const ChartComponent = section ? SECTION_CHARTS[section.id] : undefined;

  const notesRef = useRef<HTMLTextAreaElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);

  // Scroll to reviewer feedback panel when section loads in revision_needed state
  useEffect(() => {
    if (section?.status === "revision_needed" && feedbackRef.current) {
      feedbackRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [section?.id]); // Only on initial load / section change

  if (!section) {
    return (
      <div className="text-center py-24">
        <p className="text-zinc-400 mb-4">Section not found</p>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const handleStatusChange = (newStatus: SectionStatus) => {
    updateSection(id, { status: newStatus });
  };

  const handleDraftChange = (draft: string) => {
    updateSection(id, { draft });
  };

  const handleSourcesChange = (sources: Source[]) => {
    updateSection(id, { sources });
  };

  const handleNotesSave = () => {
    updateSection(id, { notes });
  };

  const handleImageUrlSave = () => {
    updateSection(id, { imageUrl: imageUrl.trim() || undefined });
    setImageError(false);
  };

  const handleRevisionGateHit = () => {
    notesRef.current?.focus();
    notesRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="max-w-4xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-zinc-500 mb-6">
        <button
          onClick={() => router.push("/dashboard")}
          className="hover:text-zinc-300 transition-colors"
        >
          Dashboard
        </button>
        <span>/</span>
        <button
          onClick={() => router.push("/dashboard")}
          className="hover:text-zinc-300 transition-colors"
        >
          {section.category}
        </button>
        <span>/</span>
        <span className="text-zinc-300 truncate max-w-xs">{section.title}</span>
      </nav>

      {/* Section Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className={cn("text-xs px-2 py-1 rounded-full", STATUS_COLORS[section.status])}>
            {STATUS_LABELS[section.status]}
          </span>
          <span className="text-xs text-zinc-500">{section.subcategory}</span>
        </div>
        <h1 className="text-xl font-semibold text-zinc-100 mb-1">{section.title}</h1>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span>SME: {section.assignedSme || <span className="italic text-zinc-600">Unassigned</span>}</span>
          <span>Updated: {section.lastUpdated}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main content: draft editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section Brief — read-only guidance visible when pending/draft and notes has content */}
          {(section.status === "pending" || section.status === "draft") && section.notes && (
            <div className="border border-zinc-800 rounded-lg p-3 bg-zinc-900/50">
              <p className="text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wide">Section Brief</p>
              <p className="text-sm text-zinc-400 whitespace-pre-wrap leading-relaxed">{section.notes}</p>
            </div>
          )}
          {ChartComponent && (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
              <p className="text-xs font-medium text-zinc-500 mb-3 uppercase tracking-wide">Market Data</p>
              <ChartComponent />
            </div>
          )}
          {section.category === "Transport & Logistics" && (
            <FreightTrendPanel sectionId={id} />
          )}
          {scorecards[id] && <RiskScoresPanel sectionId={id} />}
          <DraftPanel
            section={section}
            onDraftChange={handleDraftChange}
            onSourcesChange={handleSourcesChange}
            onStatusChange={handleStatusChange}
          />

          {/* Reviewer Notes — hidden during pending and draft */}
          {section.status !== "pending" && section.status !== "draft" && (
            section.status === "revision_needed" ? (
              <div ref={feedbackRef} className="border border-orange-800 rounded-lg p-3 bg-orange-950/30">
                <p className="text-xs font-medium text-orange-400 mb-1.5">&#9888; Reviewer Feedback</p>
                <p className="text-sm text-orange-200/90 whitespace-pre-wrap leading-relaxed">
                  {section.notes || "No specific feedback was provided."}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-zinc-300">
                  {section.status === "in_review"
                    ? `Feedback for ${section.assignedSme || "SME"} — describe what needs to change`
                    : "Reviewer Notes"}
                </h3>
                {section.status === "in_review" && !notes.trim() && (
                  <p className="text-xs text-zinc-500">Required if requesting revision — click &quot;Request Revision&quot; to be prompted.</p>
                )}
                <Textarea
                  ref={notesRef}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onBlur={handleNotesSave}
                  readOnly={section.status === "approved"}
                  placeholder="Describe what needs to change before this section can be approved..."
                  className={cn(
                    "min-h-24 bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 text-sm resize-y",
                    section.status === "approved" && "opacity-75 cursor-default"
                  )}
                />
              </div>
            )
          )}
        </div>

        {/* Sidebar: workflow */}
        <div className="space-y-4">
          <WorkflowControls
            section={section}
            onStatusChange={handleStatusChange}
            reviewerNotes={notes}
            onRevisionGateHit={handleRevisionGateHit}
          />

          {/* Banner Image */}
          <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-900 space-y-2">
            <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Banner Image</h3>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => { setImageUrl(e.target.value); setImageError(false); }}
              onBlur={handleImageUrlSave}
              placeholder="https://example.com/image.jpg"
              className={cn(
                "w-full bg-zinc-950 border rounded-md px-2.5 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-zinc-500",
                imageError ? "border-red-700" : "border-zinc-700"
              )}
            />
            {imageError && (
              <p className="text-xs text-red-400">Image could not be loaded — check the URL.</p>
            )}
            {imageUrl.trim() && !imageError && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt=""
                className="w-full h-16 object-cover rounded border border-zinc-800"
                onError={() => setImageError(true)}
              />
            )}
          </div>

          {/* Status change log */}
          {section.statusHistory && section.statusHistory.length > 0 && (
            <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-900">
              <h3 className="text-xs font-medium text-zinc-400 mb-3 uppercase tracking-wide">History</h3>
              <ol className="space-y-2">
                {[...section.statusHistory].reverse().map((entry: StatusLogEntry, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-xs">
                    <span className="text-zinc-600 mt-0.5 flex-shrink-0">{entry.timestamp}</span>
                    <span className={cn(
                      "px-1.5 py-0.5 rounded-full flex-shrink-0",
                      entry.status === "approved" ? "bg-green-900/50 text-green-300" :
                      entry.status === "revision_needed" ? "bg-orange-900/50 text-orange-300" :
                      entry.status === "in_review" ? "bg-yellow-900/50 text-yellow-300" :
                      "bg-zinc-800 text-zinc-400"
                    )}>
                      {STATUS_LABELS[entry.status]}
                    </span>
                    {entry.note && (
                      <span className="text-zinc-500 line-clamp-1">{entry.note}</span>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
