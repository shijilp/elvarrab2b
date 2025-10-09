"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

type CustomerRow = {
  email: string;
  name: string;
  is_registered: boolean;
  orders: number;
  total_spent: string;
  avg_order_value: string;
  first_order_at: string | null;
  last_order_at: string | null;
  last_30d_orders: number;
  last_90d_orders: number;

  // NEW money metrics
  wallet_balance: string;
  referral_earned_total: string;
  affiliate_pending_total: string;
  affiliate_approved_total: string;
  affiliate_paid_total: string;
};

type Paged<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

const INR = (v: string | number | null | undefined) =>
  `₹${(v ?? 0).toString()}`;

export default function CustomersPageClient() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { user } = useAuth() as any;
  const canView = user?.isAdmin === true;

  const [q, setQ] = useState("");
  const [ordering, setOrdering] = useState("-last_order_at");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paged<CustomerRow> | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const pageSize = 25;

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        page_size: String(pageSize),
        ordering,
      });
      if (q.trim()) params.set("q", q.trim());
      const res = await api.get(
        `admin/customers/summary?${params.toString()}`,
        {
          headers: { Accept: "application/json" },
        }
      );
      setData(res.data as Paged<CustomerRow>);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setErr(e?.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canView) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canView, page, ordering]);

  const rows = data?.results ?? [];

  const exportCsv = () => {
    if (!rows.length) return;
    const header = [
      "Name",
      "Email",
      "Registered",
      "Orders",
      "TotalSpent",
      "AOV",
      "LastOrderAt",
      "Last30d",
      "Last90d",
      "Wallet",
      "Referral",
      "AffPending",
      "AffApproved",
      "AffPaid",
    ];
    const body = rows.map((r) =>
      [
        r.name || "",
        r.email || "",
        r.is_registered ? "Yes" : "Guest",
        r.orders,
        r.total_spent,
        r.avg_order_value,
        r.last_order_at ?? "",
        r.last_30d_orders,
        r.last_90d_orders,
        r.wallet_balance,
        r.referral_earned_total,
        r.affiliate_pending_total,
        r.affiliate_approved_total,
        r.affiliate_paid_total,
      ].join(",")
    );
    const blob = new Blob([[header.join(","), ...body].join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `customers_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
      <nav className=" max-w-7xl px-4 sm:px-6 lg:px-1 py-4  text-xs opacity-80">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/admin" className="hover:opacity-80">
              Dashboard
            </Link>
          </li>
          <li>›</li>

          <li className="opacity-90">{"Customers"} </li>
        </ol>
      </nav>
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
          <button
            onClick={exportCsv}
            className="px-3 py-2 rounded-xl border"
            disabled={!rows.length}
            title="Export current page to CSV"
          >
            Export
          </button>
        </div>
      </div>

      {err && (
        <div className="rounded-xl border p-3 text-sm text-red-600 bg-red-50">
          {err}
        </div>
      )}

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
              {/* NEW money columns */}
              <th>Wallet</th>
              <th>Referral ₹</th>
              <th>Affiliate (P/A/Pd)</th>
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
                <td>{INR(r.total_spent)}</td>
                <td>{INR(r.avg_order_value)}</td>
                <td>
                  {r.last_order_at
                    ? new Date(r.last_order_at).toLocaleString()
                    : "—"}
                </td>
                <td>{r.last_30d_orders}</td>
                <td>{r.last_90d_orders}</td>

                {/* NEW money cells */}
                <td className="font-medium">{INR(r.wallet_balance)}</td>
                <td>{INR(r.referral_earned_total)}</td>
                <td className="text-xs leading-tight">
                  <div>P: {INR(r.affiliate_pending_total)}</div>
                  <div>A: {INR(r.affiliate_approved_total)}</div>
                  <div>Pd: {INR(r.affiliate_paid_total)}</div>
                </td>

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
                <td colSpan={12} className="text-center py-8 text-gray-500">
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
            ? `Showing ${(page - 1) * pageSize + 1}-${Math.min(
                page * pageSize,
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
