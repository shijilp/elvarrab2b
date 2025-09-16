"use client";
import React, { useMemo, useState } from "react";

// ------------------------------------------------------------
// Elvarra / Elvara — ORDERS PAGE (All Orders & Status)
// Shows all orders (wholesale + retail) with filters, search, pagination
// Theme unchanged; content adapted to B2B/B2C mixed account view
// Save as: app/orders/page.tsx
// ------------------------------------------------------------

// ---------------------------
// Theme palette utilities (local)
// ---------------------------
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

// ---------------------------
// Types & mock data (replace with API fetch)
// ---------------------------
type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "In Production"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

type OrderSource = "Wholesale" | "Retail";

type OrderRow = {
  id: string; // display id
  createdAt: string; // ISO
  source: OrderSource;
  status: OrderStatus;
  items: number;
  currency: string;
  subtotal: number;
  freight?: number; // wholesale
  tax?: number; // retail
  terms?: string; // EXW/FOB/DAP/DDP for wholesale
};

const MOCK_ORDERS: OrderRow[] = [
  {
    id: "INV-000271",
    createdAt: "2025-08-28T09:00:00Z",
    source: "Wholesale",
    status: "In Production",
    items: 6,
    currency: "USD",
    subtotal: 5280,
    freight: 280,
    terms: "DAP",
  },
  {
    id: "INV-000270",
    createdAt: "2025-08-20T11:30:00Z",
    source: "Wholesale",
    status: "Shipped",
    items: 4,
    currency: "USD",
    subtotal: 3120,
    freight: 360,
    terms: "DDP",
  },
  {
    id: "R-10452",
    createdAt: "2025-08-19T15:12:00Z",
    source: "Retail",
    status: "Delivered",
    items: 3,
    currency: "USD",
    subtotal: 227,
    tax: 34.05,
  },
  {
    id: "R-10421",
    createdAt: "2025-08-12T18:45:00Z",
    source: "Retail",
    status: "Shipped",
    items: 1,
    currency: "USD",
    subtotal: 89,
    tax: 13.35,
  },
  {
    id: "INV-000256",
    createdAt: "2025-07-30T10:05:00Z",
    source: "Wholesale",
    status: "Delivered",
    items: 10,
    currency: "USD",
    subtotal: 9800,
    freight: 0,
    terms: "EXW",
  },
  {
    id: "INV-000259",
    createdAt: "2025-07-25T08:20:00Z",
    source: "Wholesale",
    status: "Cancelled",
    items: 2,
    currency: "USD",
    subtotal: 780,
    freight: 0,
    terms: "FOB",
  },
];

// ---------------------------
// Small helpers
// ---------------------------
function formatMoney(num: number, currency = "USD") {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(num);
  } catch {
    return `$${num.toFixed(2)}`;
  }
}

function statusClass(status: OrderStatus) {
  switch (status) {
    case "Pending":
      return "bg-yellow-500 text-neutral-900";
    case "Confirmed":
      return "bg-blue-500 text-white";
    case "In Production":
      return "bg-violet-500 text-white";
    case "Shipped":
      return "bg-amber-600 text-white";
    case "Delivered":
      return "bg-emerald-500 text-white";
    case "Cancelled":
      return "bg-rose-500 text-white";
  }
}

// ---------------------------
// Default export: Orders Page
// ---------------------------
export default function OrdersPage() {
  const theme: ThemeMode = "dark"; // match site
  const palette = useMemo(() => paletteForTheme(theme), [theme]);

  const [source, setSource] = useState<"all" | OrderSource>("all");
  const [status, setStatus] = useState<"all" | OrderStatus>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("date-desc");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const filtered = useMemo(() => {
    let list = MOCK_ORDERS.slice();
    if (source !== "all") list = list.filter((o) => o.source === source);
    if (status !== "all") list = list.filter((o) => o.status === status);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((o) =>
        [o.id, o.source, o.status, o.terms ?? ""].some((s) =>
          s.toLowerCase().includes(q)
        )
      );
    }
    switch (sort) {
      case "date-asc":
        list.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
        break;
      case "total-desc":
        list.sort(
          (a, b) =>
            b.subtotal +
            (b.freight ?? 0) +
            (b.tax ?? 0) -
            (a.subtotal + (a.freight ?? 0) + (a.tax ?? 0))
        );
        break;
      case "total-asc":
        list.sort(
          (a, b) =>
            a.subtotal +
            (a.freight ?? 0) +
            (a.tax ?? 0) -
            (b.subtotal + (b.freight ?? 0) + (b.tax ?? 0))
        );
        break;
      default:
        list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)); // date-desc
    }
    return list;
  }, [source, status, query, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page]
  );

  function goto(p: number) {
    setPage(Math.min(Math.max(1, p), totalPages));
  }

  return (
    <main className={`${palette.bg} ${palette.fg} min-h-screen antialiased`}>
      <div className="container py-8">
        <h1 className="text-2xl font-semibold">My Orders</h1>
        <p className={`mt-1 text-sm ${palette.subfg}`}>
          Track wholesale & retail orders, statuses, and totals.
        </p>

        {/* Filters */}
        <section
          className={`mt-6 rounded-2xl ${palette.ring} ${palette.card} p-4`}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
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
                placeholder="Order ID, status, terms..."
                className={`w-full rounded-xl border ${palette.border} bg-transparent px-3 py-2 text-sm outline-none`}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wider opacity-80">
                Source
              </label>
              <select
                value={source}
                onChange={(e) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  setSource(e.target.value as any);
                  setPage(1);
                }}
                className={`w-full rounded-xl border ${palette.border} bg-transparent px-3 py-2 text-sm outline-none`}
              >
                <option value="all">All</option>
                <option value="Wholesale">Wholesale</option>
                <option value="Retail">Retail</option>
              </select>
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
                    "In Production",
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
                href="/wholesale-inquiry"
                className={`w-full rounded-xl px-3 py-2 text-center text-sm font-medium ${palette.button}`}
              >
                Place Wholesale Order
              </a>
            </div>
          </div>
        </section>

        {/* Table */}
        <section className="mt-6 overflow-hidden rounded-2xl">
          <div
            className={`min-w-full overflow-x-auto rounded-2xl ${palette.ring} ${palette.card}`}
          >
            <table className="min-w-full text-sm">
              <thead className="text-left opacity-80">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Terms/Tax</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className={`px-4 py-6 ${palette.subfg}`}>
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  pageItems.map((o) => {
                    const total = o.subtotal + (o.freight ?? 0) + (o.tax ?? 0);
                    return (
                      <tr key={o.id} className="border-t border-white/5">
                        <td className="px-4 py-3 font-medium">{o.id}</td>
                        <td className="px-4 py-3">
                          {new Date(o.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">{o.source}</td>
                        <td className="px-4 py-3">{o.items}</td>
                        <td className="px-4 py-3">
                          {o.source === "Wholesale" ? (
                            <span className="opacity-80">{o.terms ?? "—"}</span>
                          ) : (
                            <span className="opacity-80">
                              VAT: {formatMoney(o.tax ?? 0, o.currency)}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {formatMoney(total, o.currency)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block rounded-full px-2 py-1 text-[11px] font-semibold ${statusClass(
                              o.status
                            )}`}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <a
                              href={`/orders/${encodeURIComponent(o.id)}`}
                              className={`rounded-xl border ${palette.border} px-3 py-1.5`}
                            >
                              View
                            </a>
                            {o.source === "Wholesale" && (
                              <a
                                href={`/invoices/${encodeURIComponent(o.id)}`}
                                className={`rounded-xl border ${palette.border} px-3 py-1.5`}
                              >
                                PI/PDF
                              </a>
                            )}
                          </div>
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

        {/* Helpful notes */}
        <section
          className={`mt-6 rounded-2xl ${palette.ring} ${palette.card} p-4 text-sm ${palette.subfg}`}
        >
          <div className="font-medium text-current">Notes</div>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              Wholesale totals include freight (if applicable) and follow
              selected trade terms.
            </li>
            <li>Retail totals include VAT where applicable.</li>
            <li>
              Click &quot;View&quot; for tracking, item breakdown, and invoices.
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}

/*
------------------------------------------------------------
TESTS (snippets; place in tests/ or __tests__/)

// tests/orders-utils.test.ts
// If you extract helpers, test them like below.
// import { statusClass, formatMoney } from "app/orders/page";
// it("maps statuses to class names", () => {
//   expect(statusClass("Delivered")).toMatch(/emerald/);
//   expect(statusClass("Cancelled")).toMatch(/rose/);
// });
// it("formats money", () => {
//   expect(formatMoney(100, "USD")).toMatch(/\$/);
// });
//------------------------------------------------------------
*/
