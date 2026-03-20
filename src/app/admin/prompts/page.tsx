// src/app/admin/prompts/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useData } from "@/contexts/data-context";
import { DEFAULT_USER_PROMPT_TEMPLATE } from "@/lib/data/sections";
import { SectionPromptOverride } from "@/types";

// ---------- Section Override Modal ----------

interface OverrideModalProps {
  sectionId: string;
  sectionTitle: string;
  existing?: SectionPromptOverride;
  onSave: (override: SectionPromptOverride) => void;
  onClose: () => void;
}

function OverrideModal({ sectionId: _sectionId, sectionTitle, existing, onSave, onClose }: OverrideModalProps) {
  const [systemPrompt, setSystemPrompt] = useState(existing?.systemPrompt ?? "");
  const [userPromptTemplate, setUserPromptTemplate] = useState(existing?.userPromptTemplate ?? "");

  const handleSave = () => {
    const override: SectionPromptOverride = {};
    if (systemPrompt.trim()) override.systemPrompt = systemPrompt.trim();
    if (userPromptTemplate.trim()) override.userPromptTemplate = userPromptTemplate.trim();
    onSave(override);
  };

  const hasContent = systemPrompt.trim() || userPromptTemplate.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">Section Prompt Override</h3>
            <p className="text-xs text-zinc-500 mt-0.5">{sectionTitle}</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 text-lg leading-none">×</button>
        </div>

        <div className="px-5 py-4 space-y-5">
          <p className="text-xs text-zinc-500">
            Fields left blank inherit from the universal prompt. Only fill in what you want to override for this section.
          </p>

          {/* System Prompt */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-400">System Prompt Override</label>
            <p className="text-xs text-zinc-600">Leave blank to use the universal system prompt.</p>
            <Textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Optional system prompt override for this section only..."
              className="min-h-20 bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 text-xs resize-y font-mono"
            />
          </div>

          {/* User Prompt Template */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-400">User Prompt Template Override</label>
            <p className="text-xs text-zinc-600">
              Leave blank to use the universal template. Use the same{" "}
              <code className="text-zinc-400">{"{{placeholders}}"}</code> as the universal template.
            </p>
            <Textarea
              value={userPromptTemplate}
              onChange={(e) => setUserPromptTemplate(e.target.value)}
              placeholder="Optional user prompt template override..."
              className="min-h-48 bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 text-xs resize-y font-mono"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-zinc-800">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-zinc-400">
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!hasContent}>
            Save Override
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------- Main Page ----------

const PLACEHOLDERS = ["{{title}}", "{{category}}", "{{subcategory}}", "{{period}}", "{{references}}", "{{webSources}}", "{{instructions}}"];

export default function PromptsAdminPage() {
  const {
    sections,
    promptConfig,
    saveUniversalPrompt,
    rollbackUniversalPrompt,
    setSectionPromptOverride,
    clearSectionPromptOverride,
  } = useData();

  // Universal prompt editing state
  const [systemPrompt, setSystemPrompt] = useState(promptConfig.current.systemPrompt);
  const [userPromptTemplate, setUserPromptTemplate] = useState(promptConfig.current.userPromptTemplate);
  const [changeNote, setChangeNote] = useState("");
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const [saved, setSaved] = useState(false);

  const isUnchanged =
    systemPrompt === promptConfig.current.systemPrompt &&
    userPromptTemplate === promptConfig.current.userPromptTemplate;

  const handleSave = () => {
    saveUniversalPrompt(systemPrompt, userPromptTemplate, changeNote);
    setChangeNote("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleRollback = (version: number) => {
    rollbackUniversalPrompt(version);
    // Sync editor to the restored version — find it in history before rollback
    const target = promptConfig.history.find((h) => h.version === version);
    if (target) {
      setSystemPrompt(target.systemPrompt);
      setUserPromptTemplate(target.userPromptTemplate);
    }
  };

  const handleResetToDefault = () => {
    setUserPromptTemplate(DEFAULT_USER_PROMPT_TEMPLATE);
    setSystemPrompt("");
  };

  // Section overrides
  const [addingSectionId, setAddingSectionId] = useState<string | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState("");

  const sectionsWithOverride = sections.filter((s) => s.promptOverride);
  const sectionsWithoutOverride = sections.filter((s) => !s.promptOverride);

  const modalSection = addingSectionId
    ? sections.find((s) => s.id === addingSectionId)
    : editingSectionId
    ? sections.find((s) => s.id === editingSectionId)
    : null;

  const handleOverrideSave = (override: SectionPromptOverride) => {
    const targetId = addingSectionId ?? editingSectionId;
    if (targetId) {
      setSectionPromptOverride(targetId, override);
    }
    setAddingSectionId(null);
    setEditingSectionId(null);
  };

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
              ← Admin
            </Link>
          </div>
          <h1 className="text-xl font-semibold text-zinc-100">Prompt Management</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Edit the AI prompt templates used for draft generation.
          </p>
        </div>
      </div>

      {/* ── Universal Prompt ─────────────────────────────────────── */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-zinc-200">Universal Prompt</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              v{promptConfig.current.version} · saved {promptConfig.current.savedAt} ·{" "}
              <span className="text-zinc-600">"{promptConfig.current.note}"</span>
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleResetToDefault}
            className="text-xs text-zinc-500 hover:text-zinc-300"
          >
            Reset to default
          </Button>
        </div>

        <div className="space-y-4">
          {/* System Prompt (collapsible) */}
          <div className="border border-zinc-800 rounded-lg overflow-hidden">
            <button
              onClick={() => setShowSystemPrompt((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 transition-colors"
            >
              <span className="flex items-center gap-2">
                System Prompt
                {promptConfig.current.systemPrompt ? (
                  <span className="bg-zinc-700 text-zinc-300 px-1.5 py-0.5 rounded text-xs">configured</span>
                ) : (
                  <span className="text-zinc-600">(optional — most sections leave this blank)</span>
                )}
              </span>
              <span className="text-zinc-600">{showSystemPrompt ? "▲" : "▼"}</span>
            </button>
            {showSystemPrompt && (
              <div className="px-4 pb-4 pt-1 border-t border-zinc-800 bg-zinc-900/30">
                <Textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Optional system-level instructions sent before the user message..."
                  className="min-h-24 bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 text-xs resize-y font-mono mt-2"
                />
              </div>
            )}
          </div>

          {/* User Prompt Template */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-400">User Prompt Template</label>
              <div className="flex flex-wrap gap-1 justify-end">
                {PLACEHOLDERS.map((p) => (
                  <code key={p} className="text-xs bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-mono">
                    {p}
                  </code>
                ))}
              </div>
            </div>
            <Textarea
              value={userPromptTemplate}
              onChange={(e) => setUserPromptTemplate(e.target.value)}
              className="min-h-80 bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 text-xs resize-y font-mono leading-relaxed"
            />
          </div>

          {/* Save row */}
          <div className="flex items-center gap-3">
            <Input
              value={changeNote}
              onChange={(e) => setChangeNote(e.target.value)}
              placeholder="Optional: describe what changed (e.g. 'Added semiconductor focus')"
              className="flex-1 h-8 text-xs bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
            />
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isUnchanged || saved}
            >
              {saved ? "Saved ✓" : "Save as new version"}
            </Button>
          </div>
          {isUnchanged && (
            <p className="text-xs text-zinc-600">No changes to save.</p>
          )}
        </div>

        {/* Version History */}
        {promptConfig.history.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Version History</h3>
            <div className="border border-zinc-800 rounded-lg divide-y divide-zinc-800 overflow-hidden">
              {promptConfig.history.map((v) => (
                <div key={v.version} className="flex items-center justify-between px-4 py-3">
                  <div className="min-w-0">
                    <span className="text-xs font-medium text-zinc-300">v{v.version}</span>
                    <span className="text-xs text-zinc-600 ml-2">{v.savedAt}</span>
                    <span className="text-xs text-zinc-500 ml-2">· "{v.note}"</span>
                  </div>
                  <button
                    onClick={() => handleRollback(v.version)}
                    className="text-xs text-zinc-400 hover:text-zinc-100 border border-zinc-700 hover:border-zinc-500 px-3 py-1 rounded transition-colors flex-shrink-0 ml-4"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── Section-Specific Overrides ───────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-zinc-200">Section Overrides</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Override the prompt for individual sections. Overrides take precedence over the universal prompt.
            </p>
          </div>
        </div>

        {/* Add override */}
        <div className="flex items-center gap-2 mb-5">
          <select
            value={selectedSectionId}
            onChange={(e) => setSelectedSectionId(e.target.value)}
            className="flex-1 h-8 text-xs bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-md px-3 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          >
            <option value="">Select a section to override…</option>
            {sectionsWithoutOverride.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} ({s.category})
              </option>
            ))}
          </select>
          <Button
            size="sm"
            variant="outline"
            disabled={!selectedSectionId}
            onClick={() => {
              setAddingSectionId(selectedSectionId);
              setSelectedSectionId("");
            }}
          >
            Add override
          </Button>
        </div>

        {sectionsWithOverride.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-zinc-800 rounded-lg">
            <p className="text-sm text-zinc-600">No section overrides configured</p>
            <p className="text-xs text-zinc-700 mt-1">
              All sections use the universal prompt above.
            </p>
          </div>
        ) : (
          <div className="border border-zinc-800 rounded-lg divide-y divide-zinc-800 overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-3 items-center px-4 py-2 bg-zinc-900/60">
              <span className="text-xs text-zinc-500 font-medium">Section</span>
              <span className="text-xs text-zinc-500 font-medium text-center">System?</span>
              <span className="text-xs text-zinc-500 font-medium text-center">Template?</span>
              <span></span>
              <span></span>
            </div>
            {sectionsWithOverride.map((section) => (
              <div
                key={section.id}
                className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-3 items-center px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-xs font-medium text-zinc-200 truncate">{section.title}</p>
                  <p className="text-xs text-zinc-600 mt-0.5">{section.category}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded text-center ${section.promptOverride?.systemPrompt ? "bg-zinc-700 text-zinc-300" : "text-zinc-700"}`}>
                  {section.promptOverride?.systemPrompt ? "Yes" : "—"}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded text-center ${section.promptOverride?.userPromptTemplate ? "bg-zinc-700 text-zinc-300" : "text-zinc-700"}`}>
                  {section.promptOverride?.userPromptTemplate ? "Yes" : "—"}
                </span>
                <button
                  onClick={() => setEditingSectionId(section.id)}
                  className="text-xs text-zinc-400 hover:text-zinc-100 border border-zinc-700 hover:border-zinc-500 px-3 py-1 rounded transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => clearSectionPromptOverride(section.id)}
                  className="text-xs text-zinc-500 hover:text-red-400 border border-zinc-800 hover:border-red-800 px-3 py-1 rounded transition-colors"
                >
                  Clear
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Override modal */}
      {modalSection && (
        <OverrideModal
          sectionId={modalSection.id}
          sectionTitle={modalSection.title}
          existing={modalSection.promptOverride}
          onSave={handleOverrideSave}
          onClose={() => {
            setAddingSectionId(null);
            setEditingSectionId(null);
          }}
        />
      )}
    </div>
  );
}
