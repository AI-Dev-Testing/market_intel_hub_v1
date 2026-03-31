// src/hooks/use-toc.ts
"use client";

import { useState, useEffect } from "react";

/**
 * Tracks which section element is currently visible near the top of the
 * viewport using the Intersection Observer API. Returns the active section ID.
 *
 * @param sectionIds - array of element IDs to observe (e.g. ["macro-overview", "sc-logistics"])
 */
export function useTOC(sectionIds: string[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (sectionIds.length === 0) return;

    const handleIntersect: IntersectionObserverCallback = (entries) => {
      // Find the intersecting entry whose top edge is closest to viewport top
      const intersecting = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

      if (intersecting.length > 0) {
        setActiveId(intersecting[0].target.id);
      } else {
        setActiveId(null);
      }
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

    return () => observer.disconnect();
  }, [sectionIds.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  return activeId;
}
