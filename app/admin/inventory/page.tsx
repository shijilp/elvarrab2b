"use client";

import React, { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Warehouse = { id: number; name: string; code: string };

type Totals = {
  on_hand: number;
  reserved: number;
  available: number;
  stock_value: number;
};

type VelocityRow = {
  product__id: number;
  product__sku: string;
  product__name: string;
  warehouse__code: string;
  qty: number; // positive (we flip from negative server-side)
};

type AgingRow = {
  product_id: number;
  sku: string;
  product_name: string;
  warehouse: string;
  batch_no: string;
  qty_available: number;
  unit_cost: string;
  received_at: string;
  age_days: number;
};

const cx = (...cls: (string | false | null | undefined)[]) =>
  cls.filter(Boolean).join(" ");
const card = "rounded-2xl border border-neutral-800 bg-neutral-950/70 shadow";
const input =
  "w-full rounded-lg border border-neutral-800 bg-neutral-900/70 px-3 py-2 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40";
const btn =
  "rounded-lg border border-neutral-700 px-3 py-2 hover:bg-neutral-800 active:bg-neutral-700 transition";
const pill =
  "px-2 py-0.5 rounded-full text-xs border border-neutral-700 bg-neutral-900/70 text-neutral-300";

const fmtMoney = (n: number, currency = "INR") =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n || 0);

export default function InventoryDashboard() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [warehouse, setWarehouse] = useState<string>(""); // keep code or id; backend accepts both
  const [period, setPeriod] = useState<number>(30);

  const [totals, setTotals] = useState<Totals | null>(null);
  const [velocity, setVelocity] = useState<VelocityRow[]>([]);
  const [aging, setAging] = useState<AgingRow[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [low, setLow] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Load warehouses
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("warehouses?mine=1");
        setWarehouses(res.data as Warehouse[]);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        setErr(e?.response?.data?.detail || "Failed to load warehouses.");
      }
    })();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setErr(null);
    try {
      const whParam = warehouse
        ? `&warehouse=${encodeURIComponent(warehouse)}`
        : "";
      const [tot, vel, ag, lowres] = await Promise.all([
        api.get(`stock-balances/totals?${whParam.slice(1)}`),
        api.get(`inventory/reports/velocity?days=${period}${whParam}`),
        api.get(`inventory/reports/aging?min_days=60${whParam}`),
        api.get(`stock-balances/low_stock?threshold=1${whParam}`),
      ]);
      setTotals(tot.data as Totals);
      setVelocity(vel.data as VelocityRow[]);
      setAging(ag.data as AgingRow[]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setLow(lowres.data as any[]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setErr(e?.response?.data?.detail || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // auto-load once warehouses are known
    if (warehouses.length >= 0) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warehouse, period, warehouses.length]);

  const topVelChart = useMemo(
    () =>
      velocity.map((v) => ({
        name: v.product__sku || v.product__name?.slice(0, 10) || "SKU",
        qty: v.qty,
      })),
    [velocity]
  );

  return (
    <div className="mx-auto max-w-7xl p-6 space-y-6 text-neutral-200">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          <span className="text-[#d4af37]">Elvarra</span> · Inventory Dashboard
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-400">Period</span>
          <select
            className={input}
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
          >
            <option value={7}>7d</option>
            <option value={30}>30d</option>
            <option value={60}>60d</option>
            <option value={90}>90d</option>
          </select>
          <span className="text-sm text-neutral-400">Warehouse</span>
          <select
            className={input}
            value={warehouse}
            onChange={(e) => setWarehouse(e.target.value)}
          >
            <option value="">All</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.code}>
                {w.code} — {w.name}
              </option>
            ))}
          </select>
          <button onClick={loadData} className={btn}>
            Refresh
          </button>
        </div>
      </div>

      {/* Errors */}
      {err && (
        <div className={cx(card, "p-3 border border-red-700/60 text-red-300")}>
          {err}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={cx(card, "p-4")}>
          <div className="text-neutral-400 text-sm">On Hand</div>
          <div className="text-2xl font-semibold">{totals?.on_hand ?? "—"}</div>
        </div>
        <div className={cx(card, "p-4")}>
          <div className="text-neutral-400 text-sm">Reserved</div>
          <div className="text-2xl font-semibold">
            {totals?.reserved ?? "—"}
          </div>
        </div>
        <div className={cx(card, "p-4")}>
          <div className="text-neutral-400 text-sm">Available</div>
          <div className="text-2xl font-semibold text-[#d4af37]">
            {totals?.available ?? "—"}
          </div>
        </div>
        <div className={cx(card, "p-4")}>
          <div className="text-neutral-400 text-sm">Stock Value</div>
          <div className="text-2xl font-semibold">
            {fmtMoney(Number(totals?.stock_value || 0))}
          </div>
        </div>
      </div>

      {/* Charts & tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Fast movers */}
        <div className={cx(card, "p-4 lg:col-span-2")}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Top Movers (Shipments)</h2>
            <span className={pill}>{period} days</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topVelChart}>
                <XAxis dataKey="name" hide />
                <YAxis />
                <Tooltip />
                <Bar dataKey="qty" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {velocity.length === 0 && (
            <div className="text-sm text-neutral-400 pt-2">
              No shipments in this period.
            </div>
          )}
        </div>

        {/* Low stock */}
        <div className={cx(card, "p-4")}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Low Stock</h2>
            <span className={pill}>≤ 1</span>
          </div>
          <div className="mt-2 space-y-2">
            {low.slice(0, 10).map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-sm"
              >
                <div className="truncate">
                  {r.product__sku || r.product__name}
                </div>
                <div className="text-neutral-400">{r.warehouse__code}</div>
                <div className="font-semibold">{r.available}</div>
              </div>
            ))}
            {low.length === 0 && (
              <div className="text-sm text-neutral-400">All good.</div>
            )}
          </div>
        </div>
      </div>

      {/* Aging batches */}
      <div className={cx(card, "p-4")}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Aging Batches (≥ 60 days)</h2>
          <span className={pill}>Aging</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-neutral-400">
              <tr className="text-left">
                <th className="py-2 pr-4">SKU / Product</th>
                <th className="py-2 pr-4">WH</th>
                <th className="py-2 pr-4">Batch</th>
                <th className="py-2 pr-4">Qty</th>
                <th className="py-2 pr-4">Unit Cost</th>
                <th className="py-2 pr-4">Received</th>
                <th className="py-2 pr-0">Age (d)</th>
              </tr>
            </thead>
            <tbody>
              {aging.slice(0, 20).map((a, i) => (
                <tr key={i} className="border-t border-neutral-800">
                  <td className="py-2 pr-4">
                    <div className="font-medium">{a.sku}</div>
                    <div className="text-neutral-400">{a.product_name}</div>
                  </td>
                  <td className="py-2 pr-4">{a.warehouse}</td>
                  <td className="py-2 pr-4">{a.batch_no}</td>
                  <td className="py-2 pr-4">{a.qty_available}</td>
                  <td className="py-2 pr-4">{fmtMoney(Number(a.unit_cost))}</td>
                  <td className="py-2 pr-4">
                    {new Date(a.received_at).toLocaleDateString()}
                  </td>
                  <td className="py-2 pr-0">{a.age_days}</td>
                </tr>
              ))}
              {aging.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-3 text-neutral-400">
                    No aging stock.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent receipts */}
      <div className={cx(card, "p-4")}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Recent Receipts</h2>
          <span className={pill}>Latest 50</span>
        </div>
        <RecentReceipts warehouse={warehouse} />
      </div>
    </div>
  );
}

function RecentReceipts({ warehouse }: { warehouse: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const whParam = warehouse
        ? `?warehouse=${encodeURIComponent(warehouse)}`
        : "";
      const res = await api.get(`inventory/receipts/${whParam}`);
      setRows(res.data.results || []);
    })();
  }, [warehouse]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-neutral-400">
          <tr className="text-left">
            <th className="py-2 pr-4">Number</th>
            <th className="py-2 pr-4">Warehouse</th>
            <th className="py-2 pr-4">Received</th>
            <th className="py-2 pr-4">Lines</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-neutral-800">
              <td className="py-2 pr-4">{r.number}</td>
              <td className="py-2 pr-4">{r.warehouse?.code || ""}</td>
              <td className="py-2 pr-4">
                {r.received_at ? new Date(r.received_at).toLocaleString() : "-"}
              </td>
              <td className="py-2 pr-4">{(r.items || []).length}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={4} className="py-3 text-neutral-400">
                No receipts found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
