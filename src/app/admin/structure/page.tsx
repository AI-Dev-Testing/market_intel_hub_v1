// src/app/admin/structure/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useData } from "@/contexts/data-context";
import { CategoryNode, SubcategoryNode } from "@/types";

// Inline editable text field
function InlineEdit({
  value,
  onSave,
}: {
  value: string;
  onSave: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (!editing)
    return (
      <button
        onClick={() => { setDraft(value); setEditing(true); }}
        className="text-left text-sm text-zinc-200 hover:text-zinc-100 hover:underline"
        title="Click to rename"
      >
        {value}
      </button>
    );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (draft.trim()) { onSave(draft.trim()); setEditing(false); }
      }}
      className="flex items-center gap-1"
    >
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        className="text-sm bg-zinc-800 border border-zinc-600 rounded px-2 py-0.5 text-zinc-100 outline-none focus:border-zinc-400"
      />
      <button type="submit" className="text-xs text-green-400 hover:text-green-300 px-1">✓</button>
      <button type="button" onClick={() => setEditing(false)} className="text-xs text-zinc-500 hover:text-zinc-300 px-1">✕</button>
    </form>
  );
}

// Add-item inline form
function AddForm({ placeholder, onAdd }: { placeholder: string; onAdd: (name: string) => void }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  if (!open)
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1"
      >
        <span className="text-base leading-none">+</span> {placeholder}
      </button>
    );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim()) { onAdd(value.trim()); setValue(""); setOpen(false); }
      }}
      className="flex items-center gap-1"
    >
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="text-xs bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-zinc-100 outline-none focus:border-zinc-500 w-48"
      />
      <button type="submit" className="text-xs text-green-400 hover:text-green-300 px-1">Add</button>
      <button type="button" onClick={() => setOpen(false)} className="text-xs text-zinc-500 hover:text-zinc-300 px-1">Cancel</button>
    </form>
  );
}

// Row actions: up / down / delete
function RowActions({
  onUp, onDown, onDelete, deleteLabel,
}: {
  onUp: () => void;
  onDown: () => void;
  onDelete: () => void;
  deleteLabel: string;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button onClick={onUp} className="text-zinc-500 hover:text-zinc-300 px-1 text-xs" title="Move up">↑</button>
      <button onClick={onDown} className="text-zinc-500 hover:text-zinc-300 px-1 text-xs" title="Move down">↓</button>
      {confirming ? (
        <>
          <span className="text-xs text-red-400">Delete?</span>
          <button onClick={onDelete} className="text-xs text-red-400 hover:text-red-300 px-1">Yes</button>
          <button onClick={() => setConfirming(false)} className="text-xs text-zinc-500 hover:text-zinc-300 px-1">No</button>
        </>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          className="text-zinc-500 hover:text-red-400 px-1 text-xs"
          title={deleteLabel}
        >
          ✕
        </button>
      )}
    </div>
  );
}

// L2 children list
function L2List({
  l1Id,
  children,
}: {
  l1Id: string;
  children: SubcategoryNode[];
}) {
  const { addL2Subcategory, renameSubcategory, deleteSubcategory } = useData();

  return (
    <div className="ml-6 mt-2 space-y-1">
      {children.map((child) => (
        <div key={child.id} className="group flex items-center gap-2">
          <span className="text-zinc-600 text-xs">└</span>
          <InlineEdit
            value={child.name}
            onSave={(name) => renameSubcategory(child.id, name)}
          />
          <button
            onClick={() => deleteSubcategory(child.id)}
            className="text-zinc-600 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            title="Delete L2 subcategory"
          >
            ✕
          </button>
        </div>
      ))}
      <AddForm
        placeholder="Add L2 subcategory"
        onAdd={(name) => addL2Subcategory(l1Id, name)}
      />
    </div>
  );
}

// L1 subcategory row
function SubcategoryRow({
  sub,
  categoryId,
}: {
  sub: SubcategoryNode;
  categoryId: string;
}) {
  const { renameSubcategory, deleteSubcategory, reorderSubcategory } = useData();
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border border-zinc-800 rounded-md bg-zinc-900/50">
      <div className="group flex items-center gap-2 px-3 py-2">
        {sub.children.length > 0 && (
          <button
            onClick={() => setExpanded((p) => !p)}
            className="text-zinc-500 hover:text-zinc-300 text-xs w-4"
          >
            {expanded ? "▾" : "▸"}
          </button>
        )}
        {sub.children.length === 0 && <span className="w-4" />}
        <InlineEdit
          value={sub.name}
          onSave={(name) => renameSubcategory(sub.id, name)}
        />
        <div className="ml-auto">
          <RowActions
            onUp={() => reorderSubcategory(categoryId, sub.id, "up")}
            onDown={() => reorderSubcategory(categoryId, sub.id, "down")}
            onDelete={() => deleteSubcategory(sub.id)}
            deleteLabel="Delete L1 subcategory"
          />
        </div>
      </div>
      {expanded && sub.children.length > 0 && (
        <div className="px-3 pb-3">
          <L2List l1Id={sub.id} children={sub.children} />
        </div>
      )}
      {expanded && sub.children.length === 0 && (
        <div className="px-3 pb-3">
          <L2List l1Id={sub.id} children={[]} />
        </div>
      )}
    </div>
  );
}

// L0 category card
function CategoryCard({ cat }: { cat: CategoryNode }) {
  const { addSubcategory, renameCategory, deleteCategory, reorderCategory, sections } =
    useData();
  const [expanded, setExpanded] = useState(true);
  const sectionCount = sections.filter((s) => s.category === cat.name).length;

  return (
    <div className="border border-zinc-700 rounded-lg overflow-hidden">
      <div className="group flex items-center gap-3 bg-zinc-800/60 px-4 py-3">
        <button
          onClick={() => setExpanded((p) => !p)}
          className="text-zinc-400 hover:text-zinc-200 text-sm"
        >
          {expanded ? "▾" : "▸"}
        </button>
        <InlineEdit
          value={cat.name}
          onSave={(name) => renameCategory(cat.id, name)}
        />
        {sectionCount > 0 && (
          <span className="text-xs text-zinc-600 ml-1">
            {sectionCount} section{sectionCount !== 1 ? "s" : ""}
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          <RowActions
            onUp={() => reorderCategory(cat.id, "up")}
            onDown={() => reorderCategory(cat.id, "down")}
            onDelete={() => deleteCategory(cat.id)}
            deleteLabel={
              sectionCount > 0
                ? `${sectionCount} section(s) use this category — delete anyway?`
                : "Delete category"
            }
          />
        </div>
      </div>

      {expanded && (
        <div className="px-4 py-3 space-y-2">
          {cat.subcategories.map((sub) => (
            <SubcategoryRow key={sub.id} sub={sub} categoryId={cat.id} />
          ))}
          <AddForm
            placeholder="Add L1 subcategory"
            onAdd={(name) => addSubcategory(cat.id, name)}
          />
        </div>
      )}
    </div>
  );
}

export default function StructurePage() {
  const { categoryTree, addCategory } = useData();

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <div>
          <div className="text-xs text-zinc-500 mb-1">
            <Link href="/admin" className="hover:text-zinc-300">Admin</Link>
            {" / "}Category Structure
          </div>
          <h1 className="text-xl font-semibold text-zinc-100">Category Structure</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Manage the L0 → L1 → L2 hierarchy used to organise report sections.
          </p>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {categoryTree.map((cat) => (
          <CategoryCard key={cat.id} cat={cat} />
        ))}
      </div>

      <AddForm placeholder="Add top-level category" onAdd={addCategory} />

      <p className="text-xs text-zinc-600 mt-6">
        Click any name to rename it. Hover a row to see move and delete controls.
        Deleting a category does not delete its sections — they will still appear in the dashboard under their original category name.
      </p>
    </div>
  );
}
