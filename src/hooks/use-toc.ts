// src/hooks/use-toc.ts
"use client";

import { useState, useEffect, useRef } from "react";

/**
 * Tracks which section element is currently visible near the top of the
 * viewport using the Intersection Observer API. Returns the active section ID.
 *
 * @param sectionIds - array of element IDs to observe (e.g. ["macro-overview", "sc-logistics"])
 */
export function useTOC(sectionIds: string[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);
  // Persist the set of currently intersecting elements across batches
  const intersectingRef = useRef<Map<string, IntersectionObserverEntry>>(new Map());

  useEffect(() => {
    if (sectionIds.length === 0) return;

    const handleIntersect: IntersectionObserverCallback = (entries) => {
      // Update the persistent intersecting map
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          intersectingRef.current.set(entry.target.id, entry);
        } else {
          intersectingRef.current.delete(entry.target.id);
        }
      });

      // Pick the intersecting entry whose top edge is closest to viewport top
      const sorted = [...intersectingRef.current.values()].sort(
        (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
      );

      setActiveId(sorted.length > 0 ? sorted[0].target.id : null);
    };

    const observer = new IntersectionObserver(handleIntersect, {
      // Fire when element top crosses 80px below the viewport top
      rootMargin: "-80px 0px -55% 0px",
      threshold: 0,
    });

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
      intersectingRef.current.clear();
    };
  }, [sectionIds.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  return activeId;
}
