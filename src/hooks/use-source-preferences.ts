// src/hooks/use-source-preferences.ts
"use client";

import { useState, useCallback } from "react";

const WL_KEY = "gpsc_source_whitelist";
const BL_KEY = "gpsc_source_blacklist";

function readList(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) ?? "[]");
  } catch {
    return [];
  }
}

function writeList(key: string, list: string[]) {
  localStorage.setItem(key, JSON.stringify(list));
}

export function useSourcePreferences() {
  const [whitelist, setWhitelistState] = useState<string[]>(() => readList(WL_KEY));
  const [blacklist, setBlacklistState] = useState<string[]>(() => readList(BL_KEY));

  const addToWhitelist = useCallback((domain: string) => {
    setWhitelistState((prev) => {
      const next = prev.includes(domain) ? prev : [...prev, domain];
      writeList(WL_KEY, next);
      return next;
    });
    setBlacklistState((prev) => {
      const next = prev.filter((d) => d !== domain);
      writeList(BL_KEY, next);
      return next;
    });
  }, []);

  const addToBlacklist = useCallback((domain: string) => {
    setBlacklistState((prev) => {
      const next = prev.includes(domain) ? prev : [...prev, domain];
      writeList(BL_KEY, next);
      return next;
    });
    setWhitelistState((prev) => {
      const next = prev.filter((d) => d !== domain);
      writeList(WL_KEY, next);
      return next;
    });
  }, []);

  const removePreference = useCallback((domain: string) => {
    setWhitelistState((prev) => { const next = prev.filter((d) => d !== domain); writeList(WL_KEY, next); return next; });
    setBlacklistState((prev) => { const next = prev.filter((d) => d !== domain); writeList(BL_KEY, next); return next; });
  }, []);

  const getDomainStatus = useCallback(
    (domain: string): "whitelisted" | "blacklisted" | "neutral" => {
      if (whitelist.includes(domain)) return "whitelisted";
      if (blacklist.includes(domain)) return "blacklisted";
      return "neutral";
    },
    [whitelist, blacklist]
  );

  return { whitelist, blacklist, addToWhitelist, addToBlacklist, removePreference, getDomainStatus };
}
