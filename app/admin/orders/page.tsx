"use client";
import { OrdersTable } from "@/components/admin/OrderTable";
import ESpinner from "@/components/ElvarraSpinner";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Order, OrderStatus } from "@/types";
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
    case "new":
      return "bg-yellow-500 text-neutral-900";
    case "confirmed":
      return "bg-blue-500 text-white";
    case "shipped":
      return "bg-amber-600 text-white";
    case "delivered":
      return "bg-emerald-500 text-white";
    case "cancelled":
      return "bg-rose-500 text-white";
  }
}

export default function CustomerOrdersPage() {
  const theme: ThemeMode = "dark";
  const palette = useMemo(() => paletteForTheme(theme), [theme]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const [status, setStatus] = useState<"all" | OrderStatus>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("date-desc");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQ, setSearchQ] = useState("");
  const [busy, setBusy] = useState(false);

  function onSelect(id: number, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

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
        list.sort((a, b) => b.subtotal - a.subtotal);
        break;
      case "total-asc":
        list.sort((a, b) => a.total_amount - b.total_amount);
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
  function goto(p: number) {
    setPage(Math.min(Math.max(1, p), totalPages));
  }
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/admin/orders/", {
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

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/70 dark:bg-black/70 z-50">
        <ESpinner />
      </div>
    );
  }
  return (
    <main className={`} ${palette.fg} min-h-screen antialiased `}>
      <div className="container mx-auto pt-5  ">
        <nav className=" max-w-7xl px-4 sm:px-6 lg:px-1 py-4  text-xs opacity-80">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/admin" className="hover:opacity-80">
                Dashboard
              </Link>
            </li>
            <li>›</li>

            <li className="opacity-90">{"Orders"} </li>
          </ol>
        </nav>
        <h1 className="text-2xl font-semibold">My Orders</h1>
        <p className={`mt-1 text-sm ${palette.subfg}`}>
          View your retail orders and track their status.
        </p>
        <div className=" inset-0 -z-10 opacity-40 blur-3xl">
          <div className="pointer-events-none absolute -inset-20 rounded-[100px] gradient-accent" />
        </div>
        {/* <PrintAllPackingSlipsButton /> */}
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
                className={`w-full rounded-xl border ${palette.border}  px-3 py-2 bg-neutral-900  text-sm outline-none`}
              >
                <option value="all" className="text-sm">
                  All
                </option>
                {(
                  [
                    "pending",
                    "confirmed",
                    "shipped",
                    "delivered",
                    "cancelled",
                  ] as OrderStatus[]
                ).map((s) => (
                  <option key={s} value={s} className="text-sm ">
                    {s.toLocaleUpperCase()}
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
                className={`w-full rounded-xl border ${palette.border} bg-neutral-900  px-3 py-2 text-sm outline-none`}
              >
                <option value="date-desc">Newest first</option>
                <option value="date-asc">Oldest first</option>
                <option value="total-desc">Highest total</option>
                <option value="total-asc">Lowest total</option>
              </select>
            </div>
            <div className="flex items-end">
              <Link
                href="/products"
                className={`w-full rounded-xl px-3 py-2 text-center text-sm font-medium ${palette.button}`}
              >
                Shop Again
              </Link>
            </div>
          </div>
        </section>

        {/* Orders table */}
        <section className="mt-6 overflow-hidden rounded-2xl">
          <OrdersTable
            rows={pageItems}
            onSelect={onSelect}
            selected={selected}
            onBulk={onBulk}
            onPrint={onPrint}
            show={false}
          />
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

  async function onBulk(
    action: "processing" | "confirmed" | "shipped" | "cancelled" | "delivered"
  ) {
    if (selected.size === 0) return;
    try {
      //setBusy(true);
      await api.post("/admin/orders/bulk-status", {
        ids: Array.from(selected),
        status: action,
      });
      // Re-fetch orders
      const res = await api.get("/admin/orders", {
        params: { status: statusFilter || undefined, q: searchQ || undefined },
      });
      setSelected(new Set());

      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("Failed to update status. Check console/network.");
    } finally {
      setBusy(false);
    }
  }

  async function onPrint() {
    if (selected.size === 0) return;
    try {
      setBusy(true);
      const ids = Array.from(selected);
      // This hits your existing bulk endpoint and then navigates to a print page that consumes it.
      // If you want to print directly, you can open a new tab pointing to a consolidated print route.
      const url = `/admin/orders/print/packing-slips?ids=${encodeURIComponent(
        ids.join(",")
      )}`; // implement this route to render slips -> window.print()
      window.open(url, "_blank");
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  }
}
