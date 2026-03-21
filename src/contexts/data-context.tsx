"use client";

import { createContext, useContext, useState, useRef, useEffect, useCallback, ReactNode } from "react";
import {
  CategoryNode,
  DataContextValue,
  FreightTrendData,
  PromptConfig,
  ReportMeta,
  ReportSection,
  RiskScorecardData,
  SectionPromptOverride,
  SubcategoryNode,
} from "@/types";
import {
  INITIAL_SECTIONS,
  INITIAL_CATEGORY_TREE,
  INITIAL_SME_LIST,
  INITIAL_REPORT_META,
  INITIAL_PROMPT_CONFIG,
  INITIAL_SCORECARDS,
  INITIAL_FREIGHT_TRENDS,
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

// Returns the old subcategory string stored on sections for a given subcategory node id,
// plus a factory to build the new string given the new name.
function findSubcategoryContext(
  tree: CategoryNode[],
  id: string
): { oldSub: string; newSub: (name: string) => string; isL1WithChildren: boolean } | null {
  for (const cat of tree) {
    for (const sub of cat.subcategories) {
      if (sub.id === id) {
        return {
          oldSub: sub.name,
          newSub: (n) => n,
          isL1WithChildren: sub.children.length > 0,
        };
      }
      for (const child of sub.children) {
        if (child.id === id) {
          return {
            oldSub: `${sub.name} > ${child.name}`,
            newSub: (n) => `${sub.name} > ${n}`,
            isL1WithChildren: false,
          };
        }
      }
    }
  }
  return null;
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
  const [promptConfig, setPromptConfig] = useState<PromptConfig>(INITIAL_PROMPT_CONFIG);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [scorecards, setScorecards] = useState<Record<string, RiskScorecardData>>(INITIAL_SCORECARDS);
  const [freightTrends, setFreightTrends] = useState<Record<string, FreightTrendData>>(INITIAL_FREIGHT_TRENDS);

  // Refs used by the auto-trigger effect to avoid stale closures and dependency loops
  const publishedRef = useRef(INITIAL_REPORT_META.published);
  publishedRef.current = reportMeta.published;
  const lastApprovedIdsRef = useRef<Set<string>>(
    new Set(INITIAL_SECTIONS.filter((s) => s.status === "approved").map((s) => s.id))
  );

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
    const oldName = categoryTree.find((c) => c.id === id)?.name;
    setCategoryTree((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name } : c))
    );
    if (oldName && oldName !== name) {
      setSections((prev) =>
        prev.map((s) => s.category === oldName ? { ...s, category: name } : s)
      );
    }
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
    const ctx = findSubcategoryContext(categoryTree, id);
    setCategoryTree((prev) =>
      prev.map((c) => ({
        ...c,
        subcategories: renameInTree(c.subcategories, id, name),
      }))
    );
    if (ctx) {
      setSections((prev) =>
        prev.map((s) => {
          if (ctx.isL1WithChildren) {
            // L1 node with children: sections store "OldL1Name > ChildName"
            if (s.subcategory.startsWith(ctx.oldSub + " > ")) {
              return { ...s, subcategory: name + " > " + s.subcategory.slice(ctx.oldSub.length + 3) };
            }
          } else if (s.subcategory === ctx.oldSub) {
            return { ...s, subcategory: ctx.newSub(name) };
          }
          return s;
        })
      );
    }
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

  // ---- executive summary ----

  const regenerateSummary = useCallback(async () => {
    const approved = sections.filter((s) => s.status === "approved");
    if (approved.length === 0) return;
    setIsSummaryLoading(true);
    try {
      const res = await fetch("/api/executive-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sections: approved.map((s) => ({ title: s.title, category: s.category, draft: s.draft })),
          reportTitle: reportMeta.title,
          reportPeriod: reportMeta.period,
        }),
      });
      const data = await res.json();
      if (data.summary) {
        setReportMeta((prev) => ({
          ...prev,
          executiveSummary: data.summary,
          summaryUpdatedAt: new Date().toISOString(),
        }));
      }
    } catch (err) {
      console.error("[regenerateSummary]", err);
    } finally {
      setIsSummaryLoading(false);
    }
  }, [sections, reportMeta.title, reportMeta.period]);

  // Auto-trigger: regenerate summary when a new section is approved and report is published
  useEffect(() => {
    const approvedIds = new Set(
      sections.filter((s) => s.status === "approved").map((s) => s.id)
    );
    const hasNewApproval = [...approvedIds].some(
      (id) => !lastApprovedIdsRef.current.has(id)
    );
    if (hasNewApproval && publishedRef.current) {
      regenerateSummary();
    }
    lastApprovedIdsRef.current = approvedIds;
  }, [sections]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- report metadata ----

  const updateReportMeta = (meta: Partial<ReportMeta>) =>
    setReportMeta((prev) => ({ ...prev, ...meta }));

  // ---- prompt management ----

  const saveUniversalPrompt = (
    systemPrompt: string,
    userPromptTemplate: string,
    note: string
  ) => {
    setPromptConfig((prev) => {
      const newVersion = prev.current.version + 1;
      const newHistory = [prev.current, ...prev.history].slice(0, 10);
      return {
        current: {
          version: newVersion,
          systemPrompt,
          userPromptTemplate,
          savedAt: today(),
          note: note.trim() || `Version ${newVersion}`,
        },
        history: newHistory,
      };
    });
  };

  const rollbackUniversalPrompt = (version: number) => {
    setPromptConfig((prev) => {
      const target = prev.history.find((h) => h.version === version);
      if (!target) return prev;
      const newHistory = [prev.current, ...prev.history.filter((h) => h.version !== version)].slice(0, 10);
      return { current: target, history: newHistory };
    });
  };

  const setSectionPromptOverride = (sectionId: string, override: SectionPromptOverride) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, promptOverride: override } : s))
    );
  };

  // ---- risk scorecards ----

  const updateScorecard = (sectionId: string, data: RiskScorecardData) => {
    setScorecards((prev) => ({ ...prev, [sectionId]: data }));
  };

  // ---- freight trend indicators ----

  const updateFreightTrend = (sectionId: string, data: FreightTrendData) => {
    setFreightTrends((prev) => ({ ...prev, [sectionId]: data }));
  };

  const clearSectionPromptOverride = (sectionId: string) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        const { promptOverride: _, ...rest } = s;
        return rest as ReportSection;
      })
    );
  };

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
        isSummaryLoading,
        regenerateSummary,
        promptConfig,
        saveUniversalPrompt,
        rollbackUniversalPrompt,
        setSectionPromptOverride,
        clearSectionPromptOverride,
        scorecards,
        updateScorecard,
        freightTrends,
        updateFreightTrend,
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
