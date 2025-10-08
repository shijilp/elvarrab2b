"use client";

import ESpinner from "@/components/ElvarraSpinner";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Order, OrderItems, OrderStatus } from "@/types";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { money } from "@/lib/utils";
import { StatusPill } from "@/components/ui/StatusPill";
import OrderRepay from "@/components/ui/OrderRepay";

/**
 * Customer Orders — layout adapted to match the "first page" style
 * - Zinc shell bg, Header/Footer
 * - Filter bar with search + status chips
 * - Card list with order summary + items peek
 * - Gradient primary buttons using CSS vars
 *
 * Logic retained from original customer orders page.
 */

// ------- helpers (kept, small tweaks) -------

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // UI filters (preserved)
  const [status, setStatus] = useState<"all" | OrderStatus>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("date-desc");

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { user } = useAuth();

  // fetch logic (preserved)
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("my-orders/");
        setOrders(res.data.results ?? []);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.access) fetchOrders();
    else setLoading(false);
  }, [user]);

  // filter/sort/paginate (preserved)
  const filtered = useMemo(() => {
    let list = orders.slice();

    if (status !== "all") list = list.filter((o) => o.status === status);

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((o) =>
        [
          o.id,
          o.status,
          // try item names if present
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...(Array.isArray((o as any).items)
            ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (o as any).items.map((i: any) => i?.name ?? "")
            : []),
        ]
          .filter(Boolean)
          .some((x) => String(x).toLowerCase().includes(q))
      );
    }

    switch (sort) {
      case "date-asc":
        list.sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at));
        break;
      case "total-desc":
        list.sort((a, b) => (b.total_amount ?? 0) - (a.total_amount ?? 0));
        break;
      case "total-asc":
        list.sort((a, b) => (a.total_amount ?? 0) - (b.total_amount ?? 0));
        break;
      default:
        list.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    }

    return list;
  }, [status, query, sort, orders]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page]
  );
  const goto = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 dark:bg-black/70">
        <ESpinner />
      </div>
    );
  }

  return (
    <main className="min-h-dvh bg-zinc-950 text-zinc-100">
      <section className="mx-auto max-w-7xl px-4 py-6 sm:py-10">
        {/* Page header row */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">My Orders</h1>
            <p className="mt-1 text-sm text-zinc-400">
              View and track your orders.
            </p>
          </div>
          <div className="text-sm text-zinc-400">
            {filtered.length} order(s)
          </div>
        </div>

        {/* Filters bar — search + chips + sort + CTA (styled like first page) */}
        <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <div className="flex flex-wrap items-center gap-3">
            {/* search */}
            <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className="opacity-70"
              >
                <path
                  d="M21 21l-4.3-4.3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle
                  cx="11"
                  cy="11"
                  r="7"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search orders (ID, status, item)"
                className="bg-transparent text-sm outline-none placeholder:text-zinc-500"
              />
            </div>

            {/* status chips */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: "all", label: "All" },
                { id: "new", label: "New" },
                { id: "confirmed", label: "Confirmed" },
                { id: "shipped", label: "Shipped" },
                { id: "delivered", label: "Delivered" },
                { id: "cancelled", label: "Cancelled" },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    setStatus(s.id as any);
                    setPage(1);
                  }}
                  className={`rounded-full border px-3 py-1 text-sm ${
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    status === (s.id as any)
                      ? "border-[var(--color-primary)] bg-zinc-900"
                      : "border-zinc-800 bg-zinc-900/60"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* sort */}
            <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-2 py-1">
              <span className="px-2 text-xs text-zinc-400">Sort</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-lg bg-zinc-950 px-2 py-1 text-sm outline-none"
              >
                <option value="date-desc">Newest first</option>
                <option value="date-asc">Oldest first</option>
                <option value="total-desc">Highest total</option>
                <option value="total-asc">Lowest total</option>
              </select>
            </div>
          </div>

          <div className="justify-self-start md:justify-self-end">
            <Link
              href="/products"
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm hover:bg-zinc-800"
            >
              Continue shopping
            </Link>
          </div>
        </div>

        {/* Orders list (cards) */}
        <div className="mt-6 space-y-3">
          {pageItems.length === 0 && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center text-zinc-300">
              No orders found.
            </div>
          )}

          {pageItems.map((o) => (
            <div
              key={o.id}
              className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"
            >
              <div className="grid gap-4 p-4 sm:grid-cols-[1fr_auto] sm:items-center sm:p-5">
                {/* left: id + meta */}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={`/orders/${o.id}`}
                      className="font-semibold text-white hover:underline"
                    >
                      Order {o.id}
                    </Link>
                    {o.status && <StatusPill status={o.status} />}
                  </div>
                  <div className="mt-1 text-sm text-zinc-400">
                    Placed on {new Date(o.created_at).toLocaleDateString()}
                  </div>
                </div>

                {/* right: total + CTA */}
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-sm">
                    Total: {money(o.total_amount ?? 0)}
                  </div>

                  {/* Cancel button (only for cancellable statuses) */}
                  {["new", "confirmed", "processing", "packed"].includes(
                    o.status
                  ) && (
                    <button
                      onClick={async () => {
                        const ok = window.confirm(
                          "Are you sure you want to cancel this order?"
                        );
                        if (!ok) return;

                        try {
                          await api.post(`orders/${o.id}/cancel/`);
                          alert(
                            "Order cancelled successfully. Amount credited to wallet."
                          );
                          // Refresh orders
                          const res = await api.get("my-orders/");
                          setOrders(res.data.results ?? []);
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        } catch (err: any) {
                          console.error("Cancel failed:", err);
                          const msg =
                            err?.response?.data?.error ||
                            err?.response?.data?.detail ||
                            "Unable to cancel order.";
                          alert(msg);
                        }
                      }}
                      className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-rose-400 hover:bg-zinc-800"
                    >
                      Cancel
                    </button>
                  )}
                  {!o.is_paid && <OrderRepay order_id={o.id} />}
                  <Link
                    href={`/orders/${encodeURIComponent(String(o.id))}`}
                    className="rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[var(--text-dark)]"
                  >
                    View
                  </Link>
                </div>
              </div>

              {/* Items peek (if items exist) */}
              {"items" in o &&
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                Array.isArray((o as any).items) &&
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (o as any).items.length > 0 && (
                  <div className="border-t border-zinc-800 p-3 sm:p-4">
                    <div className="flex snap-x gap-3 overflow-x-auto">
                      {(o as Order).items.map((i: OrderItems, idx: number) => (
                        <div
                          key={i?.id ?? idx}
                          className="snap-start inline-flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950 pr-3"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={
                              i?.product.image ??
                              i?.product.images ??
                              "/images/placeholders/box.png"
                            }
                            alt={i?.product.name ?? "Item"}
                            className="h-14 w-14 rounded-l-xl object-cover"
                          />
                          <div className="min-w-0">
                            <Link href={`/products/${i?.product.slug}`}>
                              <div className="line-clamp-1 text-sm text-zinc-200">
                                {i?.product.name ?? "Item"}
                              </div>
                            </Link>
                            <div className="text-xs text-zinc-400">
                              Qty {i?.quantity ?? i?.quantity ?? 1}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          ))}
        </div>

        {/* Pagination (compact) */}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm">
          <button
            onClick={() => goto(page - 1)}
            disabled={page <= 1}
            className="rounded-xl border border-zinc-800 px-3 py-1.5 disabled:opacity-40"
          >
            Prev
          </button>
          <div className="px-1 py-1.5">
            Page {page} / {totalPages}
          </div>
          <button
            onClick={() => goto(page + 1)}
            disabled={page >= totalPages}
            className="rounded-xl border border-zinc-800 px-3 py-1.5 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </section>
    </main>
  );
}
