"use client";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Order } from "@/types";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";

// ------------------------------------------------------------
// Elvarra / Elvara — CUSTOMER ORDERS PAGE (Retail Only)
// Route: app/account/orders/page.tsx
// Shows only the signed‑in customer's **retail** orders
// ------------------------------------------------------------

type ThemeMode = "dark" | "light";
type Palette = {
  bg: string;
  fg: string;
  subfg: string;
  card: string;
  border: string;
  button: string;
  ring: string;
  chip: string;
};

function paletteForTheme(theme: ThemeMode): Palette {
  return theme === "dark"
    ? {
        bg: "bg-neutral-950",
        fg: "text-neutral-50",
        subfg: "text-neutral-300",
        card: "bg-neutral-900/70",
        border: "border-neutral-800",
        button:
          "bg-gradient-to-r from-yellow-500 to-amber-500 text-neutral-900 hover:brightness-110",
        ring: "ring-1 ring-neutral-800",
        chip: "bg-yellow-500 text-neutral-900",
      }
    : {
        bg: "bg-neutral-50",
        fg: "text-neutral-900",
        subfg: "text-neutral-600",
        card: "bg-white/90",
        border: "border-neutral-200",
        button:
          "bg-gradient-to-r from-rose-400 to-pink-500 text-white hover:brightness-110",
        ring: "ring-1 ring-neutral-200",
        chip: "bg-neutral-900 text-neutral-50",
      };
}

type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Shipped"
  | "Delivered"
  | "Cancelled";
type OrderRow = {
  id: string;
  createdAt: string;
  status: string;
  items: number;
  currency: string;
  subtotal: number;
  tax: number;
};

function money(n: number, currency = "USD") {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(n);
  } catch {
    return `$${n.toFixed(2)}`;
  }
}

function statusChip(status: OrderStatus) {
  switch (status) {
    case "Pending":
      return "bg-yellow-500 text-neutral-900";
    case "Confirmed":
      return "bg-blue-500 text-white";
    case "Shipped":
      return "bg-amber-600 text-white";
    case "Delivered":
      return "bg-emerald-500 text-white";
    case "Cancelled":
      return "bg-rose-500 text-white";
  }
}

export default function CustomerOrdersPage() {
  const theme: ThemeMode = "dark";
  const palette = useMemo(() => paletteForTheme(theme), [theme]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState<"all" | OrderStatus>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("date-desc");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { user } = useAuth();

  const filtered = useMemo(() => {
    let list = orders.slice();
    if (status !== "all") list = list.filter((o) => o.status === status);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((o) =>
        [o.status].some((x) => x.toLowerCase().includes(q))
      );
    }
    switch (sort) {
      case "date-asc":
        list.sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at));
        break;
      case "total-desc":
        list.sort((a, b) => b.subtotal_amount - a.subtotal_amount);
        break;
      case "total-asc":
        list.sort((a, b) => a.total_amount - b.total_amount);
        break;
      default:
        list.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    }
    return list;
  }, [status, query, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page]
  );
  function goto(p: number) {
    setPage(Math.min(Math.max(1, p), totalPages));
  }
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("my-orders/", {
          headers: { Authorization: `Bearer ${user?.access}` },
        });
        setOrders(res.data.results);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.access) fetchOrders();
    else setLoading(false); // avoid spinner forever when logged out
  }, [user]);

  return (
    <main className={`} ${palette.fg} min-h-screen antialiased `}>
      <div className="container mx-auto pt-5  ">
        <h1 className="text-2xl font-semibold">My Orders</h1>
        <p className={`mt-1 text-sm ${palette.subfg}`}>
          View your retail orders and track their status.
        </p>
        <div className=" inset-0 -z-10 opacity-40 blur-3xl">
          <div className="pointer-events-none absolute -inset-20 rounded-[100px] gradient-accent" />
        </div>

        {/* Filters */}
        <section
          className={`mt-6 rounded-2xl ${palette.ring} ${palette.card} p-4`}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wider opacity-80">
                Search
              </label>
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Order ID, status..."
                className={`w-full rounded-xl border ${palette.border} bg-transparent px-3 py-2 text-sm outline-none`}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wider opacity-80">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  setStatus(e.target.value as any);
                  setPage(1);
                }}
                className={`w-full rounded-xl border ${palette.border} bg-transparent px-3 py-2 text-sm outline-none`}
              >
                <option value="all">All</option>
                {(
                  [
                    "Pending",
                    "Confirmed",
                    "Shipped",
                    "Delivered",
                    "Cancelled",
                  ] as OrderStatus[]
                ).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wider opacity-80">
                Sort
              </label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className={`w-full rounded-xl border ${palette.border} bg-transparent px-3 py-2 text-sm outline-none`}
              >
                <option value="date-desc">Newest first</option>
                <option value="date-asc">Oldest first</option>
                <option value="total-desc">Highest total</option>
                <option value="total-asc">Lowest total</option>
              </select>
            </div>
            <div className="flex items-end">
              <a
                href="/products"
                className={`w-full rounded-xl px-3 py-2 text-center text-sm font-medium ${palette.button}`}
              >
                Shop Again
              </a>
            </div>
          </div>
        </section>

        {/* Orders table */}
        <section className="mt-6 overflow-hidden rounded-2xl">
          <div
            className={`min-w-full overflow-x-auto rounded-2xl ${palette.ring} ${palette.card}`}
          >
            <table className="min-w-full text-sm">
              <thead className="text-left opacity-80">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">VAT</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={`px-4 py-6 ${palette.subfg}`}>
                      No retail orders yet.
                    </td>
                  </tr>
                ) : (
                  pageItems.map((o) => {
                    const total = o.total_amount;
                    return (
                      <tr key={o.id} className="border-t border-white/5">
                        <Link href={`/orders/${o.id}`}>
                          {" "}
                          <td className="px-4 py-3 font-medium">{o.id}</td>
                        </Link>
                        <td className="px-4 py-3">
                          {new Date(o.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">{}</td>
                        {/* o.items */}
                        <td className="px-4 py-3">
                          {money(o.subtotal_amount)}
                        </td>
                        <td className="px-4 py-3">{money(total, "INR")}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block rounded-full px-2 py-1 text-[11px] font-semibold ${statusChip(
                              o.status
                            )}`}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <a
                            href={`/account/orders/${encodeURIComponent(o.id)}`}
                            className={`rounded-xl border ${palette.border} px-3 py-1.5`}
                          >
                            View
                          </a>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-center gap-2 text-sm">
          <button
            onClick={() => goto(page - 1)}
            disabled={page <= 1}
            className={`rounded-xl border ${palette.border} px-3 py-1.5 disabled:opacity-40`}
          >
            Prev
          </button>
          <div className="px-1 py-1.5">
            Page {page} / {totalPages}
          </div>
          <button
            onClick={() => goto(page + 1)}
            disabled={page >= totalPages}
            className={`rounded-xl border ${palette.border} px-3 py-1.5 disabled:opacity-40`}
          >
            Next
          </button>
        </div>

        {/* Helpful info */}
        <section
          className={`mt-6 rounded-2xl ${palette.ring} ${palette.card} p-4 text-sm ${palette.subfg}`}
        >
          <div className="font-medium text-current">Tips</div>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              Click <em>View</em> to see tracking and item details.
            </li>
            <li>Retail orders automatically include VAT in totals.</li>
            <li>
              Need to change your shipping address? Contact support before your
              order ships.
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
