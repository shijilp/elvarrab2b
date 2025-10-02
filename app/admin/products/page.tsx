"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api"; // your Axios instance
import { useAuth } from "@/context/AuthContext"; // should expose user + is_superuser
import { money } from "@/lib/utils";

// ---------- Types (align these with your Django serializers) ----------
export type Product = {
  id: number;
  name: string;
  slug?: string;
  sku?: string;
  tag?: string; // optional custom field
  price: number;
  image_url?: string;
  inventory?: number;
  stock: number;

  low_stock_threshold?: number;
  // in_stock?: boolean; // optional helper from backend
  is_active?: boolean;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
};

export type Paged<T> = {
  results: T[];
  count: number; // total
  page: number; // current page (1-based)
  page_size: number;
};

// ---------- Utilities ----------

function clsx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

function useDebounce<T>(value: T, delay = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
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
  label = "Loading...",
}: {
  show: boolean;
  label?: string;
}) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/40 backdrop-blur">
      <div className="flex items-center gap-3 rounded-2xl bg-neutral-900 px-4 py-3 text-neutral-100 ring-1 ring-neutral-800">
        <Spinner />
        <span className="text-sm opacity-90">{label}</span>
      </div>
    </div>
  );
}

// ---------- Data hook ----------
function useProducts(params: {
  q: string;
  status: "all" | "active" | "disabled";
  stock: "all" | "low" | "out";
  page: number;
  pageSize: number;
  sort: string; // e.g., "-created_at", "price", etc.
}) {
  const { q, status, stock, page, pageSize, sort } = params;
  const [data, setData] = useState<Paged<Product>>({
    results: [],
    count: 0,
    page: 1,
    page_size: pageSize,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dq = useDebounce(q, 350);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/admin/products", {
          params: {
            q: dq || undefined,
            status: status !== "all" ? status : undefined,
            stock: stock !== "all" ? stock : undefined,
            page,
            page_size: pageSize,
            sort: sort || undefined,
          },
        });
        if (!ignore) {
          // Try to accept either paged or array responses
          if (Array.isArray(res.data)) {
            setData({
              results: res.data as Product[],
              count: res.data.length,
              page,
              page_size: pageSize,
            });
          } else {
            setData(res.data as Paged<Product>);
          }
        }
      } catch (e) {
        console.error(e);
        if (!ignore)
          setData({
            // Fallback demo data so UI still renders
            results: [
              {
                id: 11,
                name: "Luna Drop Earrings",
                sku: "ELV-LUNA",
                price: 69,
                image_url: "/placeholder/earrings.jpg",
                inventory: 24,
                low_stock_threshold: 6,
                is_active: true,
                stock: 24,
              },
              {
                id: 12,
                name: "Aurora Tennis Bracelet",
                sku: "ELV-AURORA",
                price: 129,
                image_url: "/placeholder/bracelet.jpg",
                inventory: 3,
                low_stock_threshold: 6,
                is_active: true,
                stock: 3,
              },
              {
                id: 13,
                name: "Noor Pendant",
                sku: "ELV-NOOR",
                price: 99,
                image_url: "/placeholder/pendant.jpg",
                inventory: 0,
                low_stock_threshold: 4,
                is_active: false,
                stock: 0,
              },
            ],
            count: 3,
            page: 1,
            page_size: pageSize,
          });
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [dq, status, stock, page, pageSize, sort]);

  return { data, loading, error } as const;
}

// ---------- Small components ----------
function StatusPill({ active }: { active?: boolean }) {
  const on = active ?? false;
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ring-1",
        on
          ? "text-emerald-500 ring-emerald-500/30 bg-emerald-500/10"
          : "text-neutral-400 ring-neutral-400/30 bg-neutral-400/10"
      )}
    >
      {on ? "Active" : "Disabled"}
    </span>
  );
}

function StockPill({ inv = 0, low = 0 }: { inv?: number; low?: number }) {
  const out = (inv ?? 0) <= 0;
  const warn = !out && low && inv <= low;
  const base =
    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ring-1";
  if (out)
    return (
      <span
        className={clsx(base, "text-rose-400 bg-rose-400/10 ring-rose-400/30")}
      >
        Out
      </span>
    );
  if (warn)
    return (
      <span
        className={clsx(
          base,
          "text-amber-500 bg-amber-500/10 ring-amber-500/30"
        )}
      >
        Low
      </span>
    );
  return (
    <span
      className={clsx(
        base,
        "text-neutral-500 bg-neutral-500/10 ring-neutral-500/20"
      )}
    >
      OK
    </span>
  );
}

// ---------- Table ----------
function ProductsTable({
  rows = [],
  onSelect,
  selected,
  onQuickEdit,
  onToggleActive,
}: {
  rows?: Product[];
  onSelect: (id: number, checked: boolean) => void;
  selected: Set<number>;
  onQuickEdit: (p: Product) => void;
  onToggleActive: (p: Product) => Promise<void>;
}) {
  const allChecked = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const someChecked = selected.size > 0 && !allChecked;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white/90 p-3 dark:border-neutral-800 dark:bg-neutral-900/70">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-neutral-500">
            <tr className="border-b border-neutral-200 dark:border-neutral-800">
              <th className="px-2 py-2">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    ref={(el) => {
                      if (el) el.indeterminate = someChecked;
                    }} // ✅ returns void
                    onChange={(e) =>
                      rows.forEach((r) => onSelect(r.id, e.target.checked))
                    }
                  />
                </label>
              </th>
              <th className="px-2 py-2">Product</th>
              <th className="px-2 py-2">SKU</th>
              <th className="px-2 py-2">Price</th>
              <th className="px-2 py-2">Inventory</th>
              <th className="px-2 py-2">Stock</th>
              <th className="px-2 py-2">Status</th>
              <th className="px-2 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr
                key={p.id}
                className="border-b border-neutral-100 last:border-none dark:border-neutral-800"
              >
                <td className="px-2 py-2 align-middle">
                  <input
                    type="checkbox"
                    checked={selected.has(p.id)}
                    onChange={(e) => onSelect(p.id, e.target.checked)}
                  />
                </td>
                <td className="px-2 py-2">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-xl ring-1 ring-neutral-200 dark:ring-neutral-800">
                      {p.image_url ? (
                        <Image
                          src={p.image_url}
                          alt={p.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-xs opacity-60">
                          —
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-nowrap text-ellipsis">
                        {p.name}
                      </div>
                      <div className="text-xs opacity-70">#{p.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-2 py-2">{p.sku || "—"}</td>
                <td className="px-2 py-2">{money(p.price)}</td>
                <td className="px-2 py-2">{p.stock ?? 0}</td>
                <td className="px-2 py-2">
                  <StockPill
                    inv={p.stock ?? 0}
                    low={p.low_stock_threshold ?? 0}
                  />
                </td>
                <td className="px-2 py-2">
                  <StatusPill active={p.is_active} />
                </td>
                <td className="px-2 py-2 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onQuickEdit(p)}
                      className="rounded-lg px-2 py-1 text-xs ring-1 ring-neutral-200 dark:ring-neutral-800"
                    >
                      Edit
                    </button>
                    <Link
                      href={`/products/${p.slug || p.id}`}
                      className="rounded-lg px-2 py-1 text-xs ring-1 ring-neutral-200 dark:ring-neutral-800"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => onToggleActive(p)}
                      className="rounded-lg px-2 py-1 text-xs ring-1 ring-neutral-200 dark:ring-neutral-800"
                    >
                      {p.is_active ? "Disable" : "Activate"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-2 py-6 text-center text-sm opacity-70"
                >
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------- Quick Edit Modal ----------
function Modal({
  open,
  onClose,
  children,
  title,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-xs ring-1 ring-neutral-200 dark:ring-neutral-800"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ---------- Main Page ----------
export default function AdminProductsPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Guard non-admins
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (user && (user as any).is_superuser === false) router.replace("/");
  }, [user, router]);

  // Filters & state
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "disabled">("all");
  const [stock, setStock] = useState<"all" | "low" | "out">("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sort, setSort] = useState("");
  const [labelCopies, setLabelCopies] = useState<number>(1);

  const { data, loading } = useProducts({
    q,
    status,
    stock,
    page,
    pageSize,
    sort,
  });
  const rows = data?.results ?? [];

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<{
    price: number;
    tag?: string;
    inventory?: number;
    is_active?: boolean;
  }>({ price: 0 });

  function onSelect(id: number, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function onQuickEdit(p: Product) {
    setEditing(p);
    setForm({
      price: p.price ?? 0,
      tag: p.sku,
      inventory: p.inventory ?? 0,
      is_active: p.is_active,
    });
    setEditOpen(true);
  }

  async function onToggleActive(p: Product) {
    try {
      setBusy(true);
      await api.patch(`/admin/products/${p.id}/`, { is_active: !p.is_active });
      // Refresh current page
      const res = await api.get("/admin/products/", {
        params: {
          q,
          status: status !== "all" ? status : undefined,
          stock: stock !== "all" ? stock : undefined,
          page,
          page_size: pageSize,
          sort: sort || undefined,
        },
      });
      if (Array.isArray(res.data)) {
        // no-op, we rely on window reload fallback below if needed
      }
      // Fast path: update local state when we can
      (data.results || []).forEach((row) => {
        if (row.id === p.id) row.is_active = !p.is_active;
      });
    } catch (e) {
      console.error(e);
      alert("Failed to toggle active state.");
    } finally {
      setBusy(false);
    }
  }
  function printMiniLabels() {
    const ids = Array.from(selected);
    if (!ids.length) {
      alert("Select products to print labels.");
      return;
    }
    const q = new URLSearchParams({
      ids: ids.join(","),
      copies: String(Math.max(1, Math.min(200, Number(labelCopies) || 1))),
    });
    router.push(`/admin/products/print/mini-labels?${q.toString()}`);
  }

  async function onSaveEdit() {
    if (!editing) return;
    try {
      setBusy(true);
      await api.patch(`/admin/products/${editing.id}/`, form);
      setEditOpen(false);
      // optimistic update
      (data.results || []).forEach((row) => {
        if (row.id === editing.id) {
          row.price = form.price;
          row.tag = form.tag;
          row.inventory = form.inventory;
          row.is_active = form.is_active;
        }
      });
    } catch (e) {
      console.error(e);
      alert("Failed to save changes. Check console/network.");
    } finally {
      setBusy(false);
    }
  }

  async function bulkUpdateActive(toActive: boolean) {
    if (selected.size === 0) return;
    try {
      setBusy(true);
      const ids = Array.from(selected);
      // If you don't have a bulk endpoint, loop (simple & safe)
      await Promise.all(
        ids.map((id) =>
          api.patch(`/admin/products/${id}/`, { is_active: toActive })
        )
      );
      setSelected(new Set());
      // soft refresh
      setPage((p) => p); // trigger hook
    } catch (e) {
      console.error(e);
      alert("Bulk update failed.");
    } finally {
      setBusy(false);
    }
  }

  async function bulkDelete() {
    if (!confirm(`Delete ${selected.size} product(s)? This cannot be undone.`))
      return;
    try {
      setBusy(true);
      const ids = Array.from(selected);
      await Promise.all(ids.map((id) => api.delete(`/admin/products/${id}/`)));
      setSelected(new Set());
      setPage(1); // back to first page after deletes
    } catch (e) {
      console.error(e);
      alert("Bulk delete failed.");
    } finally {
      setBusy(false);
    }
  }

  function exportCSV() {
    const headers = ["ID", "Name", "SKU", "Price", "Inventory", "Active"];
    const rowsCSV = rows.map((p) =>
      [
        p.id,
        p.name,
        p.sku || "",
        p.price,
        p.stock ?? 0,
        p.is_active ? "1" : "0",
      ].join(",")
    );
    const csv = [headers.join(","), ...rowsCSV].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `elvarra-products-page-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalPages = Math.max(
    1,
    Math.ceil((data?.count || 0) / (data?.page_size || pageSize))
  );

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-4">
      <nav className=" max-w-7xl px-4 sm:px-6 lg:px-1 py-4  text-xs opacity-80">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/admin" className="hover:opacity-80">
              Dashboard
            </Link>
          </li>
          <li>›</li>

          <li className="opacity-90">{"Products"} </li>
        </ol>
      </nav>
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Products</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/products/new"
            className="rounded-xl  px-4 py-2 text-sm text-white btn-gradient-accent dark:text-neutral-900"
          >
            + Add Product
          </Link>
          <Link
            href="/"
            className="rounded-xl px-3 py-2 text-sm ring-1 ring-neutral-200 dark:ring-neutral-800"
          >
            View Store
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white/90 px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-amber-500 dark:border-neutral-800 dark:bg-neutral-900/70">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            className="opacity-60"
            aria-hidden
          >
            <path
              d="M10 4a6 6 0 1 1 0 12A6 6 0 0 1 10 4Zm8.65 14.24-3.5-3.5"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, SKU..."
            className="w-full bg-transparent outline-none placeholder:opacity-60"
          />
          {loading ? (
            <Spinner size={14} />
          ) : (
            <button
              onClick={() => setPage(1)}
              className="rounded-xl px-2 py-1 text-xs ring-1 ring-neutral-200 dark:ring-neutral-800"
            >
              Search
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm opacity-70">Status</label>
          <div className="flex gap-1">
            {(["all", "active", "disabled"] as const).map((v) => (
              <button
                key={v}
                onClick={() => {
                  setStatus(v);
                  setPage(1);
                }}
                className={clsx(
                  "rounded-full px-3 py-1 text-xs ring-1",
                  status === v
                    ? " text-white ring-neutral-900 btn-gradient-accent dark:text-neutral-900"
                    : "ring-neutral-200 dark:ring-neutral-800"
                )}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm opacity-70">Stock</label>
          <div className="flex gap-1">
            {(["all", "low", "out"] as const).map((v) => (
              <button
                key={v}
                onClick={() => {
                  setStock(v);
                  setPage(1);
                }}
                className={clsx(
                  "rounded-full px-3 py-1 text-xs ring-1",
                  stock === v
                    ? " text-white ring-neutral-900 btn-gradient-accent dark:text-neutral-900"
                    : "ring-neutral-200 dark:ring-neutral-800"
                )}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm opacity-70">Sort</label>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-neutral-200 bg-transparent px-3 py-2 text-sm outline-none dark:border-neutral-800"
          >
            <option value="">Default</option>
            <option value="name">Name A→Z</option>
            <option value="-name">Name Z→A</option>
            <option value="price">Price Low→High</option>
            <option value="-price">Price High→Low</option>
            <option value="inventory">Inventory Low→High</option>
            <option value="-inventory">Inventory High→Low</option>
            <option value="-created_at">Newest</option>
            <option value="created_at">Oldest</option>
          </select>
        </div>
      </div>

      {/* Bulk actions */}
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="text-sm opacity-70">Selected: {selected.size}</span>
        <button
          onClick={() => bulkUpdateActive(true)}
          disabled={selected.size === 0}
          className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs text-white disabled:opacity-50"
        >
          Activate
        </button>
        <button
          onClick={() => bulkUpdateActive(false)}
          disabled={selected.size === 0}
          className="rounded-xl bg-neutral-700 px-3 py-1.5 text-xs text-white disabled:opacity-50"
        >
          Deactivate
        </button>
        <button
          onClick={bulkDelete}
          disabled={selected.size === 0}
          className="rounded-xl bg-rose-600 px-3 py-1.5 text-xs text-white disabled:opacity-50"
        >
          Delete
        </button>
        <button
          onClick={exportCSV}
          className="ml-auto rounded-xl px-3 py-1.5 text-xs ring-1 ring-neutral-200 dark:ring-neutral-800"
        >
          Export CSV
        </button>
        <div className="ml-auto flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={200}
            value={labelCopies}
            onChange={(e) => setLabelCopies(Number(e.target.value || 1))}
            className="w-20 rounded-xl border border-neutral-200 bg-transparent px-2 py-1.5 text-xs outline-none dark:border-neutral-800"
            title="Copies per product"
          />
          <button
            onClick={printMiniLabels}
            disabled={selected.size === 0}
            className="rounded-xl bg-neutral-900 px-3 py-1.5 text-xs text-white disabled:opacity-50 dark:bg-amber-500 dark:text-neutral-900"
          >
            Print mini labels
          </button>

          {/* keep Export CSV where it was */}
          <button
            onClick={exportCSV}
            className="rounded-xl px-3 py-1.5 text-xs ring-1 ring-neutral-200 dark:ring-neutral-800"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <ProductsTable
        rows={rows}
        onSelect={onSelect}
        selected={selected}
        onQuickEdit={onQuickEdit}
        onToggleActive={onToggleActive}
      />

      {/* Pagination */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="text-sm opacity-70">
          Showing {(data.page - 1) * data.page_size + 1}–
          {Math.min(data.page * data.page_size, data.count)} of {data.count}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-xl px-3 py-1.5 text-xs ring-1 ring-neutral-200 disabled:opacity-50 dark:ring-neutral-800"
          >
            Prev
          </button>
          <div className="text-sm">
            Page {page} / {totalPages}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-xl px-3 py-1.5 text-xs ring-1 ring-neutral-200 disabled:opacity-50 dark:ring-neutral-800"
          >
            Next
          </button>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="rounded-xl border border-neutral-200 bg-transparent px-2 py-1.5 text-xs outline-none dark:border-neutral-800"
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}/page
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Edit Modal */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={editing ? `Edit: ${editing.name}` : "Edit Product"}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <div className="mb-1 opacity-70">Price</div>
            <input
              type="number"
              value={form.price}
              onChange={(e) =>
                setForm((f) => ({ ...f, price: Number(e.target.value || 0) }))
              }
              className="w-full rounded-xl border border-neutral-200 bg-transparent px-3 py-2 outline-none dark:border-neutral-800"
            />
          </label>
          <label className="text-sm">
            <div className="mb-1 opacity-70">TAG</div>
            <input
              value={form.tag || ""}
              onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value }))}
              className="w-full rounded-xl border border-neutral-200 bg-transparent px-3 py-2 outline-none dark:border-neutral-800"
            />
          </label>
          <label className="text-sm">
            <div className="mb-1 opacity-70">Inventory</div>
            <input
              type="number"
              value={form.inventory ?? 0}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  inventory: Number(e.target.value || 0),
                }))
              }
              className="w-full rounded-xl border border-neutral-200 bg-transparent px-3 py-2 outline-none dark:border-neutral-800"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!form.is_active}
              onChange={(e) =>
                setForm((f) => ({ ...f, is_active: e.target.checked }))
              }
            />
            <span>Active</span>
          </label>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={() => setEditOpen(false)}
            className="rounded-xl px-3 py-2 text-xs ring-1 ring-neutral-200 dark:ring-neutral-800"
          >
            Cancel
          </button>
          <button
            onClick={onSaveEdit}
            className="rounded-xl bg-neutral-900 px-4 py-2 text-xs text-white hover:brightness-110 dark:bg-amber-500 dark:text-neutral-900"
          >
            Save
          </button>
        </div>
      </Modal>

      {/* Busy overlay for bulk & edits */}
      <LoadingOverlay
        show={busy || loading}
        label={busy ? "Working..." : "Loading..."}
      />
    </div>
  );
}
