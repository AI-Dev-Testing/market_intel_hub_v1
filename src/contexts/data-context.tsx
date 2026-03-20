"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import {
  CategoryNode,
  DataContextValue,
  ReportMeta,
  ReportSection,
  SubcategoryNode,
} from "@/types";
import {
  INITIAL_SECTIONS,
  INITIAL_CATEGORY_TREE,
  INITIAL_SME_LIST,
  INITIAL_REPORT_META,
} from "@/lib/data/sections";

const DataContext = createContext<DataContextValue | null>(null);

// ---------- helpers ----------

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function today(): string {
  return new Date().toISOString().split("T")[0];
}

function renameInTree(
  nodes: SubcategoryNode[],
  id: string,
  name: string
): SubcategoryNode[] {
  return nodes.map((n) =>
    n.id === id
      ? { ...n, name }
      : { ...n, children: renameInTree(n.children, id, name) }
  );
}

function deleteFromTree(
  nodes: SubcategoryNode[],
  id: string
): SubcategoryNode[] {
  return nodes
    .filter((n) => n.id !== id)
    .map((n) => ({ ...n, children: deleteFromTree(n.children, id) }));
}

function reorder<T>(arr: T[], index: number, direction: "up" | "down"): T[] {
  const next = [...arr];
  const swap = direction === "up" ? index - 1 : index + 1;
  if (swap < 0 || swap >= next.length) return next;
  [next[index], next[swap]] = [next[swap], next[index]];
  return next;
}

// ---------- provider ----------

export function DataProvider({ children }: { children: ReactNode }) {
  const [sections, setSections] = useState<ReportSection[]>(INITIAL_SECTIONS);
  const [categoryTree, setCategoryTree] =
    useState<CategoryNode[]>(INITIAL_CATEGORY_TREE);
  const [smeList, setSmeList] = useState<string[]>(INITIAL_SME_LIST);
  const [reportMeta, setReportMeta] = useState<ReportMeta>(INITIAL_REPORT_META);

  // ---- existing section methods ----

  const getSectionById = (id: string) => sections.find((s) => s.id === id);

  const updateSection = (id: string, updates: Partial<ReportSection>) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, ...updates, lastUpdated: today() } : s
      )
    );
  };

  // ---- section CRUD ----

  const addSection = (section: Omit<ReportSection, "lastUpdated">) => {
    setSections((prev) => [...prev, { ...section, lastUpdated: today() }]);
  };

  const deleteSection = (id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
  };

  // ---- category CRUD ----

  const addCategory = (name: string) => {
    setCategoryTree((prev) => [
      ...prev,
      { id: generateId(), name, subcategories: [] },
    ]);
  };

  const renameCategory = (id: string, name: string) => {
    setCategoryTree((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name } : c))
    );
  };

  const deleteCategory = (id: string) => {
    setCategoryTree((prev) => prev.filter((c) => c.id !== id));
  };

  const reorderCategory = (id: string, direction: "up" | "down") => {
    setCategoryTree((prev) => {
      const idx = prev.findIndex((c) => c.id === id);
      return reorder(prev, idx, direction);
    });
  };

  const addSubcategory = (categoryId: string, name: string) => {
    setCategoryTree((prev) =>
      prev.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              subcategories: [
                ...c.subcategories,
                { id: generateId(), name, children: [] },
              ],
            }
          : c
      )
    );
  };

  const addL2Subcategory = (l1Id: string, name: string) => {
    const newNode: SubcategoryNode = { id: generateId(), name, children: [] };
    setCategoryTree((prev) =>
      prev.map((c) => ({
        ...c,
        subcategories: c.subcategories.map((s) =>
          s.id === l1Id
            ? { ...s, children: [...s.children, newNode] }
            : s
        ),
      }))
    );
  };

  const renameSubcategory = (id: string, name: string) => {
    setCategoryTree((prev) =>
      prev.map((c) => ({
        ...c,
        subcategories: renameInTree(c.subcategories, id, name),
      }))
    );
  };

  const deleteSubcategory = (id: string) => {
    setCategoryTree((prev) =>
      prev.map((c) => ({
        ...c,
        subcategories: deleteFromTree(c.subcategories, id),
      }))
    );
  };

  const reorderSubcategory = (
    categoryId: string,
    subcategoryId: string,
    direction: "up" | "down"
  ) => {
    setCategoryTree((prev) =>
      prev.map((c) => {
        if (c.id !== categoryId) return c;
        const idx = c.subcategories.findIndex((s) => s.id === subcategoryId);
        return { ...c, subcategories: reorder(c.subcategories, idx, direction) };
      })
    );
  };

  // ---- SME management ----

  const updateSmeList = (smes: string[]) => setSmeList(smes);

  // ---- report metadata ----

  const updateReportMeta = (meta: Partial<ReportMeta>) =>
    setReportMeta((prev) => ({ ...prev, ...meta }));

  return (
    <DataContext.Provider
      value={{
        sections,
        getSectionById,
        updateSection,
        addSection,
        deleteSection,
        categoryTree,
        addCategory,
        renameCategory,
        deleteCategory,
        reorderCategory,
        addSubcategory,
        addL2Subcategory,
        renameSubcategory,
        deleteSubcategory,
        reorderSubcategory,
        smeList,
        updateSmeList,
        reportMeta,
        updateReportMeta,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextValue {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within a DataProvider");
  return context;
}

// Flatten the category tree into { label, category, subcategory } options for dropdowns.
// e.g. "Product Categories › SEMICONDUCTORS › Analog"
export function flattenCategoryTree(
  tree: CategoryNode[]
): { label: string; category: string; subcategory: string }[] {
  const result: { label: string; category: string; subcategory: string }[] = [];
  for (const cat of tree) {
    if (cat.subcategories.length === 0) {
      result.push({ label: cat.name, category: cat.name, subcategory: "" });
      continue;
    }
    for (const sub of cat.subcategories) {
      if (sub.children.length === 0) {
        result.push({
          label: `${cat.name} › ${sub.name}`,
          category: cat.name,
          subcategory: sub.name,
        });
      } else {
        for (const child of sub.children) {
          result.push({
            label: `${cat.name} › ${sub.name} › ${child.name}`,
            category: cat.name,
            subcategory: `${sub.name} > ${child.name}`,
          });
        }
      }
    }
  }
  return result;
}
