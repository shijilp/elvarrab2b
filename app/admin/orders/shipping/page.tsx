"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import { OrderLite } from "@/types";

// --- types ---
type ScanResult = {
  id: number;
  code?: string; // if your PATCH returns code, we show it
  total_amount?: number | string;
  status: string;
  shipped_at?: string | null;
  full_name: string;
  city: string;
  payment_status: string;
};

type RangeKey = "today" | "yesterday" | "this_week" | "this_month" | "all";

// --- utils ---
function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}
function startOfWeek(d: Date) {
  // Sat-start week (KSA). Change if needed.
  const x = new Date(d);
  const day = x.getDay(); // 0 Sun … 6 Sat
  const offset = (day + 1) % 7; // Sat -> 0
  x.setDate(x.getDate() - offset);
  return startOfDay(x);
}
function startOfMonth(d: Date) {
  return startOfDay(new Date(d.getFullYear(), d.getMonth(), 1));
}
const toISO = (d: Date) => d.toISOString();

function fmtDate(dt?: string | null) {
  if (!dt) return "—";
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return dt;
  }
}
function fmtMoney(v?: number | string) {
  if (v === undefined || v === null || v === "") return "—";
  const n = typeof v === "string" ? Number(v) : v;
  if (Number.isFinite(n)) {
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "INR", // change if you use another currency
        maximumFractionDigits: 2,
      }).format(n as number);
    } catch {
      return `INR ${Number(n).toFixed(2)}`;
    }
  }
  return String(v);
}

export default function ScanOrders() {
  const inputRef = useRef<HTMLInputElement>(null);

  // scanning
  const [buffer, setBuffer] = useState("");
  const [last, setLast] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // shipped listing
  const [range, setRange] = useState<RangeKey>("today");
  const [listLoading, setListLoading] = useState(false);
  const [orders, setOrders] = useState<OrderLite[]>([]);
  const [count, setCount] = useState<number>(0);

  // focus hidden input for scanner “typing”
  useEffect(() => {
    inputRef.current?.focus();
    const onWindowClick = () => inputRef.current?.focus();
    window.addEventListener("click", onWindowClick);
    return () => window.removeEventListener("click", onWindowClick);
  }, []);

  // keep a controller to cancel in-flight fetch when range changes
  const listAbortRef = useRef<AbortController | null>(null);

  // focus hidden input for scanner “typing”
  useEffect(() => {
    inputRef.current?.focus();
    const onWindowClick = () => inputRef.current?.focus();
    window.addEventListener("click", onWindowClick);
    return () => window.removeEventListener("click", onWindowClick);
  }, []);

  // capture Enter → submit
  // const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  //   if (e.key === "Enter") {
  //     const code = buffer.trim();
  //     if (code) submitCode(code);
  //     setBuffer("");
  //     e.preventDefault();
  //   }
  // };

  // compute selected window
  const { gteISO, lteISO } = useMemo(() => {
    const now = new Date();
    if (range === "all") return { gteISO: undefined, lteISO: undefined };

    if (range === "today") {
      return { gteISO: toISO(startOfDay(now)), lteISO: toISO(endOfDay(now)) };
    }
    if (range === "yesterday") {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      return { gteISO: toISO(startOfDay(y)), lteISO: toISO(endOfDay(y)) };
    }
    if (range === "this_week") {
      const s = startOfWeek(now);
      return { gteISO: toISO(s), lteISO: toISO(endOfDay(now)) };
    }
    const s = startOfMonth(now);
    return { gteISO: toISO(s), lteISO: toISO(endOfDay(now)) };
  }, [range]);

  // ---- NEW: fetch function you can call with background=true to avoid spinner
  const fetchShipped = useCallback(
    async (background = false) => {
      // cancel any previous request
      listAbortRef.current?.abort();
      const controller = new AbortController();
      listAbortRef.current = controller;

      if (!background) setListLoading(true);
      try {
        const params: Record<string, string> = { status: "shipped" };
        if (gteISO) params["shipped_after"] = gteISO;
        if (lteISO) params["shipped_before"] = lteISO;

        // TIP: standardize your env var, e.g. NEXT_PUBLIC_API_BASE_URL
        const base =
          process.env.NEXT_PUBLIC_API_BASE_URL ||
          process.env.NEXT_PUBLIC_API_BASE ||
          "";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = await api.get<any>(`${base}admin/orders/`, {
          params,
          withCredentials: true,
          signal: controller.signal,
        });

        const data: OrderLite[] = Array.isArray(res.data)
          ? res.data
          : res.data?.results ?? [];

        data.sort((a, b) => {
          const ad = a.shipped_at ? new Date(a.shipped_at).getTime() : 0;
          const bd = b.shipped_at ? new Date(b.shipped_at).getTime() : 0;
          if (bd !== ad) return bd - ad;
          return (b.id ?? 0) - (a.id ?? 0);
        });

        setOrders((prev) => {
          // Reconcile: replace any optimistic row with server version by id
          const byId = new Map<number, OrderLite>(data.map((x) => [x.id, x]));
          const merged = prev.map((p) => byId.get(p.id) || p);
          // Also include any server rows that weren’t in prev (e.g., other users shipped)
          const prevIds = new Set(merged.map((m) => m.id));
          const extras = data.filter((x) => !prevIds.has(x.id));
          const next = [...extras, ...merged];

          next.sort((a, b) => {
            const ad = a.shipped_at ? new Date(a.shipped_at).getTime() : 0;
            const bd = b.shipped_at ? new Date(b.shipped_at).getTime() : 0;
            if (bd !== ad) return bd - ad;
            return (b.id ?? 0) - (a.id ?? 0);
          });
          return next;
        });

        setCount(
          Array.isArray(res.data) ? data.length : res.data?.count ?? data.length
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        if (e?.name === "CanceledError" || e?.code === "ERR_CANCELED") {
          // ignore aborted fetch
        } else {
          setOrders([]);
          setCount(0);
        }
      } finally {
        if (!background) setListLoading(false);
      }
    },
    [gteISO, lteISO]
  );

  // initial + when window changes
  useEffect(() => {
    fetchShipped(false);
    return () => listAbortRef.current?.abort();
  }, [fetchShipped]);

  // ---- NEW: refresh every 20s & when tab becomes visible
  useEffect(() => {
    const id = setInterval(() => {
      fetchShipped(true);
    }, 20000);
    const onVis = () => {
      if (document.visibilityState === "visible") fetchShipped(true);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [fetchShipped]);

  // capture Enter → submit
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const code = buffer.trim();
      if (code) submitCode(code);
      setBuffer("");
      e.preventDefault();
    }
  };

  // submit scan → mark shipped (backend should stamp shipped_at)
  const submitCode = async (code: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post(
        `${process.env.NEXT_PUBLIC_API_BASE}admin/orders/${code}/set_status/`,
        { id: code, status: "shipped" },
        { withCredentials: true }
      );
      setLast(res.data);
      if (res.data.alert) {
        setError(res.data.detail);
        beepError();
      }
      beepSuccess();

      // Optimistic row if it belongs to the current window
      const optimistic: OrderLite = {
        id: res.data.id,
        code: res.data.code ?? String(code),
        total_amount: res.data.total_amount,
        full_name: res.data.full_name,
        payment_status: res.data.payment_status,
        city: res.data.city,
        status: "shipped",
        shipped_at: new Date().toISOString(),
      };

      const nowISO = optimistic.shipped_at!;
      const inWindow =
        (!gteISO || nowISO >= gteISO) && (!lteISO || nowISO <= lteISO);

      setOrders((prev) => {
        const next = inWindow
          ? [optimistic, ...prev.filter((o) => o.id !== optimistic.id)]
          : prev;
        // maintain sort
        next.sort((a, b) => {
          const ad = a.shipped_at ? new Date(a.shipped_at).getTime() : 0;
          const bd = b.shipped_at ? new Date(b.shipped_at).getTime() : 0;
          if (bd !== ad) return bd - ad;
          return (b.id ?? 0) - (a.id ?? 0);
        });
        return next;
      });
      if (inWindow) {
        setCount((c) => {
          const already = orders.some((o) => o.id === optimistic.id);
          return already ? c : c + 1;
        });
      }

      void fetchShipped(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail || "Scan failed. Check code or network.";
      setError(msg);
      beepError();
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const beepSuccess = () => {
    try {
      const ctx = new (window.AudioContext ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.frequency.value = 880;
      o.type = "sine";
      o.start();
      setTimeout(() => {
        o.stop();
        ctx.close();
      }, 120);
    } catch {}
  };
  const beepError = () => {
    try {
      const ctx = new (window.AudioContext ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.frequency.value = 220;
      o.type = "sawtooth";
      o.start();
      setTimeout(() => {
        o.stop();
        ctx.close();
      }, 220);
    } catch {}
  };

  return (
    <div className="mx-auto max-w-6xl py-8">
      <nav className=" max-w-7xl px-4 sm:px-6 lg:px-1 py-4  text-xs opacity-80">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/admin" className="hover:opacity-80">
              Dashboard
            </Link>
          </li>
          <li>›</li>

          <li className="opacity-90">{"Shipping"} </li>
        </ol>
      </nav>
      <h1 className="text-2xl font-bold mb-2">Shipping Control </h1>
      <p className="text-sm opacity-80 mb-6">
        Scan the <b>order barcode</b>. Status advances automatically (→{" "}
        <span className="rounded px-2 py-0.5 bg-neutral-900 text-white">
          shipped
        </span>
        ).
      </p>

      {/* Hidden input for scanners */}
      <input
        ref={inputRef}
        value={buffer}
        onChange={(e) => setBuffer(e.target.value)}
        onKeyDown={handleKeyDown}
        className="absolute -left-[1000px] w-1 h-1 opacity-0"
        aria-hidden
      />

      {/* Manual input */}
      <div className="flex gap-2 mb-4">
        <input
          placeholder="Type or scan order code (e.g. PK2025-000123)"
          className="flex-1 rounded-xl border border-neutral-200 bg-white/90 px-3 py-2 text-sm text-black dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
          value={buffer}
          onChange={(e) => setBuffer(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleKeyDown(e)}
        />
        <button
          disabled={!buffer || loading}
          onClick={() => submitCode(buffer.trim())}
          className="rounded-xl px-4 py-2 text-sm font-medium btn-gradient-accent text-blue-900 disabled:opacity-50"
        >
          {loading ? "Updating…" : "Update"}
        </button>
      </div>

      {/* Last scan + error */}
      {last && (
        <div className="rounded-xl p-4 bg-white/90 text-black border mb-4 dark:bg-neutral-900 dark:text-white dark:border-neutral-800">
          <div className="text-sm opacity-70">Last scan</div>
          <div className="flex justify-between items-center">
            <div className="text-lg font-semibold">
              {last.code ?? `#${last.id}`}
            </div>
            <div className="rounded-lg px-3 py-1 text-sm bg-blue-600 text-white">
              {last.status}
            </div>
          </div>
        </div>
      )}
      {error && (
        <div className="rounded-xl p-3 bg-red-600 text-white text-sm mb-4">
          {error}
        </div>
      )}

      {/* FILTERS + SUMMARY */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-3">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["today", "Today"],
              ["yesterday", "Yesterday"],
              ["this_week", "This week"],
              ["this_month", "This month"],
              ["all", "All"],
            ] as [RangeKey, string][]
          ).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setRange(k)}
              className={[
                "rounded-xl px-3 py-1.5 text-sm ring-1",
                range === k
                  ? "bg-neutral-900 text-white ring-neutral-900 dark:bg-white dark:text-neutral-900 dark:ring-white"
                  : "bg-white/90 text-black ring-neutral-200 hover:bg-neutral-100 dark:bg-neutral-900 dark:text-white dark:ring-neutral-800 dark:hover:bg-neutral-800",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="rounded-xl px-3 py-2 text-sm ring-1 ring-neutral-200 bg-white/90 dark:bg-neutral-900 dark:ring-neutral-800">
          <span className="opacity-70 mr-2">Shipped</span>
          <span className="font-semibold">{count}</span>
          {range !== "all" && (
            <span className="opacity-60 ml-2">
              ({gteISO ? new Date(gteISO).toLocaleDateString() : ""} →{" "}
              {lteISO ? new Date(lteISO).toLocaleDateString() : ""})
            </span>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="rounded-2xl ring-1 ring-neutral-200 dark:ring-neutral-800 bg-white/90 dark:bg-neutral-900/70 overflow-x-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <div className="text-sm opacity-70">Shipped orders</div>
          {listLoading && <div className="text-xs opacity-60">Loading…</div>}
        </div>

        {orders.length === 0 ? (
          <div className="px-4 py-8 text-sm opacity-60">
            No shipped orders in this range.
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b border-neutral-200 dark:border-neutral-800">
                <th className="px-4 py-2 font-medium">Order</th>
                <th className="px-4 py-2 font-medium">Customer</th>
                <th className="px-4 py-2 font-medium">City</th>
                <th className="px-4 py-2 font-medium">Total</th>
                <th className="px-4 py-2 font-medium">Payment</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Shipped at</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o, row) => (
                <tr
                  key={row}
                  className="border-b border-neutral-100 last:border-0 dark:border-neutral-800"
                >
                  <td className="px-4 py-2">
                    <span className="font-medium">{o.code ?? `#${o.id}`}</span>
                  </td>
                  <td className="px-4 py-2">{o.full_name}</td>
                  <td className="px-4 py-2">{o.city}</td>
                  <td className="px-4 py-2">{fmtMoney(o.total_amount)}</td>
                  <td className="px-4 py-2">
                    <span className="rounded px-2 py-0.5 bg-neutral-900 text-white text-xs dark:bg-green-600 dark:text-neutral-900">
                      {o.payment_status?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span className="rounded px-2 py-0.5 text-white text-xs  btn-gradient-accent dark:text-neutral-900">
                      {o.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-2">{fmtDate(o.shipped_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
