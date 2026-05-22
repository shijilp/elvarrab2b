"use client";

import ESpinner from "@/components/ElvarraSpinner";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Order, OrderItems, OrderStatus } from "@/types";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { StatusPill } from "@/components/ui/StatusPill";
import OrderRepay from "@/components/ui/OrderRepay";
import { money } from "@/lib/money";

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState<"all" | OrderStatus>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("date-desc");

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { user } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("b2b/my-orders/");
        setOrders(res.data ?? []);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchOrders();
    else setLoading(false);
  }, [user]);

  const filtered = useMemo(() => {
    let list = orders.slice();

    if (status !== "all") list = list.filter((o) => o.status === status);

    if (query.trim()) {
      const q = query.toLowerCase();

      list = list.filter((o) =>
        [
          o.id,
          o.order_number,
          o.status,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...(Array.isArray((o as any).items)
            ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (o as any).items.map(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (i: any) => i?.product?.name ?? i?.name ?? "",
              )
            : []),
        ]
          .filter(Boolean)
          .some((x) => String(x).toLowerCase().includes(q)),
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
    [filtered, page],
  );

  const goto = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));

  const orderStats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) =>
      ["new", "confirmed", "processing", "packed"].includes(String(o.status)),
    ).length;
    const shipped = orders.filter((o) => o.status === "shipped").length;
    const delivered = orders.filter((o) => o.status === "delivered").length;

    return { total, pending, shipped, delivered };
  }, [orders]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#06111f]/90">
        <ESpinner />
      </div>
    );
  }

  return (
    <main className="min-h-dvh bg-[#06111f] text-slate-100">
      <section className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-br from-slate-950 via-[#06111f] to-blue-950/70">
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-0 top-20 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:py-12">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300">
                B2B Trade Orders
              </div>

              <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                My Wholesale Orders
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Track your trade purchases, payment status, dispatch updates and
                reorder details from one wholesale account dashboard.
              </p>
            </div>

            <Link
              href="/products"
              className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-3 text-sm font-semibold text-cyan-200 shadow-[0_10px_40px_-20px_rgba(34,211,238,.7)] transition hover:bg-cyan-500/20"
            >
              Continue Wholesale Shopping
            </Link>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Orders" value={orderStats.total} />
            <StatCard label="Active Orders" value={orderStats.pending} />
            <StatCard label="Shipped" value={orderStats.shipped} />
            <StatCard label="Delivered" value={orderStats.delivered} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
        <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4 shadow-[0_20px_80px_-40px_rgba(15,23,42,.9)]">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex min-w-[260px] flex-1 items-center gap-2 rounded-2xl border border-slate-800 bg-[#06111f] px-4 py-3">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-cyan-300/80"
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
                  placeholder="Search order number, status or item"
                  className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
                />
              </div>

              <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-[#06111f] px-3 py-2">
                <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Sort
                </span>

                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none"
                >
                  <option value="date-desc">Newest first</option>
                  <option value="date-asc">Oldest first</option>
                  <option value="total-desc">Highest total</option>
                  <option value="total-asc">Lowest total</option>
                </select>
              </div>
            </div>

            <div className="text-sm text-slate-400">
              Showing{" "}
              <span className="font-semibold text-cyan-300">
                {filtered.length}
              </span>{" "}
              order(s)
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { id: "all", label: "All" },
              { id: "new", label: "New" },
              { id: "confirmed", label: "Confirmed" },
              { id: "shipped", label: "Shipped" },
              { id: "delivered", label: "Delivered" },
              { id: "cancelled", label: "Cancelled" },
            ].map((s) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const active = status === (s.id as any);

              return (
                <button
                  key={s.id}
                  onClick={() => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    setStatus(s.id as any);
                    setPage(1);
                  }}
                  className={[
                    "rounded-full border px-4 py-2 text-sm font-medium transition",
                    active
                      ? "border-cyan-400/50 bg-cyan-500/15 text-cyan-200"
                      : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-white",
                  ].join(" ")}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {pageItems.length === 0 && (
            <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-10 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-slate-800 bg-[#06111f] text-cyan-300">
                ▣
              </div>

              <h2 className="mt-4 text-lg font-semibold text-white">
                No wholesale orders found
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Try changing your filter or start a new wholesale order.
              </p>
            </div>
          )}

          {pageItems.map((o) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const isWholesale = Boolean((o as any).is_wholesale ?? true);

            return (
              <div
                key={o.id}
                className={[
                  "overflow-hidden rounded-3xl border bg-slate-950/70 shadow-[0_20px_80px_-45px_rgba(15,23,42,.9)] transition",
                  isWholesale
                    ? "border-cyan-500/20 ring-1 ring-cyan-500/5"
                    : "border-slate-800",
                ].join(" ")}
              >
                <div className="border-b border-slate-800 bg-gradient-to-r from-slate-950 via-[#071827] to-blue-950/30 p-4 sm:p-5">
                  <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <Link
                          href={`/orders/${o.id}`}
                          className="text-lg font-bold text-white hover:text-cyan-200"
                        >
                          Order {o.order_number}
                        </Link>

                        {isWholesale && (
                          <span className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">
                            B2B
                          </span>
                        )}

                        {o.status && <StatusPill status={o.status} />}
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span>
                          Placed on{" "}
                          <span className="text-slate-200">
                            {new Date(o.created_at).toLocaleDateString()}
                          </span>
                        </span>

                        <span className="hidden h-1 w-1 rounded-full bg-slate-600 sm:block" />

                        <span>
                          Trade channel:{" "}
                          <span className="font-semibold text-cyan-300">
                            Wholesale
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                      <div className="rounded-2xl border border-slate-800 bg-[#06111f] px-4 py-2 text-sm text-slate-300">
                        Total{" "}
                        <span className="ml-2 font-bold text-cyan-200">
                          {money(o.total_amount ?? 0)}
                        </span>
                      </div>

                      {!o.is_paid && <OrderRepay order_id={o.id} />}

                      <Link
                        href={`/orders/${encodeURIComponent(String(o.id))}`}
                        className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/20"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>

                {"items" in o &&
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  Array.isArray((o as any).items) &&
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (o as any).items.length > 0 && (
                    <div className="p-4 sm:p-5">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                          Order Items
                        </div>

                        <div className="text-xs text-slate-500">
                          {(o as Order).items.length} SKU(s)
                        </div>
                      </div>

                      <div className="flex snap-x gap-3 overflow-x-auto pb-1">
                        {(o as Order).items.map(
                          (i: OrderItems, idx: number) => (
                            <div
                              key={i?.id ?? idx}
                              className="snap-start inline-flex min-w-[260px] items-center gap-3 rounded-2xl border border-slate-800 bg-[#06111f] pr-3"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={
                                  i?.product.image ??
                                  i?.product.images ??
                                  "/images/placeholders/box.png"
                                }
                                alt={i?.product.name ?? "Item"}
                                className="h-16 w-16 rounded-l-2xl object-cover"
                              />

                              <div className="min-w-0 flex-1">
                                <Link href={`/products/${i?.product.slug}`}>
                                  <div className="line-clamp-1 text-sm font-medium text-slate-100 hover:text-cyan-200">
                                    {i?.product.name ?? "Item"}
                                  </div>
                                </Link>

                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                                  <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-cyan-300">
                                    Qty {i?.quantity ?? 1}
                                  </span>
                                  <span>Wholesale item</span>
                                </div>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-sm">
          <button
            onClick={() => goto(page - 1)}
            disabled={page <= 1}
            className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-2 text-slate-300 transition hover:border-cyan-500/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Prev
          </button>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-2 text-slate-400">
            Page <span className="font-semibold text-cyan-300">{page}</span> /{" "}
            {totalPages}
          </div>

          <button
            onClick={() => goto(page + 1)}
            disabled={page >= totalPages}
            className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-2 text-slate-300 transition hover:border-cyan-500/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </div>

      <div className="mt-2 text-2xl font-bold text-white">{value}</div>
    </div>
  );
}
