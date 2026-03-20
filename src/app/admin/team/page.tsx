// src/app/admin/team/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useData } from "@/contexts/data-context";
import { SectionStatus, STATUS_LABELS, STATUS_COLORS } from "@/types";

export default function AdminTeamPage() {
  const { smeList, updateSmeList, sections, updateSection } = useData();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [removingIdx, setRemovingIdx] = useState<number | null>(null);
  const [reassignTarget, setReassignTarget] = useState<string>("");

  const sectionsBySme = (name: string) =>
    sections.filter((s) => s.assignedSme === name);

  const handleAdd = () => {
    if (!newName.trim() || smeList.includes(newName.trim())) return;
    updateSmeList([...smeList, newName.trim()]);
    setNewName("");
    setAdding(false);
  };

  const handleRename = (idx: number) => {
    if (!editValue.trim()) return;
    const oldName = smeList[idx];
    const newList = smeList.map((s, i) => (i === idx ? editValue.trim() : s));
    updateSmeList(newList);
    // Update all sections assigned to this SME
    sections
      .filter((s) => s.assignedSme === oldName)
      .forEach((s) => updateSection(s.id, { assignedSme: editValue.trim() }));
    setEditingIdx(null);
    setEditValue("");
  };

  const handleRemove = (idx: number) => {
    const name = smeList[idx];
    const assignedSections = sectionsBySme(name);
    if (assignedSections.length > 0 && reassignTarget !== "__unassign__") {
      // Reassign sections
      assignedSections.forEach((s) =>
        updateSection(s.id, {
          assignedSme: reassignTarget === "" ? "" : reassignTarget,
        })
      );
    } else {
      assignedSections.forEach((s) => updateSection(s.id, { assignedSme: "" }));
    }
    updateSmeList(smeList.filter((_, i) => i !== idx));
    setRemovingIdx(null);
    setReassignTarget("");
  };

  const statusCounts = (name: string) => {
    const sm = sectionsBySme(name);
    const counts: Partial<Record<SectionStatus, number>> = {};
    sm.forEach((s) => {
      counts[s.status] = (counts[s.status] ?? 0) + 1;
    });
    return counts;
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <div className="text-xs text-zinc-500 mb-1">
          <Link href="/admin" className="hover:text-zinc-300">Admin</Link>
          {" / "}SME Management
        </div>
        <h1 className="text-xl font-semibold text-zinc-100">SME Management</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Manage the pool of assignable subject matter experts.
        </p>
      </div>

      <div className="space-y-2 mb-4">
        {smeList.map((name, idx) => {
          const counts = statusCounts(name);
          const total = sectionsBySme(name).length;
          const isRemoving = removingIdx === idx;
          const isEditing = editingIdx === idx;

          return (
            <div
              key={name}
              className="border border-zinc-800 rounded-lg bg-zinc-900/40 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <form
                      onSubmit={(e) => { e.preventDefault(); handleRename(idx); }}
                      className="flex items-center gap-2"
                    >
                      <input
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="text-sm bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-zinc-100 outline-none focus:border-zinc-400 w-48"
                      />
                      <button type="submit" className="text-xs text-green-400 hover:text-green-300">Save</button>
                      <button type="button" onClick={() => setEditingIdx(null)} className="text-xs text-zinc-500 hover:text-zinc-300">Cancel</button>
                    </form>
                  ) : (
                    <p className="text-sm font-medium text-zinc-200">{name}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {total === 0 ? (
                      <span className="text-xs text-zinc-600">No sections assigned</span>
                    ) : (
                      (Object.entries(counts) as [SectionStatus, number][]).map(
                        ([status, count]) => (
                          <span
                            key={status}
                            className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[status]}`}
                          >
                            {count} {STATUS_LABELS[status]}
                          </span>
                        )
                      )
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!isEditing && !isRemoving && (
                    <>
                      <button
                        onClick={() => { setEditingIdx(idx); setEditValue(name); }}
                        className="text-xs text-zinc-500 hover:text-zinc-300"
                      >
                        Rename
                      </button>
                      <button
                        onClick={() => { setRemovingIdx(idx); setReassignTarget(""); }}
                        className="text-xs text-zinc-600 hover:text-red-400"
                      >
                        Remove
                      </button>
                    </>
                  )}
                </div>
              </div>

              {isRemoving && (
                <div className="mt-3 p-3 bg-zinc-800/60 rounded-md border border-zinc-700">
                  {total > 0 ? (
                    <>
                      <p className="text-xs text-zinc-300 mb-2">
                        {total} section{total !== 1 ? "s" : ""} assigned to {name}. Reassign to:
                      </p>
                      <select
                        value={reassignTarget}
                        onChange={(e) => setReassignTarget(e.target.value)}
                        className="text-xs bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-zinc-200 outline-none focus:border-zinc-500 mb-2"
                      >
                        <option value="__unassign__">Leave unassigned</option>
                        {smeList
                          .filter((_, i) => i !== idx)
                          .map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                      </select>
                    </>
                  ) : (
                    <p className="text-xs text-zinc-400 mb-2">Remove {name}?</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRemove(idx)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Confirm remove
                    </button>
                    <button
                      onClick={() => setRemovingIdx(null)}
                      className="text-xs text-zinc-500 hover:text-zinc-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {adding ? (
        <form
          onSubmit={(e) => { e.preventDefault(); handleAdd(); }}
          className="flex items-center gap-2"
        >
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Full name"
            className="text-sm bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-zinc-100 outline-none focus:border-zinc-500 w-52"
          />
          <button type="submit" className="px-3 py-2 text-sm bg-zinc-100 text-zinc-900 font-medium rounded-md hover:bg-white">Add</button>
          <button type="button" onClick={() => setAdding(false)} className="text-sm text-zinc-500 hover:text-zinc-300">Cancel</button>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="text-sm text-zinc-500 hover:text-zinc-300 flex items-center gap-1"
        >
          <span className="text-base">+</span> Add SME
        </button>
      )}
    </div>
  );
}
