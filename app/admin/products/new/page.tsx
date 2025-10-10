"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api"; // Axios instance
import { useAuth } from "@/context/AuthContext";

// ---------- Helpers ----------

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function money(n: number, currency = "USD") {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(n ?? 0);
  } catch {
    return `$${Number(n ?? 0).toFixed(2)}`;
  }
}

// ---------- Spinner & Overlay ----------
function Spinner({ size = 18 }: { size?: number }) {
  return (
    <svg
      className="animate-spin text-neutral-300"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-90"
        d="M4 12a8 8 0 0 1 8-8"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LoadingOverlay({
  show,
  label = "Working...",
}: {
  show: boolean;
  label?: string;
}) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-black/40 backdrop-blur">
      <div className="flex items-center gap-3 rounded-2xl bg-neutral-900 px-4 py-3 text-neutral-100 ring-1 ring-neutral-800">
        <Spinner />
        <span className="text-sm opacity-90">{label}</span>
      </div>
    </div>
  );
}

// ---------- Types ----------
export type Variant = {
  id?: string; // client-only key
  name: string; // e.g., "Gold / 6"
  sku?: string;
  price_delta?: number; // added to base price
  inventory?: number;
  is_active?: boolean;
};

// Category fetched from backend (from /categories/)
export type Category = {
  id: number;
  name: string;
  slug?: string;
};

export type Occasion = {
  id: number;
  name: string;
  slug?: string;
  icon?: string;
};

function OccasionsPicker({
  selectedIds,
  setSelectedIds,
}: {
  selectedIds: number[];
  setSelectedIds: (ids: number[]) => void;
}) {
  const [options, setOptions] = React.useState<Occasion[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [q, setQ] = React.useState("");

  React.useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get("/occasions/"); // adjust if your URL differs
        if (!ignore) setOptions(res.data?.results ?? res.data ?? []);
      } catch {
        if (!ignore) setOptions([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  function toggle(id: number) {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  }

  const filtered = options.filter(
    (o) => !q || o.name.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Occasions</div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search occasions…"
          className="rounded-xl border border-neutral-200 bg-transparent px-3 py-1.5 text-sm outline-none dark:border-neutral-800"
        />
      </div>

      <div className="rounded-2xl border border-neutral-200 p-2 dark:border-neutral-800">
        {loading ? (
          <div className="p-3 text-sm opacity-70">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-3 text-sm opacity-70">No matches</div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {filtered.map((o) => {
              const checked = selectedIds.includes(o.id);
              return (
                <label
                  key={o.id}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm cursor-pointer ${
                    checked
                      ? "border-neutral-900 bg-neutral-900 text-white dark:bg-amber-500 dark:text-neutral-900"
                      : "border-neutral-200 dark:border-neutral-800"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="accent-current"
                    checked={checked}
                    onChange={() => toggle(o.id)}
                  />
                  <span className="truncate">{o.name}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {selectedIds.length > 0 && (
        <div className="text-xs opacity-70">Selected: {selectedIds.length}</div>
      )}
    </div>
  );
}

// ---------- Image Uploader ----------
function ImageUploader({
  files,
  setFiles,
}: {
  files: File[];
  setFiles: (f: File[]) => void;
}) {
  const dropRef = useRef<HTMLDivElement>(null);

  function onFilesAdded(list: FileList | null) {
    if (!list) return;
    const next = [...files, ...Array.from(list)].slice(0, 12); // cap at 12
    setFiles(next);
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    onFilesAdded(e.dataTransfer?.files || null);
  }

  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
  }

  function removeAt(idx: number) {
    const next = [...files];
    next.splice(idx, 1);
    setFiles(next);
  }

  return (
    <div>
      <div
        ref={dropRef}
        onDrop={onDrop}
        onDragOver={onDragOver}
        className="grid place-items-center rounded-2xl border border-dashed border-neutral-300 p-6 text-center dark:border-neutral-700"
      >
        <div className="space-y-2">
          <div className="text-sm font-medium">Upload product images</div>
          <div className="text-xs opacity-70">
            Drag & drop or click to select (JPG/PNG, up to 12 files)
          </div>
          <label className="inline-block cursor-pointer rounded-xl bg-neutral-900 px-3 py-1.5 text-xs text-white dark:bg-amber-500 dark:text-neutral-900">
            Browse...
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => onFilesAdded(e.target.files)}
            />
          </label>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {files.map((file, idx) => {
            const url = URL.createObjectURL(file);
            return (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-xl ring-1 ring-neutral-200 dark:ring-neutral-800"
              >
                {/* Use img for local previews */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={file.name}
                  className="h-32 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeAt(idx)}
                  className="absolute right-1 top-1 hidden rounded-lg bg-black/60 px-2 py-0.5 text-xs text-white group-hover:block"
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------- Tags Input ----------
function TagsInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [input, setInput] = useState("");

  function add(tag: string) {
    const t = tag.trim();
    if (!t) return;
    if (value.includes(t)) return;
    onChange([...value, t]);
    setInput("");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(input);
    } else if (e.key === "Backspace" && !input && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className="rounded-2xl border border-neutral-200 p-2 dark:border-neutral-800">
      <div className="flex flex-wrap items-center gap-2">
        {value.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-1 rounded-full bg-neutral-200/70 px-2 py-0.5 text-xs dark:bg-neutral-800"
          >
            {t}
            <button
              type="button"
              onClick={() => onChange(value.filter((x) => x !== t))}
              className="opacity-60 hover:opacity-100"
            >
              ×
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Add tag and press Enter"
          className="min-w-[160px] flex-1 bg-transparent px-2 py-1 text-sm outline-none placeholder:opacity-60"
        />
      </div>
    </div>
  );
}

// ---------- Variations ----------
function VariationsEditor({
  variants,
  setVariants,
}: {
  variants: Variant[];
  setVariants: (v: Variant[]) => void;
}) {
  function addRow() {
    setVariants([
      ...(variants || []),
      {
        id: Math.random().toString(36).slice(2),
        name: "",
        sku: "",
        price_delta: 0,
        inventory: 0,
        is_active: true,
      },
    ]);
  }
  function update(idx: number, patch: Partial<Variant>) {
    const next = [...variants];
    next[idx] = { ...next[idx], ...patch };
    setVariants(next);
  }
  function remove(idx: number) {
    const next = [...variants];
    next.splice(idx, 1);
    setVariants(next);
  }
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Variations</div>
        <button
          type="button"
          onClick={addRow}
          className="rounded-xl bg-neutral-900 px-3 py-1.5 text-xs text-white dark:bg-amber-500 dark:text-neutral-900"
        >
          + Add
        </button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-800">
        <table className="w-full text-sm">
          <thead className="text-left text-neutral-500">
            <tr className="border-b border-neutral-200 dark:border-neutral-800">
              <th className="px-2 py-2">Name</th>
              <th className="px-2 py-2">SKU</th>
              <th className="px-2 py-2">Price Δ</th>
              <th className="px-2 py-2">Inventory</th>
              <th className="px-2 py-2">Active</th>
              <th className="px-2 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {(variants || []).map((v, idx) => (
              <tr
                key={v.id || idx}
                className="border-b border-neutral-100 last:border-none dark:border-neutral-800"
              >
                <td className="px-2 py-2">
                  <input
                    value={v.name}
                    onChange={(e) => update(idx, { name: e.target.value })}
                    placeholder="e.g., Gold / 6"
                    className="w-full rounded-xl border border-neutral-200 bg-transparent px-3 py-2 outline-none dark:border-neutral-800"
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    value={v.sku || ""}
                    onChange={(e) => update(idx, { sku: e.target.value })}
                    className="w-full rounded-xl border border-neutral-200 bg-transparent px-3 py-2 outline-none dark:border-neutral-800"
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    type="number"
                    value={v.price_delta ?? 0}
                    onChange={(e) =>
                      update(idx, { price_delta: Number(e.target.value || 0) })
                    }
                    className="w-full rounded-xl border border-neutral-200 bg-transparent px-3 py-2 outline-none dark:border-neutral-800"
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    type="number"
                    value={v.inventory ?? 0}
                    onChange={(e) =>
                      update(idx, { inventory: Number(e.target.value || 0) })
                    }
                    className="w-full rounded-xl border border-neutral-200 bg-transparent px-3 py-2 outline-none dark:border-neutral-800"
                  />
                </td>
                <td className="px-2 py-2">
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={!!v.is_active}
                      onChange={(e) =>
                        update(idx, { is_active: e.target.checked })
                      }
                    />
                    <span>Active</span>
                  </label>
                </td>
                <td className="px-2 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    className="rounded-lg px-2 py-1 text-xs ring-1 ring-neutral-200 dark:ring-neutral-800"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {(!variants || variants.length === 0) && (
              <tr>
                <td
                  colSpan={6}
                  className="px-2 py-6 text-center text-sm opacity-70"
                >
                  No variations added.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------- Main Page ----------
export default function AdminAddProductPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Superuser guard
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (user && (user as any).is_superuser === false) router.replace("/");
  }, [user, router]);

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [catLoading, setCatLoading] = useState(true);
  const [occasionIds, setOccasionIds] = useState<number[]>([]);
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setCatLoading(true);
        const res = await api.get("/categories/"); // adjust if your URL is different (e.g., /api/categories/)
        if (!ignore) setCategories(res.data as Category[]);
      } catch (e) {
        console.error(e);
        if (!ignore) setCategories([]);
      } finally {
        if (!ignore) setCatLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);
  const [inventory, setInventory] = useState<number>(0);
  const [lowStock, setLowStock] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [tags, setTags] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  const [useVariants, setUseVariants] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([]);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-slug from name (editable)
  useEffect(() => {
    if (!name) return;
    setSlug((prev) => (prev ? prev : slugify(name)));
  }, [name]);

  // Basic validation
  const valid = useMemo(() => {
    if (!name || !slug || !category) return false;
    if (price < 0) return false;
    if (inventory < 0 || lowStock < 0) return false;
    return true;
  }, [name, slug, price, inventory, lowStock]);

  async function submit(publish: boolean) {
    if (!valid) return;
    try {
      setBusy(true);
      setError(null);

      const fd = new FormData();
      fd.append("name", name);
      fd.append("slug", slug);
      if (sku) fd.append("sku", sku);
      fd.append("price", String(price));
      if (description) fd.append("description", description);
      if (category) {
        // Send both keys for compatibility with different DRF serializers
        fd.append("category", String(category.id));
        fd.append("category_id", String(category.id));
      }
      fd.append("inventory", String(inventory));
      fd.append("low_stock_threshold", String(lowStock));
      fd.append("is_active", String(publish ? true : isActive));
      fd.append("image", files[0]);
      // tags as JSON for DRF (parse with json.loads)
      fd.append("tags_json", JSON.stringify(tags || []));
      if (useVariants) {
        fd.append("variants_json", JSON.stringify(variants || []));
      }
      for (const id of occasionIds) {
        fd.append("occasion_ids", String(id));
      }
      for (const f of files) fd.append("images", f, f.name);

      await api.post("/admin/products/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // After save
      if (publish) router.replace("/admin/products");
      else {
        // reset to add another
        setName("");
        setSlug("");
        setSku("");
        setPrice(0);
        setDescription("");
        setCategory(null);
        setInventory(0);
        setLowStock(0);
        setIsActive(false);
        setTags([]);
        setFiles([]);
        setUseVariants(false);
        setVariants([]);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      console.error(e);
      setError(
        e?.response?.data?.detail ||
          "Failed to create product. Check console/network."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-4">
      <nav className=" max-w-7xl px-4 sm:px-6 lg:px-1 py-4  text-xs opacity-80">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/admin" className="hover:opacity-80">
              Dashboard
            </Link>
          </li>
          <li>›</li>
          <li>
            <Link href="/admin/products" className="hover:opacity-80">
              Products
            </Link>
          </li>
          <li>›</li>
          <li className="opacity-90">{"Add New"} </li>
        </ol>
      </nav>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Add Product</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/products"
            className="rounded-xl px-3 py-2 text-sm ring-1 ring-neutral-200 dark:ring-neutral-800"
          >
            Back to Products
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-3 rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800/60 dark:bg-rose-900/20 dark:text-rose-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-4 lg:col-span-2">
          {/* Basic */}
          <div className="rounded-2xl border border-neutral-200 bg-white/90 p-4 dark:border-neutral-800 dark:bg-neutral-900/70">
            <div className="mb-3 text-sm font-medium">Basics</div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="text-sm">
                <div className="mb-1 opacity-70">Name *</div>
                <input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    // if slug was auto, keep syncing; otherwise respect manual edits
                    setSlug((s) =>
                      s && s !== slugify(name) ? s : slugify(e.target.value)
                    );
                  }}
                  placeholder="Aurora Tennis Bracelet"
                  className="w-full rounded-xl border border-neutral-200 bg-transparent px-3 py-2 outline-none dark:border-neutral-800"
                />
              </label>
              <label className="text-sm">
                <div className="mb-1 opacity-70">Slug *</div>
                <input
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  placeholder="aurora-tennis-bracelet"
                  className="w-full rounded-xl border border-neutral-200 bg-transparent px-3 py-2 lowercase outline-none dark:border-neutral-800"
                />
              </label>
              <label className="text-sm">
                <div className="mb-1 opacity-70">SKU</div>
                <input
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="ELV-AURORA"
                  className="w-full rounded-xl border border-neutral-200 bg-transparent px-3 py-2 outline-none dark:border-neutral-800"
                />
              </label>
              <label className="text-sm">
                <div className="mb-1 opacity-70">Price *</div>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value || 0))}
                  placeholder="129"
                  className="w-full rounded-xl border border-neutral-200 bg-transparent px-3 py-2 outline-none dark:border-neutral-800"
                />
                <div className="mt-1 text-xs opacity-60">
                  Preview: {money(price || 0)}
                </div>
              </label>
            </div>
            <label className="mt-3 block text-sm">
              <div className="mb-1 opacity-70">Description</div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Delicate tennis bracelet with hand-set stones..."
                className="w-full rounded-xl border border-neutral-200 bg-transparent px-3 py-2 outline-none dark:border-neutral-800"
              />
            </label>
          </div>

          {/* Media */}
          <div className="rounded-2xl border border-neutral-200 bg-white/90 p-4 dark:border-neutral-800 dark:bg-neutral-900/70">
            <div className="mb-3 text-sm font-medium">Media</div>
            <ImageUploader files={files} setFiles={setFiles} />
          </div>

          {/* Variations */}
          <div className="rounded-2xl border border-neutral-200 bg-white/90 p-4 dark:border-neutral-800 dark:bg-neutral-900/70">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm font-medium">Variations (optional)</div>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={useVariants}
                  onChange={(e) => setUseVariants(e.target.checked)}
                />
                <span>Enable variations</span>
              </label>
            </div>
            {useVariants ? (
              <VariationsEditor variants={variants} setVariants={setVariants} />
            ) : (
              <div className="text-sm opacity-70">
                Add sizes/finishes later if needed.
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Organization */}
          <div className="rounded-2xl border border-neutral-200 bg-white/90 p-4 dark:border-neutral-800 dark:bg-neutral-900/70">
            <div className="mb-3 text-sm font-medium">Organization</div>
            <label className="text-sm block">
              <div className="mb-1 opacity-70">Category *</div>
              <select
                value={category?.id ?? ""}
                onChange={(e) => {
                  const id = Number(e.target.value || 0);
                  const found = categories.find((c) => c.id === id) || null;
                  setCategory(found);
                }}
                disabled={catLoading}
                className="w-full rounded-xl border border-neutral-200 bg-transparent px-3 py-2 text-sm outline-none disabled:opacity-60 dark:border-neutral-800"
              >
                <option value="" disabled>
                  {catLoading ? "Loading categories..." : "Select a category"}
                </option>
                {categories &&
                  categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
              <div className="mt-1 text-xs opacity-60">
                Loaded from backend (/categories/)
              </div>
            </label>
            <label className="mt-3 block text-sm">
              <div className="mb-1 opacity-70">Tags</div>
              <TagsInput value={tags} onChange={setTags} />
            </label>
            <label className="mt-3 block">
              <OccasionsPicker
                selectedIds={occasionIds}
                setSelectedIds={setOccasionIds}
              />
            </label>
          </div>

          {/* Inventory */}
          <div className="rounded-2xl border border-neutral-200 bg-white/90 p-4 dark:border-neutral-800 dark:bg-neutral-900/70">
            <div className="mb-3 text-sm font-medium">Inventory</div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="text-sm">
                <div className="mb-1 opacity-70">On hand</div>
                <input
                  type="number"
                  value={inventory}
                  onChange={(e) => setInventory(Number(e.target.value || 0))}
                  className="w-full rounded-xl border border-neutral-200 bg-transparent px-3 py-2 outline-none dark:border-neutral-800"
                />
              </label>
              <label className="text-sm">
                <div className="mb-1 opacity-70">Low stock threshold</div>
                <input
                  type="number"
                  value={lowStock}
                  onChange={(e) => setLowStock(Number(e.target.value || 0))}
                  className="w-full rounded-xl border border-neutral-200 bg-transparent px-3 py-2 outline-none dark:border-neutral-800"
                />
              </label>
            </div>
            <label className="mt-3 inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <span>Active (visible in store)</span>
            </label>
          </div>

          {/* Actions */}
          <div className="rounded-2xl border border-neutral-200 bg-white/90 p-4 dark:border-neutral-800 dark:bg-neutral-900/70">
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={!valid || busy}
                onClick={() => submit(false)}
                className="rounded-xl px-4 py-2 text-sm ring-1 ring-neutral-200 disabled:opacity-50 dark:ring-neutral-800"
              >
                Save as Draft
              </button>
              <button
                type="button"
                disabled={!valid || busy}
                onClick={() => submit(true)}
                className="rounded-xl bg-neutral-900 px-4 py-2 text-sm text-white hover:brightness-110 disabled:opacity-50 dark:bg-amber-500 dark:text-neutral-900"
              >
                Save & Publish
              </button>
            </div>
            {!valid && (
              <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                Name, slug, and non-negative price/inventory are required.
              </div>
            )}
          </div>
        </div>
      </div>

      <LoadingOverlay show={busy} />
    </div>
  );
}
