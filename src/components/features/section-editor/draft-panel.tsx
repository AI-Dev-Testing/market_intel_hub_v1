// src/components/features/section-editor/draft-panel.tsx
"use client";

import { useState, KeyboardEvent, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ReportSection, SectionStatus, Source } from "@/types";
import { useSourcePreferences } from "@/hooks/use-source-preferences";
import { useAutosave } from "@/hooks/use-autosave";
import { useData } from "@/contexts/data-context";
import { cn } from "@/lib/utils";

interface DraftPanelProps {
  section: ReportSection;
  onDraftChange: (draft: string) => void;
  onSourcesChange?: (sources: Source[]) => void;
  onStatusChange?: (status: SectionStatus) => void;
}

interface Reference {
  id: string;
  type: "url" | "text";
  content: string;
}

type UrlFetchStatus = "fetched" | "fallback" | "failed";

export function DraftPanel({ section, onDraftChange, onSourcesChange, onStatusChange }: DraftPanelProps) {
  const isApproved = section.status === 'approved';
  const [draft, setDraft] = useState(section.draft);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // AI options state
  const [showOptions, setShowOptions] = useState(false);
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [urls, setUrls] = useState<string[]>([]);
  const [referenceText, setReferenceText] = useState("");
  const [instructions, setInstructions] = useState("");
  const [sources, setSources] = useState<Source[]>([]);
  const [showBlacklist, setShowBlacklist] = useState(false);
  const [urlStatuses, setUrlStatuses] = useState<Record<string, UrlFetchStatus>>({});
  const [generationStatus, setGenerationStatus] = useState<string | null>(null);
  const [showRestoreBanner, setShowRestoreBanner] = useState(false);
  const hasRestoredRef = useRef(false);

  const { getAutosaved, clearAutosave } = useAutosave(section.id, draft, hasUnsavedChanges);

  // Check for autosaved draft on mount
  useEffect(() => {
    if (hasRestoredRef.current || isApproved) return;
    hasRestoredRef.current = true;
    const saved = getAutosaved();
    if (saved && saved.draft !== section.draft) {
      setShowRestoreBanner(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Warn on unsaved changes before navigating away
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsavedChanges]);

  const { promptConfig, scorecards } = useData();
  const { whitelist, blacklist, addToWhitelist, addToBlacklist, removePreference, getDomainStatus } = useSourcePreferences();

  // Resolve effective prompt: section override → universal
  const effectiveSystemPrompt =
    section.promptOverride?.systemPrompt ?? promptConfig.current.systemPrompt;
  const effectiveUserPromptTemplate =
    section.promptOverride?.userPromptTemplate ?? promptConfig.current.userPromptTemplate;

  const handleDraftChange = (value: string) => {
    setDraft(value);
    setHasUnsavedChanges(true);
    if (section.status === 'pending' && value.trim()) {
      onStatusChange?.('draft');
    }
  };

  const handleSave = () => {
    onDraftChange(draft);
    setHasUnsavedChanges(false);
    clearAutosave();
  };

  const extractDomain = (url: string): string => {
    try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return ""; }
  };

  const addUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      setError("URLs must start with http:// or https://");
      return;
    }
    if (urls.includes(trimmed)) return;
    setUrls((prev) => [...prev, trimmed]);
    setUrlInput("");
    setError(null);
    // Auto-whitelist the domain so it is prioritised in future web searches
    const domain = extractDomain(trimmed);
    if (domain) addToWhitelist(domain);
  };

  const removeUrl = (url: string) => {
    setUrls((prev) => prev.filter((u) => u !== url));
  };

  const handleUrlKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); addUrl(); }
  };

  const buildReferences = (): Reference[] => {
    const refs: Reference[] = [];
    urls.forEach((url, i) => refs.push({ id: `url-${i}`, type: "url", content: url }));
    if (referenceText.trim()) {
      refs.push({ id: "text-0", type: "text", content: referenceText });
    }
    return refs;
  };

  const hasOptions = useWebSearch || urls.length > 0 || !!referenceText.trim() || !!instructions.trim();

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setWarnings([]);
    setUrlStatuses({});

    const references = buildReferences();
    const urlCount = urls.length;
    const webSearchOn = useWebSearch;
    setGenerationStatus(
      [
        urlCount > 0 && `Fetching ${urlCount} source${urlCount !== 1 ? "s" : ""}…`,
        webSearchOn && "Searching the web…",
      ]
        .filter(Boolean)
        .join(" ") || "Generating draft…"
    );

    try {
      // window.fetch — browser client component
      const apiFetch = window.fetch.bind(window);
      const response = await apiFetch("/api/generate-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionTitle: section.title,
          category: section.category,
          subcategory: section.subcategory,
          references: references.length > 0 ? references : undefined,
          instructions: instructions.trim() || undefined,
          useWebSearch,
          whitelist,
          blacklist,
          systemPrompt: effectiveSystemPrompt || undefined,
          userPromptTemplate: effectiveUserPromptTemplate || undefined,
          ...(section.id === "sc-overview" && {
            scorecardSummary: Object.entries(scorecards)
              .map(([id, s]) => `${id}: overall ${s.overallScore}/10 (likelihood ${s.likelihood.score}/5, impact ${s.impact.score}/5, velocity ${s.velocity.score}/5)`)
              .join("; "),
          }),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate draft");
      }

      // Build urlStatuses map from API response
      if (Array.isArray(data.urlStatuses)) {
        const statusMap: Record<string, UrlFetchStatus> = {};
        for (const entry of data.urlStatuses) {
          statusMap[entry.url] = entry.status;
        }
        setUrlStatuses(statusMap);

        const fetchedCount = data.urlStatuses.filter((e: { status: string }) => e.status === "fetched").length;
        const fallbackCount = data.urlStatuses.filter((e: { status: string }) => e.status === "fallback").length;
        const webCount = (data.sources ?? []).length;
        const parts = [
          (fetchedCount + fallbackCount) > 0 && `${fetchedCount + fallbackCount} source${(fetchedCount + fallbackCount) !== 1 ? "s" : ""} loaded`,
          webCount > 0 && `${webCount} web result${webCount !== 1 ? "s" : ""} found`,
        ].filter(Boolean);
        setGenerationStatus(parts.length > 0 ? parts.join(", ") + ". Generating draft…" : "Generating draft…");
      }

      if (data.warnings?.length) setWarnings(data.warnings);
      const newSources: Source[] = data.sources ?? [];
      setSources(newSources);
      onSourcesChange?.(newSources);
      setDraft(data.draft);
      onDraftChange(data.draft);
      setHasUnsavedChanges(false);
      clearAutosave();
      if (section.status === "pending" && data.draft?.trim()) {
        onStatusChange?.("draft");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsGenerating(false);
      setGenerationStatus(null);
    }
  };

  return (
    <div className="space-y-3">
      {/* Autosave restore banner */}
      {showRestoreBanner && (
        <div className="flex items-center justify-between bg-zinc-800/60 border border-zinc-700 rounded-md px-3 py-2">
          <p className="text-xs text-zinc-300">
            A saved draft from {(() => {
              const saved = getAutosaved();
              if (!saved) return "earlier";
              const diff = Math.round((Date.now() - new Date(saved.savedAt).getTime()) / 60000);
              return diff < 60 ? `${diff} min ago` : new Date(saved.savedAt).toLocaleTimeString();
            })()} was found.
          </p>
          <div className="flex gap-2 ml-3">
            <button
              onClick={() => {
                const saved = getAutosaved();
                if (saved) { setDraft(saved.draft); setHasUnsavedChanges(true); }
                setShowRestoreBanner(false);
              }}
              className="text-xs text-blue-400 hover:text-blue-200"
            >
              Restore
            </button>
            <button
              onClick={() => { clearAutosave(); setShowRestoreBanner(false); }}
              className="text-xs text-zinc-500 hover:text-zinc-300"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-zinc-300">Draft Content</h2>
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <Button size="sm" onClick={handleSave}>
              Save Changes
            </Button>
          )}
          {!isApproved && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating
                ? "Generating..."
                : draft
                ? "Regenerate with AI"
                : "Generate with AI"}
            </Button>
          )}
        </div>
      </div>

      {/* AI Options Panel — hidden for approved sections */}
      {!isApproved && <div className="border border-zinc-800 rounded-lg overflow-hidden">
        <button
          onClick={() => setShowOptions((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 transition-colors"
        >
          <span className="flex items-center gap-2">
            AI References & Instructions
            {hasOptions && (
              <span className="bg-zinc-700 text-zinc-300 px-1.5 py-0.5 rounded text-xs">
                {[useWebSearch, urls.length > 0, !!referenceText.trim(), !!instructions.trim()].filter(Boolean).length} active
              </span>
            )}
          </span>
          <span className="text-zinc-600">{showOptions ? "▲" : "▼"}</span>
        </button>

        {showOptions && (
          <div className="px-4 pb-4 pt-1 space-y-4 border-t border-zinc-800 bg-zinc-900/30">

            {/* Web Search Toggle */}
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-xs font-medium text-zinc-400">Web Search</p>
                <p className="text-xs text-zinc-600">Search for latest news from reputable sources</p>
              </div>
              <button
                onClick={() => setUseWebSearch((v) => !v)}
                className={cn(
                  "relative w-9 h-5 rounded-full transition-colors flex-shrink-0",
                  useWebSearch ? "bg-blue-500" : "bg-zinc-700"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 left-0 w-4 h-4 rounded-full bg-white shadow transition-transform",
                    useWebSearch ? "translate-x-[18px]" : "translate-x-0.5"
                  )}
                />
              </button>
            </div>

            {/* Source Preferences */}
            {(whitelist.length > 0 || blacklist.length > 0) && (
              <div className="space-y-2 border-t border-zinc-800/50 pt-3">
                <p className="text-xs font-medium text-zinc-500">Source Preferences</p>

                {whitelist.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs text-zinc-600">Prioritised in web search</p>
                    <div className="flex flex-wrap gap-1.5">
                      {whitelist.map((domain) => (
                        <span key={domain} className="flex items-center gap-1 bg-green-950/40 border border-green-900/50 text-green-400 text-xs px-2 py-0.5 rounded-full">
                          {domain}
                          <button onClick={() => removePreference(domain)} className="text-green-700 hover:text-green-300 ml-0.5 leading-none" title="Remove">×</button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {blacklist.length > 0 && (
                  <div className="space-y-1.5">
                    <button
                      onClick={() => setShowBlacklist((v) => !v)}
                      className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
                    >
                      <span className="bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded">{blacklist.length} excluded</span>
                      <span>{showBlacklist ? "▲ hide" : "▼ show"}</span>
                    </button>
                    {showBlacklist && (
                      <div className="flex flex-wrap gap-1.5">
                        {blacklist.map((domain) => (
                          <span key={domain} className="flex items-center gap-1 bg-red-950/20 border border-red-900/30 text-red-400/70 text-xs px-2 py-0.5 rounded-full">
                            {domain}
                            <button onClick={() => removePreference(domain)} className="text-red-700 hover:text-red-300 ml-0.5 leading-none" title="Remove exclusion">×</button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Reference URLs */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400">
                Reference URLs
              </label>
              <p className="text-xs text-zinc-600">
                Paste URLs — the AI will read their content as reference material.
              </p>
              <div className="flex gap-2">
                <Input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={handleUrlKeyDown}
                  placeholder="https://example.com/article"
                  className="flex-1 h-8 text-xs bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
                />
                <Button size="sm" variant="outline" onClick={addUrl} className="h-8 text-xs">
                  Add
                </Button>
              </div>
              {urls.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {urls.map((url) => {
                    const fetchStatus = urlStatuses[url];
                    return (
                      <div
                        key={url}
                        className={cn(
                          "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs max-w-full border",
                          fetchStatus === "fetched"
                            ? "bg-green-950/30 border-green-800/50 text-green-300"
                            : fetchStatus === "fallback"
                            ? "bg-yellow-950/30 border-yellow-800/50 text-yellow-300"
                            : fetchStatus === "failed"
                            ? "bg-red-950/30 border-red-800/50 text-red-300"
                            : "bg-zinc-800 border-zinc-700 text-zinc-300"
                        )}
                      >
                        {fetchStatus === "fetched" && <span title="Fetched directly">✓</span>}
                        {fetchStatus === "fallback" && <span title="Retrieved via extract fallback">⟳</span>}
                        {fetchStatus === "failed" && <span title="Could not retrieve content">✗</span>}
                        <span className="truncate max-w-48">{url}</span>
                        {fetchStatus === "failed" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setUrlStatuses((prev) => { const next = { ...prev }; delete next[url]; return next; });
                            }}
                            className="text-red-400 hover:text-red-200 ml-0.5 text-xs"
                            title="Retry fetch"
                          >
                            ↺
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); removeUrl(url); }}
                          className="text-zinc-500 hover:text-zinc-200 flex-shrink-0 ml-1"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Reference Text */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400">
                Reference Text
              </label>
              <p className="text-xs text-zinc-600">
                Paste excerpts, notes, or data for the AI to draw from directly.
              </p>
              <Textarea
                value={referenceText}
                onChange={(e) => setReferenceText(e.target.value)}
                placeholder="Paste any text you want the AI to reference when writing the draft..."
                className="min-h-20 bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 text-xs resize-y"
              />
            </div>

            {/* Editing Instructions */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400">
                Editing Instructions
              </label>
              <p className="text-xs text-zinc-600">
                Give specific directions: change tone, add detail on a topic, remove something.
              </p>
              <Textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder='e.g. "Make the tone more formal. Add specific data on lead times. Remove the paragraph about pricing."'
                className="min-h-16 bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 text-xs resize-y"
              />
            </div>
          </div>
        )}
      </div>}

      {/* Generation status message */}
      {generationStatus && (
        <div className="text-xs text-zinc-400 bg-zinc-800/40 border border-zinc-700 rounded-md p-3">
          {generationStatus}
        </div>
      )}

      {/* Errors and warnings */}
      {error && (
        <div className="text-xs text-red-400 bg-red-950/50 border border-red-900 rounded-md p-3">
          Error: {error}
        </div>
      )}
      {warnings.length > 0 && (
        <div className="text-xs text-yellow-500 bg-yellow-950/30 border border-yellow-900/50 rounded-md p-3 space-y-1">
          <p className="font-medium">Some URLs could not be fetched:</p>
          {warnings.map((w, i) => <p key={i} className="text-yellow-600">{w}</p>)}
        </div>
      )}

      {/* Sources used in last generation */}
      {sources.length > 0 && (
        <div className="border border-zinc-800 rounded-lg overflow-hidden">
          <p className="px-4 py-2.5 text-xs font-medium text-zinc-400 border-b border-zinc-800 bg-zinc-900/40">
            Sources used ({sources.length})
          </p>
          <div className="divide-y divide-zinc-800">
            {sources.map((source) => {
              const status = getDomainStatus(source.domain);
              return (
                <div key={source.url} className="px-4 py-3 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-zinc-300 hover:text-zinc-100 truncate block"
                    >
                      {source.title}
                    </a>
                    <p className="text-xs text-zinc-600 mt-0.5">{source.domain}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      title="Prioritise this source in future searches"
                      onClick={() => status === "whitelisted" ? removePreference(source.domain) : addToWhitelist(source.domain)}
                      className={cn(
                        "text-xs px-2 py-0.5 rounded border transition-colors",
                        status === "whitelisted"
                          ? "border-green-700 text-green-400 bg-green-950/30"
                          : "border-zinc-700 text-zinc-500 hover:border-green-700 hover:text-green-400"
                      )}
                    >
                      {status === "whitelisted" ? "✓ Prioritised" : "Prioritise"}
                    </button>
                    <button
                      title="Exclude this source from future searches"
                      onClick={() => status === "blacklisted" ? removePreference(source.domain) : addToBlacklist(source.domain)}
                      className={cn(
                        "text-xs px-2 py-0.5 rounded border transition-colors",
                        status === "blacklisted"
                          ? "border-red-800 text-red-400 bg-red-950/30"
                          : "border-zinc-700 text-zinc-500 hover:border-red-800 hover:text-red-400"
                      )}
                    >
                      {status === "blacklisted" ? "✗ Excluded" : "Exclude"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Textarea
        value={draft}
        onChange={(e) => handleDraftChange(e.target.value)}
        readOnly={isApproved}
        placeholder="Draft content will appear here. Click 'Generate with AI' to create an initial draft, or type directly."
        className={cn(
          "min-h-64 bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 text-sm leading-relaxed resize-y",
          isApproved && "opacity-75 cursor-default"
        )}
      />
      <p className="text-xs text-zinc-600">
        {draft.length} characters · Last updated: {section.lastUpdated}
      </p>
    </div>
  );
}
