// src/app/admin/sections/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useData, flattenCategoryTree } from "@/contexts/data-context";
import { ReportSection, SectionStatus, STATUS_LABELS, STATUS_COLORS } from "@/types";

function AddSectionModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const { categoryTree, smeList, addSection } = useData();
  const options = flattenCategoryTree(categoryTree);

  const [title, setTitle] = useState("");
  const [locationIdx, setLocationIdx] = useState(0);
  const [sme, setSme] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || options.length === 0) return;
    const loc = options[locationIdx];
    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
    addSection({
      id: `${id}-${Math.random().toString(36).slice(2, 6)}`,
      title: title.trim(),
      category: loc.category,
      subcategory: loc.subcategory,
      assignedSme: sme,
      status: "pending",
      draft: "",
      notes: "",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-base font-semibold text-zinc-100 mb-4">New Section</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Title</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Resistors Market Update"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Category / Subcategory</label>
            <select
              value={locationIdx}
              onChange={(e) => setLocationIdx(Number(e.target.value))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500"
            >
              {options.map((opt, i) => (
                <option key={i} value={i}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Assign SME (optional)</label>
            <select
              value={sme}
              onChange={(e) => setSme(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500"
            >
              <option value="">Unassigned</option>
              {smeList.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 border border-zinc-700 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-4 py-2 text-sm bg-zinc-100 text-zinc-900 font-medium rounded-md hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditCategoryModal({
  section,
  onClose,
}: {
  section: ReportSection;
  onClose: () => void;
}) {
  const { categoryTree, smeList, updateSection } = useData();
  const options = flattenCategoryTree(categoryTree);
  const currentIdx = options.findIndex(
    (o) => o.category === section.category && o.subcategory === section.subcategory
  );
  const [locationIdx, setLocationIdx] = useState(currentIdx >= 0 ? currentIdx : 0);
  const [sme, setSme] = useState(section.assignedSme);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const loc = options[locationIdx];
    updateSection(section.id, {
      category: loc.category,
      subcategory: loc.subcategory,
      assignedSme: sme,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-base font-semibold text-zinc-100 mb-1">Edit Section</h2>
        <p className="text-xs text-zinc-500 mb-4">{section.title}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Category / Subcategory</label>
            <select
              value={locationIdx}
              onChange={(e) => setLocationIdx(Number(e.target.value))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500"
            >
              {options.map((opt, i) => (
                <option key={i} value={i}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Assigned SME</label>
            <select
              value={sme}
              onChange={(e) => setSme(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500"
            >
              <option value="">Unassigned</option>
              {smeList.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 border border-zinc-700 rounded-md">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm bg-zinc-100 text-zinc-900 font-medium rounded-md hover:bg-white">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminSectionsPage() {
  const { sections, deleteSection } = useData();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<ReportSection | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const sorted = [...sections].sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title));

  return (
    <div className="max-w-3xl">
      {showAdd && <AddSectionModal onClose={() => setShowAdd(false)} />}
      {editing && <EditCategoryModal section={editing} onClose={() => setEditing(null)} />}

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="text-xs text-zinc-500 mb-1">
            <Link href="/admin" className="hover:text-zinc-300">Admin</Link>
            {" / "}Section Management
          </div>
          <h1 className="text-xl font-semibold text-zinc-100">Section Management</h1>
          <p className="text-sm text-zinc-400 mt-1">
            {sections.length} sections total
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 text-sm bg-zinc-100 text-zinc-900 font-medium rounded-md hover:bg-white"
        >
          + New section
        </button>
      </div>

      <div className="border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/60">
              <th className="text-left text-xs text-zinc-500 font-medium px-4 py-2.5">Section</th>
              <th className="text-left text-xs text-zinc-500 font-medium px-4 py-2.5 hidden sm:table-cell">Category</th>
              <th className="text-left text-xs text-zinc-500 font-medium px-4 py-2.5 hidden md:table-cell">SME</th>
              <th className="text-left text-xs text-zinc-500 font-medium px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((section) => (
              <tr key={section.id} className="border-b border-zinc-800/60 last:border-0 hover:bg-zinc-900/40">
                <td className="px-4 py-3">
                  <Link
                    href={`/sections/${section.id}`}
                    className="text-zinc-200 hover:text-zinc-100 hover:underline"
                  >
                    {section.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-500 hidden sm:table-cell">
                  <span className="text-xs">{section.category}</span>
                  {section.subcategory && (
                    <span className="text-xs text-zinc-600 ml-1">› {section.subcategory}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-zinc-500 text-xs hidden md:table-cell">
                  {section.assignedSme || <span className="text-zinc-700">Unassigned</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[section.status as SectionStatus]}`}>
                    {STATUS_LABELS[section.status as SectionStatus]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => setEditing(section)}
                      className="text-xs text-zinc-500 hover:text-zinc-300"
                    >
                      Edit
                    </button>
                    {deletingId === section.id ? (
                      <>
                        <span className="text-xs text-red-400">Delete?</span>
                        <button onClick={() => { deleteSection(section.id); setDeletingId(null); }} className="text-xs text-red-400 hover:text-red-300">Yes</button>
                        <button onClick={() => setDeletingId(null)} className="text-xs text-zinc-500 hover:text-zinc-300">No</button>
                      </>
                    ) : (
                      <button
                        onClick={() => setDeletingId(section.id)}
                        className="text-xs text-zinc-600 hover:text-red-400"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
