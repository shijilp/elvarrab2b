"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api"; // Axios instance you already use
import { useAuth } from "@/context/AuthContext"; // Has user & is_superuser per your setup
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Order, Product } from "@/types";
import { OrdersTable } from "@/components/admin/OrderTable";
import { ProductsTable } from "@/components/admin/ProductsTable";
import { Spinner } from "@/components/admin/Spinner";
import { Topbar } from "@/components/admin/TopBar";
import { Sidebar } from "@/components/admin/AdminSidebar";

export type AdminStats = {
  revenue_today: number;
  revenue_month: number;
  orders_new: number;
  shipped_today: number;
  orders_processing: number;
  orders_packed: number;
  conversion_rate: number; // 0..1
  charts: {
    revenue7: { date: string; amount: number }[];
    orders7: { date: string; count: number }[];
  };
};

// ---------- Helpers ----------
function money(n: number, currency = "USD") {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(n ?? 0);
  } catch {
    return `$${Number(n ?? 0).toFixed(2)}`;
  }
}

function clsx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

// ---------- Reusable UI ----------
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

function StatCard({
  title,
  value,
  sub,
}: {
  title: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white/90 p-5 dark:border-neutral-800 dark:bg-neutral-900/70">
      <div className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        {title}
      </div>
      <div className="mt-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
        {value}
      </div>
      {sub ? (
        <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          {sub}
        </div>
      ) : null}
    </div>
  );
}

function SectionTitle({
  children,
  cta,
}: {
  children: React.ReactNode;
  cta?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h3 className="text-lg font-semibold">{children}</h3>
      {cta}
    </div>
  );
}

// ---------- Data hooks ----------
function useAdminStats() {
  const [data, setData] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get("/admin/stats");
        if (!ignore) setData(res.data);
      } catch (e) {
        console.error(e);
        // Fallback demo data
        if (!ignore)
          setData({
            revenue_today: 820,
            revenue_month: 18250,
            orders_new: 7,
            conversion_rate: 0.026,
            shipped_today: 5,
            orders_processing: 12,
            orders_packed: 8,
            charts: {
              revenue7: Array.from({ length: 7 }).map((_, i) => ({
                date: new Date(Date.now() - (6 - i) * 864e5)
                  .toISOString()
                  .slice(5, 10),
                amount: 800 + i * 120,
              })),
              orders7: Array.from({ length: 7 }).map((_, i) => ({
                date: new Date(Date.now() - (6 - i) * 864e5)
                  .toISOString()
                  .slice(5, 10),
                count: 6 + (i % 3),
              })),
            },
          });
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  return { data, loading } as const;
}

function useOrders(statusFilter: string, q: string) {
  const [data, setData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get("/admin/orders/", {
          params: { status: statusFilter || undefined, q: q || undefined },
        });
        let results = res.data.results as Order[];
        results = results.filter(
          (o) =>
            !["shipped", "delivered", "cancelled"].includes(
              o.status.toLowerCase()
            )
        );

        if (!ignore) setData(results);
      } catch (e) {
        console.error(e);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [statusFilter, q]);

  return { data: data ?? [], loading } as const;
}

function useProducts(q: string) {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get("/admin/products", {
          params: { q: q || undefined },
        });
        if (!ignore) setData(res.data.results as Product[]);
      } catch (e) {
        console.error(e);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [q]);

  return { data, loading } as const;
}

// ---------- Charts ----------
function RevenueChart({ data }: { data: { date: string; amount: number }[] }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white/90 p-3 dark:border-neutral-800 dark:bg-neutral-900/70 min-w-0">
      <SectionTitle>Revenue (7 days)</SectionTitle>
      <div className="h-56 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
          >
            <defs>
              <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.55} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeOpacity={0.1} vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#f59e0b"
              fill="url(#rev)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function OrdersChart({ data }: { data: { date: string; count: number }[] }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white/90 p-3 dark:border-neutral-800 dark:bg-neutral-900/70">
      <SectionTitle>Orders (7 days)</SectionTitle>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
          >
            <CartesianGrid strokeOpacity={0.1} vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="count"
              stroke="#60a5fa"
              fill="#60a5fa"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ---------- Main Page ----------
export default function AdminDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  // Simple guard
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (user && (user as any).is_superuser === false) {
      router.replace("/");
    }
  }, [user, router]);

  const { data: stats, loading: statsLoading } = useAdminStats();

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQ, setSearchQ] = useState("");
  const { data: orders, loading: ordersLoading } = useOrders(
    statusFilter,
    searchQ
  );
  const { data: products, loading: productsLoading } = useProducts("");

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);

  const currency = "INR";

  function onSelect(id: number, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

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
      // const res = await api.get("/admin/orders", {
      //   params: { status: statusFilter || undefined, q: searchQ || undefined },
      // });

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
      const url = `/pp/orders/bulk/packing-slip?ids=${encodeURIComponent(
        ids.join(",")
      )}`; // implement this route to render slips -> window.print()
      window.open(url, "_blank");
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  }

  const topCTA = (
    <div className="flex gap-2">
      <Link
        href="/admin/products/new"
        className="rounded-xl bg-neutral-900 px-3 py-1.5 text-xs text-white dark:bg-amber-500 dark:text-neutral-900"
      >
        + Add Product
      </Link>
      <Link
        href="/admin/orders"
        className="rounded-xl px-3 py-1.5 text-xs ring-1 ring-neutral-200 dark:ring-neutral-800"
      >
        Manage Orders
      </Link>
    </div>
  );

  const conversion = stats?.conversion_rate ?? 0;

  return (
    <div className="flex min-h-[100svh] bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 overflow-x-hidden">
      {/* Sidebar */}

      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      {/* Main */}
      <main className="flex-1 min-w-0 mx-auto w-full max-w-[1400px] px-4">
        <Topbar onSearch={(q) => setSearchQ(q)} />

        {/* KPIs */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Revenue (Today)"
            value={
              statsLoading ? "—" : money(stats?.revenue_today ?? 0, currency)
            }
            sub="vs. yesterday"
          />
          <StatCard
            title="Revenue (Month)"
            value={
              statsLoading ? "—" : money(stats?.revenue_month ?? 0, currency)
            }
            sub="month to date"
          />
          <StatCard
            title="New Orders"
            value={statsLoading ? "—" : String(stats?.orders_new ?? 0)}
            sub="awaiting processing"
          />
          <StatCard
            title="Conversion Rate"
            value={statsLoading ? "—" : `${(conversion * 100).toFixed(2)}%`}
            sub="storewide"
          />
        </div>

        {/* Charts */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <RevenueChart data={stats?.charts.revenue7 ?? []} />
          <OrdersChart data={stats?.charts.orders7 ?? []} />
        </div>

        {/* Recent Orders */}
        <div className="mt-6">
          <SectionTitle cta={topCTA}>Orders</SectionTitle>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <label className="text-sm opacity-80">Filter:</label>
            {[
              ["", "All"],
              ["new", "New"],
              ["processing", "Processing"],
              ["packed", "Packed"],
              ["shipped", "Shipped"],
              ["delivered", "Delivered"],
              ["cancelled", "Cancelled"],
            ].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setStatusFilter(val)}
                className={clsx(
                  "rounded-full px-3 py-1 text-xs ring-1",
                  statusFilter === val
                    ? "bg-neutral-900 text-white ring-neutral-900 dark:bg-amber-500 dark:text-neutral-900 dark:ring-amber-500"
                    : "ring-neutral-200 dark:ring-neutral-800"
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
            <OrdersTable
              rows={orders}
              onSelect={onSelect}
              selected={selected}
              onBulk={onBulk}
              onPrint={onPrint}
              show={ordersLoading}
              admins={[]}
              onBulkAssign={() => void {}}
            />
          </div>
        </div>
        {/* Products */}
        <div className="mt-6">
          <SectionTitle
            cta={
              <Link
                href="/admin/products"
                className="rounded-xl px-3 py-1.5 text-xs ring-1 ring-neutral-200 dark:ring-neutral-800"
              >
                See all
              </Link>
            }
          >
            Low Stock / Recent Products
          </SectionTitle>
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
            <ProductsTable rows={products} show={productsLoading} />
          </div>
        </div>

        <footer className="my-8 text-center text-xs opacity-60">
          © {new Date().getFullYear()} Elvarra — Admin
        </footer>
      </main>

      {/* Global Busy Overlay (for bulk actions / printing) */}
      {/* <LoadingOverlay show={busy} label={busy ? "Working..." : "Loading..."} /> */}
    </div>
  );
}
//|| ordersLoading || productsLoading
