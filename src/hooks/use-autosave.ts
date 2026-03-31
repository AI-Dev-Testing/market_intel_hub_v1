// src/hooks/use-autosave.ts
"use client";

import { useEffect, useRef } from "react";

const AUTOSAVE_PREFIX = "gpsc_draft_autosave_";

export interface AutosaveEntry {
  draft: string;
  savedAt: string; // ISO timestamp
}

export function useAutosave(sectionId: string, draft: string, enabled: boolean) {
  const key = `${AUTOSAVE_PREFIX}${sectionId}`;
  const draftRef = useRef(draft);
  draftRef.current = draft;

  // Save to localStorage on every draft change (only when there are unsaved changes)
  useEffect(() => {
    if (!enabled || !draftRef.current) return;
    const entry: AutosaveEntry = { draft: draftRef.current, savedAt: new Date().toISOString() };
    localStorage.setItem(key, JSON.stringify(entry));
  }, [key, enabled, draft]);

  function getAutosaved(): AutosaveEntry | null {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as AutosaveEntry;
    } catch {
      return null;
    }
  }

  function clearAutosave() {
    localStorage.removeItem(key);
  }

  return { getAutosaved, clearAutosave };
}
