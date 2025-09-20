"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Category = { id: number; name: string; slug: string };

export default function NewProductPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Basic form state
  const [form, setForm] = useState({
    name: "",
    description: "",
    currency: "INR",
    price: "",
    compare_at_price: "",
    cost_price: "",
    tag: "",
    inventory: "",
    category_id: "",
  });

  // Fetch categories for the select
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/categories/", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    })();
  }, []);

  const canSubmit = useMemo(() => {
    return (
      form.name.trim() &&
      form.price &&
      form.inventory &&
      form.category_id &&
      imageFile !== null
    );
  }, [form, imageFile]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("description", form.description || "");
      fd.append("currency", form.currency || "INR");
      fd.append("price", form.price);
      if (form.compare_at_price)
        fd.append("compare_at_price", form.compare_at_price);
      if (form.cost_price) fd.append("cost_price", form.cost_price);
      if (form.tag) fd.append("tag", form.tag);
      fd.append("inventory", form.inventory);
      fd.append("category_id", form.category_id);
      if (imageFile) fd.append("image", imageFile);

      // NOTE: Requires the minimal backend change shown above
      const res = await fetch("/api/products/", {
        method: "POST",
        body: fd,
        // If your admin area uses a cookie session/JWT, credentials may be needed:
        // credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(`Create failed: ${err?.detail ?? res.statusText}`);
      } else {
        alert("Product created!");
        router.push("/products"); // or admin products list
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-neutral-50 dark:bg-neutral-950 px-4 py-8">
      <div className="mx-auto w-full max-w-3xl rounded-2xl bg-white/90 dark:bg-neutral-900/70 p-6 ring-1 ring-neutral-200 dark:ring-neutral-800">
        <h1 className="text-2xl font-semibold">Add Product</h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
          Create a new product in your catalog.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              className="mt-1 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent px-3 py-2 outline-none"
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Description (Markdown OK)
            </label>
            <textarea
              className="mt-1 min-h-28 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent px-3 py-2 outline-none"
              value={form.description}
              onChange={(e) =>
                setForm((s) => ({ ...s, description: e.target.value }))
              }
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium">Currency</label>
              <input
                className="mt-1 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent px-3 py-2 outline-none"
                value={form.currency}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    currency: e.target.value.toUpperCase(),
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Price</label>
              <input
                type="number"
                step="0.01"
                className="mt-1 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent px-3 py-2 outline-none"
                value={form.price}
                onChange={(e) =>
                  setForm((s) => ({ ...s, price: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                Compare at (MRP)
              </label>
              <input
                type="number"
                step="0.01"
                className="mt-1 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent px-3 py-2 outline-none"
                value={form.compare_at_price}
                onChange={(e) =>
                  setForm((s) => ({ ...s, compare_at_price: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium">Cost Price</label>
              <input
                type="number"
                step="0.01"
                className="mt-1 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent px-3 py-2 outline-none"
                value={form.cost_price}
                onChange={(e) =>
                  setForm((s) => ({ ...s, cost_price: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Inventory</label>
              <input
                type="number"
                min={0}
                className="mt-1 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent px-3 py-2 outline-none"
                value={form.inventory}
                onChange={(e) =>
                  setForm((s) => ({ ...s, inventory: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                Tag (optional)
              </label>
              <input
                className="mt-1 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent px-3 py-2 outline-none"
                value={form.tag}
                onChange={(e) =>
                  setForm((s) => ({ ...s, tag: e.target.value }))
                }
                placeholder="new, bestseller…"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Category</label>
            <select
              className="mt-1 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent px-3 py-2 outline-none"
              value={form.category_id}
              onChange={(e) =>
                setForm((s) => ({ ...s, category_id: e.target.value }))
              }
              required
            >
              <option value="">Select a category…</option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Main Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              className="mt-1 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent px-3 py-2 file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-200 dark:file:bg-neutral-800 file:px-3 file:py-2"
              required
            />
            {imageFile && (
              <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400">
                {imageFile.name} ({Math.round(imageFile.size / 1024)} KB)
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-xl px-4 py-2 ring-1 ring-neutral-300 dark:ring-neutral-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit || loading}
              className="rounded-xl px-5 py-3 text-sm font-medium bg-gradient-to-r from-yellow-500 to-amber-500 text-neutral-900 disabled:opacity-50"
            >
              {loading ? "Creating…" : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
