"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext"; // you already have this in your app
import Link from "next/link";
import { api } from "@/lib/api";

type CustomerRow = {
  email: string;
  name: string;
  is_registered: boolean;
  orders: number;
  total_spent: string;
  avg_order_value: string;
  first_order_at: string;
  last_order_at: string;
  last_30d_orders: number;
  last_90d_orders: number;
};

type Paged<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export default function CustomersPageClient() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { user } = useAuth() as any;
  const [q, setQ] = useState("");
  const [ordering, setOrdering] = useState("-last_order_at");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paged<CustomerRow> | null>(null);
  const [loading, setLoading] = useState(false);
  const pageSize = 25;

  const canView = user?.isAdmin === true; // adapt if you use a different flag

  const load = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
      ordering,
    });
    if (q.trim()) params.set("q", q.trim());
    const res = await api.get(`admin/customers/summary?${params.toString()}`, {
      headers: { Accept: "application/json" },
    });
    const json = await res.data;
    setData(json);
    setLoading(false);
  };

  useEffect(() => {
    if (canView) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canView, page, ordering]);

  const rows = data?.results ?? [];

  if (!canView) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Customers</h1>
        <p className="mt-2">You don’t have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-semibold">Customers</h1>
        <div className="ml-auto flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search email or name…"
            className="px-3 py-2 rounded-xl border outline-none"
          />
          <button
            onClick={() => {
              setPage(1);
              load();
            }}
            className="px-3 py-2 rounded-xl border"
            disabled={loading}
          >
            {loading ? "Searching…" : "Search"}
          </button>
          <select
            value={ordering}
            onChange={(e) => {
              setOrdering(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl border"
          >
            <option value="-last_order_at">Newest activity</option>
            <option value="last_order_at">Oldest activity</option>
            <option value="-total_spent">Highest LTV</option>
            <option value="total_spent">Lowest LTV</option>
            <option value="-orders">Most orders</option>
            <option value="orders">Fewest orders</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
              <th>Customer</th>
              <th>Registered</th>
              <th>Orders</th>
              <th>Total Spent</th>
              <th>Avg Order</th>
              <th>Last Order</th>
              <th>30d</th>
              <th>90d</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="[&>tr>td]:px-3 [&>tr>td]:py-2">
            {rows.map((r) => (
              <tr key={r.email || Math.random()} className="border-t">
                <td>
                  <div className="font-medium">
                    {r.name || (r.email ? r.email.split("@")[0] : "Guest")}
                  </div>
                  <div className="text-xs text-gray-500">
                    {r.email || "guest@unknown"}
                  </div>
                </td>
                <td>{r.is_registered ? "Yes" : "Guest"}</td>
                <td>{r.orders}</td>
                <td>₹{r.total_spent}</td>
                <td>₹{r.avg_order_value}</td>
                <td>{new Date(r.last_order_at).toLocaleString()}</td>
                <td>{r.last_30d_orders}</td>
                <td>{r.last_90d_orders}</td>
                <td>
                  {r.email ? (
                    <Link
                      href={`/admin/customers/${encodeURIComponent(r.email)}`}
                      className="text-blue-600 underline"
                    >
                      View
                    </Link>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-8 text-gray-500">
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {data
            ? `Showing ${(page - 1) * 25 + 1}-${Math.min(
                page * 25,
                data.count
              )} of ${data.count}`
            : "—"}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!data?.previous}
            className="px-3 py-2 border rounded-xl disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!data?.next}
            className="px-3 py-2 border rounded-xl disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
