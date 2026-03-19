// src/contexts/data-context.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { DataContextValue, ReportSection } from "@/types";
import { INITIAL_SECTIONS } from "@/lib/data/sections";

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [sections, setSections] = useState<ReportSection[]>(INITIAL_SECTIONS);

  const getSectionById = (id: string) =>
    sections.find((s) => s.id === id);

  const updateSection = (id: string, updates: Partial<ReportSection>) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, ...updates, lastUpdated: new Date().toISOString().split("T")[0] }
          : s
      )
    );
  };

  return (
    <DataContext.Provider value={{ sections, getSectionById, updateSection }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextValue {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
