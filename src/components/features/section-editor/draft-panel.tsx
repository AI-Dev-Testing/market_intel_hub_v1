// src/components/features/section-editor/draft-panel.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ReportSection } from "@/types";

interface DraftPanelProps {
  section: ReportSection;
  onDraftChange: (draft: string) => void;
}

export function DraftPanel({ section, onDraftChange }: DraftPanelProps) {
  const [draft, setDraft] = useState(section.draft);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleDraftChange = (value: string) => {
    setDraft(value);
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    onDraftChange(draft);
    setHasUnsavedChanges(false);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await fetch("/api/generate-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionTitle: section.title,
          category: section.category,
          subcategory: section.subcategory,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate draft");
      }
      setDraft(data.draft);
      onDraftChange(data.draft);
      setHasUnsavedChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-zinc-300">Draft Content</h2>
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <Button size="sm" onClick={handleSave}>
              Save Changes
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? "Generating..." : draft ? "Regenerate with AI" : "Generate with AI"}
          </Button>
        </div>
      </div>
      {error && (
        <div className="text-xs text-red-400 bg-red-950/50 border border-red-900 rounded-md p-3">
          Error: {error}
        </div>
      )}
      <Textarea
        value={draft}
        onChange={(e) => handleDraftChange(e.target.value)}
        placeholder="Draft content will appear here. Click 'Generate with AI' to create an initial draft, or type directly."
        className="min-h-64 bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 text-sm leading-relaxed resize-y"
      />
      <p className="text-xs text-zinc-600">
        {draft.length} characters · Last updated: {section.lastUpdated}
      </p>
    </div>
  );
}
