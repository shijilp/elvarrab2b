"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import Link from "next/link";

type Buyer = {
  email: string;
  name: string;
  is_registered: boolean;
  orders: number;
  total_spent: string;
};

type Dashboard = {
  period: {
    week: { start: string; end: string };
    month: { start: string; end: string };
  };
  kpis: {
    total_customers_lifetime: number;
    new_customers_week: number;
    new_customers_month: number;
    repeat_customers_lifetime: number;
    repeat_customers_week: number;
    repeat_customers_month: number;
    active_customers_30d: number;
    active_customers_90d: number;
  };
  top_buyers_week: Buyer[];
  top_buyers_month: Buyer[];
  distributions: {
    orders_count: { "1": number; "2": number; "3_plus": number };
  };
};

const INR = (v: string | number | null | undefined) =>
  `₹${(v ?? 0).toString()}`;

export default function CustomersDashboardClient() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { user } = useAuth() as any;
  const canView = user?.isAdmin === true;

  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await api.get("admin/customers/dashboard");
      setData(res.data as Dashboard);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setErr(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canView) load();
  }, [canView]);

  if (!canView) return <div className="p-6">Not authorized.</div>;
  if (loading || !data)
    return <div className="p-6">{loading ? "Loading…" : "No data"}</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;

  const { kpis, top_buyers_week, top_buyers_month, period, distributions } =
    data;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold">Customer Insights</h1>
        <div className="text-sm text-gray-500">
          Week: {new Date(period.week.start).toLocaleDateString()} →{" "}
          {new Date(period.week.end).toLocaleDateString()} · Month:{" "}
          {new Date(period.month.start).toLocaleDateString()} →{" "}
          {new Date(period.month.end).toLocaleDateString()}
        </div>
        <div className="ml-auto">
          <Link href="/admin/customers" className="underline">
            Customers List
          </Link>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <KPI title="New Customers (Week)" value={kpis.new_customers_week} />
        <KPI title="New Customers (Month)" value={kpis.new_customers_month} />
        <KPI title="Repeat (Week)" value={kpis.repeat_customers_week} />
        <KPI title="Repeat (Month)" value={kpis.repeat_customers_month} />
        <KPI title="Active Customers (30d)" value={kpis.active_customers_30d} />
        <KPI title="Active Customers (90d)" value={kpis.active_customers_90d} />
        <KPI title="Repeat (Lifetime)" value={kpis.repeat_customers_lifetime} />
        <KPI
          title="Total Customers (Lifetime)"
          value={kpis.total_customers_lifetime}
        />
      </div>

      {/* Orders count distribution */}
      <div className="rounded-2xl el-ringn  p-4">
        <div className="font-medium mb-2">
          Order Count Distribution (lifetime)
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="p-3 rounded-xl  el-bgn">
            1 Order: <b>{distributions.orders_count["1"]}</b>
          </div>
          <div className="p-3 rounded-xl el-bordern el-bgn">
            2 Orders: <b>{distributions.orders_count["2"]}</b>
          </div>
          <div className="p-3 rounded-xl  el-bordern el-bgn">
            3+ Orders: <b>{distributions.orders_count["3_plus"]}</b>
          </div>
        </div>
      </div>

      {/* Top buyers week/month */}
      <TwoColTables
        leftTitle="Top Buyers — This Week"
        rightTitle="Top Buyers — This Month"
        leftRows={top_buyers_week}
        rightRows={top_buyers_month}
      />
    </div>
  );
}

function KPI({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="p-4 rounded-2xl  el-cardn el-ringn">
      <div className="text-sm el-subfgn">{title}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}

function BuyersTable({ title, rows }: { title: string; rows: Buyer[] }) {
  return (
    <div className="rounded-2xl el-cardn  el-ringn overflow-x-auto">
      <div className="p-3 font-medium">{title}</div>
      <table className="w-full text-sm">
        <thead className="el-bgn">
          <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
            <th>Customer</th>
            <th>Registered</th>
            <th>Orders</th>
            <th>Total Spent</th>
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
          {rows.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center py-8 text-gray-500">
                No data.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function TwoColTables({
  leftTitle,
  rightTitle,
  leftRows,
  rightRows,
}: {
  leftTitle: string;
  rightTitle: string;
  leftRows: Buyer[];
  rightRows: Buyer[];
}) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <BuyersTable title={leftTitle} rows={leftRows} />
      <BuyersTable title={rightTitle} rows={rightRows} />
    </div>
  );
}
