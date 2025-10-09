"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Link from "next/link";

// -------------------- Types --------------------
type Warehouse = { id: number; name: string; code: string };
type AllocationMethod = "QTY" | "VAL" | "WGT";
type Line = {
  productInput: string; // user types ID or SKU
  productId: number | ""; // resolved numeric id
  productSku?: string; // resolved sku (display only)
  productName?: string; // resolved name (display only)
  quantity: number | "";
  unit_cost: number | "";
  batch_no: string;
  weight_kg?: number | "";
};
type Charge = {
  label: string;
  amount: number | "";
  allocation_method?: AllocationMethod | "";
};

// -------------------- Theme (Elvarra Luxury Dark) --------------------
const cx = (...cls: (string | boolean | undefined)[]) =>
  cls.filter(Boolean).join(" ");
const card =
  "rounded-2xl border border-neutral-800 bg-neutral-950/70 shadow-lg";
const input =
  "w-full rounded-lg border border-neutral-800 bg-neutral-900/70 px-3 py-2 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40";
const btn =
  "rounded-lg border border-neutral-700 px-3 py-2 hover:bg-neutral-800 active:bg-neutral-700 transition";
const btnGold =
  "rounded-lg px-4 py-2 bg-[#d4af37] text-black font-medium hover:opacity-90 active:opacity-80 transition";
const chip =
  "inline-flex items-center rounded-full border border-neutral-700 bg-neutral-900/60 px-2 py-0.5 text-xs text-neutral-300";

const inputNum =
  input +
  " h-10 leading-none appearance-none [-moz-appearance:textfield] " + // Firefox
  "[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"; // Chrome/Safari

// -------------------- Helpers --------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toNum = (v: any, def = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};
const fmt = (n: number, currency = "INR") =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(n);

// Client-side allocation preview (mirrors backend logic)
function computeAllocation(
  items: Line[],
  charges: Charge[],
  headerMethod: AllocationMethod
): {
  perUnit: number[];
  perItemTotal: number[];
  baseTotal: number;
  chargeTotal: number;
} {
  const rows = items.map((l) => ({
    qty: toNum(l.quantity),
    unit: toNum(l.unit_cost),
    weight: toNum(l.weight_kg || 0),
  }));
  const baseTotal = rows.reduce((s, r) => s + r.qty * r.unit, 0);

  const bases = {
    QTY: rows.map((r) => r.qty),
    VAL: rows.map((r) => r.qty * r.unit),
    WGT: rows.map((r) => r.qty * r.weight),
  };

  const perItemTotal = new Array(rows.length).fill(0);
  const chargeTotal = charges.reduce((s, c) => s + toNum(c.amount), 0);

  charges.forEach((c) => {
    const method = (c.allocation_method || headerMethod) as AllocationMethod;
    const baseArr = bases[method];
    const baseSum = baseArr.reduce((s, x) => s + x, 0);
    const amount = toNum(c.amount);
    if (amount === 0 || rows.length === 0) return;

    if (baseSum <= 0) {
      const share = amount / rows.length;
      for (let i = 0; i < rows.length; i++) perItemTotal[i] += share;
    } else {
      for (let i = 0; i < rows.length; i++)
        perItemTotal[i] += amount * (baseArr[i] / baseSum);
    }
  });

  const perUnit = rows.map((r, i) => (r.qty > 0 ? perItemTotal[i] / r.qty : 0));
  return { perUnit, perItemTotal, baseTotal, chargeTotal };
}

// ---- Product resolvers (ID or SKU) ----
type ProductMini = { id: number; sku?: string; name?: string };

// cache by both keys to avoid extra requests
const productCache = new Map<string, ProductMini>(); // keys like "ID:123" or "SKU:ABC-001"

async function fetchProductById(id: number): Promise<ProductMini | null> {
  // If you don't have a detail endpoint, you can fall back to listing with ?id=
  // Adjust to your real endpoint shape.
  try {
    const res = await api.get(`portfolio/${id}/`);
    const d = res.data;
    if (!d || typeof d.id !== "number") return null;
    return { id: d.id, sku: d.sku, name: d.name };
  } catch {
    return null;
  }
}

async function fetchProductBySku(sku: string): Promise<ProductMini | null> {
  // Your list endpoint already used in your code: portfolio?sku=...
  const res = await api.get(`portfolio?sku=${encodeURIComponent(sku)}`);
  const data = res.data;
  const row = Array.isArray(data) ? data[0] : data?.results?.[0];
  if (!row || typeof row.id !== "number") return null;
  return { id: row.id, sku: row.sku, name: row.name };
}

async function resolveProduct(input: string): Promise<ProductMini> {
  const raw = (input || "").trim();
  if (!raw) throw new Error("Empty product input");

  // numeric → treat as ID
  if (/^\d+$/.test(raw)) {
    const key = `ID:${raw}`;
    const cached = productCache.get(key);
    if (cached) return cached;
    const p = await fetchProductById(parseInt(raw, 10));
    if (!p) throw new Error(`Product ID ${raw} not found`);
    productCache.set(key, p);
    if (p.sku) productCache.set(`SKU:${p.sku.toUpperCase()}`, p);
    return p;
  }

  // otherwise assume SKU
  const skuKey = `SKU:${raw.toUpperCase()}`;
  const cached = productCache.get(skuKey);
  if (cached) return cached;
  const p = await fetchProductBySku(raw);
  if (!p) throw new Error(`SKU "${raw}" not found`);
  productCache.set(skuKey, p);
  productCache.set(`ID:${String(p.id)}`, p);
  return p;
}

// -------------------- Page --------------------
export default function NewReceiptPage() {
  const router = useRouter();

  // form state
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [warehouse, setWarehouse] = useState<number | "">("");
  const [number, setNumber] = useState<string>("");
  const [receivedAt, setReceivedAt] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const [allocationMethod, setAllocationMethod] =
    useState<AllocationMethod>("QTY");
  const [currency, setCurrency] = useState<string>("INR");

  const [lines, setLines] = useState<Line[]>([
    {
      productInput: "",
      productId: "",
      productSku: "",
      productName: "",
      quantity: "",
      unit_cost: "",
      batch_no: "",
    },
  ]);
  const [charges, setCharges] = useState<Charge[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  // load warehouses (user membership scoped by API)
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("warehouses?mine=1");
        setWarehouses(res.data as Warehouse[]);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        setErr(e?.response?.data?.detail || "Failed to load warehouses");
      }
    })();
  }, []);

  // dynamic lines / charges handlers
  const addLine = () =>
    setLines((prev) => [
      ...prev,
      {
        productInput: "",
        productId: "",
        productSku: "",
        productName: "",
        quantity: "",
        unit_cost: "",
        batch_no: "",
      },
    ]);
  const removeLine = (idx: number) =>
    setLines((prev) => prev.filter((_, i) => i !== idx));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateLine = (idx: number, key: keyof Line, value: any) =>
    setLines((prev) =>
      prev.map((l, i) => (i === idx ? { ...l, [key]: value } : l))
    );

  const addCharge = () =>
    setCharges((prev) => [...prev, { label: "", amount: "" }]);
  const removeCharge = (idx: number) =>
    setCharges((prev) => prev.filter((_, i) => i !== idx));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateCharge = (idx: number, key: keyof Charge, value: any) =>
    setCharges((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, [key]: value } : c))
    );

  // preview allocation & landed
  const preview = useMemo(
    () => computeAllocation(lines, charges, allocationMethod),
    [lines, charges, allocationMethod]
  );
  const landedPerUnit = preview.perUnit;
  const baseTotal = preview.baseTotal;
  const chargeTotal = preview.chargeTotal;
  const landedTotal = baseTotal + chargeTotal;

  // Inline resolver for individual line (on blur)
  const resolveSingle = async (index: number) => {
    const line = lines[index];
    if (!line.productInput) return;
    try {
      const p = await resolveProduct(line.productInput);
      setLines((prev) =>
        prev.map((l, i) =>
          i === index
            ? {
                ...l,
                productId: p.id,
                productSku: p.sku || "",
                productName: p.name || "",
              }
            : l
        )
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setLines((prev) =>
        prev.map((l, i) =>
          i === index
            ? { ...l, productId: "", productSku: "", productName: "" }
            : l
        )
      );
      setErr(e?.message || "Failed to resolve product");
      setTimeout(() => setErr(null), 2500);
    }
  };

  // submit
  const submit = async () => {
    setErr(null);
    setOk(null);
    if (!warehouse || !number) {
      setErr("Warehouse and Receipt Number are required.");
      return;
    }

    // Resolve any unresolved lines first
    try {
      const resolved = await Promise.all(
        lines.map(async (l) => {
          if (l.productId) return l;
          const p = await resolveProduct(l.productInput);
          return {
            ...l,
            productId: p.id,
            productSku: p.sku || "",
            productName: p.name || "",
          };
        })
      );
      setLines(resolved);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setErr(
        e?.message || "One or more products could not be resolved (ID/SKU)."
      );
      return;
    }

    const items = lines
      .filter((l) => l.productId && l.quantity && l.unit_cost && l.batch_no)
      .map((l) => ({
        product: Number(l.productId), // numeric id only (API expects this)
        quantity: Number(l.quantity),
        unit_cost: Number(l.unit_cost), // base cost; backend computes landed
        batch_no: String(l.batch_no),
      }));

    if (items.length === 0) {
      setErr("Add at least one valid line.");
      return;
    }

    const payload = {
      warehouse,
      number,
      received_at: receivedAt || null,
      notes,
      allocation_method: allocationMethod,
      currency,
      items,
      charges: charges
        .filter((c) => c.label && c.amount !== "" && Number(c.amount) !== 0)
        .map((c) => ({
          label: c.label,
          amount: Number(c.amount),
          allocation_method: c.allocation_method
            ? c.allocation_method
            : undefined,
        })),
    };

    setLoading(true);
    try {
      await api.post("inventory/receipts/", payload);
      setOk("Receipt created.");
      setTimeout(() => router.push("/admin/inventory/receipts"), 650);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setErr(
        e?.response?.data?.detail ||
          JSON.stringify(e?.response?.data) ||
          "Failed to create receipt"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6 text-neutral-200">
      <nav className=" max-w-7xl px-4 sm:px-6 lg:px-1 py-2  text-xs opacity-80">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/admin" className="hover:opacity-80">
              Dashboard
            </Link>
          </li>
          <li>›</li>
          <li>
            <Link href="/admin/inventory" className="hover:opacity-80">
              Inventory
            </Link>
          </li>
          <li>›</li>
          <li className="opacity-90">{"Receipts"} </li>
        </ol>
      </nav>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          <span className="text-[#d4af37]">Elvarra</span> · New Inventory
          Receipt
        </h1>
        <div className={chip}>Landed Cost Mode</div>
      </div>

      {/* Alerts */}
      {err && (
        <div className={cx(card, "p-3 border-red-700/60 text-red-300")}>
          {err}
        </div>
      )}
      {ok && (
        <div className={cx(card, "p-3 border-emerald-700/60 text-emerald-300")}>
          {ok}
        </div>
      )}

      {/* Receipt meta */}
      <div className={cx(card, "p-4 grid grid-cols-1 md:grid-cols-2 gap-4")}>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-neutral-400">Warehouse</span>
          <select
            className={input}
            value={warehouse}
            onChange={(e) => setWarehouse(Number(e.target.value))}
          >
            <option value="">Select warehouse…</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.code} — {w.name}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-neutral-400">Receipt Number</span>
            <input
              className={input}
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="RCPT-2025-0001"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-neutral-400">Received At</span>
            <DatePicker
              selected={receivedAt ? new Date(receivedAt) : null}
              onChange={(date: Date | null) =>
                setReceivedAt(date ? date.toISOString() : "")
              }
              showTimeSelect
              dateFormat="yyyy-MM-dd HH:mm"
              className={cx(input, "h-10 leading-none")}
              placeholderText="Select date & time"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4 md:col-span-2">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-neutral-400">Allocation Method</span>
            <select
              className={input}
              value={allocationMethod}
              onChange={(e) =>
                setAllocationMethod(e.target.value as AllocationMethod)
              }
            >
              <option value="QTY">By Quantity</option>
              <option value="VAL">By Base Value</option>
              <option value="WGT">By Weight</option>
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-neutral-400">Currency</span>
            <input
              className={input}
              value={currency}
              onChange={(e) => setCurrency(e.target.value.toUpperCase())}
              placeholder="INR"
              maxLength={8}
            />
          </label>
        </div>

        <label className="flex flex-col gap-1 md:col-span-2">
          <span className="text-sm text-neutral-400">Notes (optional)</span>
          <textarea
            className={input}
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>
      </div>

      {/* Charges */}
      <div className={cx(card, "p-4 space-y-3")}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Charges</h2>
          <button onClick={addCharge} className={btn}>
            + Add charge
          </button>
        </div>
        {charges.length === 0 && (
          <div className="text-sm text-neutral-400">
            No charges added. You can add freight, duty, insurance, etc.
          </div>
        )}
        <div className="space-y-2">
          {charges.map((c, i) => (
            <div key={i} className="grid grid-cols-12 gap-2">
              <input
                className={cx(input, "col-span-4")}
                placeholder="Label (e.g., Freight)"
                value={c.label}
                onChange={(e) => updateCharge(i, "label", e.target.value)}
              />
              <input
                className={cx(input, "col-span-3")}
                placeholder="Amount"
                type="number"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                value={c.amount as any}
                onChange={(e) => updateCharge(i, "amount", e.target.value)}
              />
              <select
                className={cx(input, "col-span-3")}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                value={(c.allocation_method || "") as any}
                onChange={(e) =>
                  updateCharge(
                    i,
                    "allocation_method",
                    (e.target.value || "") as AllocationMethod | ""
                  )
                }
              >
                <option value="">Use header method</option>
                <option value="QTY">By Quantity</option>
                <option value="VAL">By Base Value</option>
                <option value="WGT">By Weight</option>
              </select>
              <button
                onClick={() => removeCharge(i)}
                className={cx(btn, "col-span-2")}
              >
                ✕ Remove
              </button>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-neutral-800 text-sm text-neutral-300 flex flex-wrap gap-6">
          <div>
            Base Total:{" "}
            <span className="font-medium text-neutral-100">
              {fmt(baseTotal, currency)}
            </span>
          </div>
          <div>
            Charge Total:{" "}
            <span className="font-medium text-neutral-100">
              {fmt(chargeTotal, currency)}
            </span>
          </div>
          <div className="text-[#d4af37]">
            Landed Total:{" "}
            <span className="font-semibold">{fmt(landedTotal, currency)}</span>
          </div>
        </div>
      </div>

      {/* Lines */}
      <div className={cx(card, "p-4 space-y-3")}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Lines</h2>
          <button onClick={addLine} className={btn}>
            + Add line
          </button>
        </div>

        <div className="hidden md:grid grid-cols-12 gap-2 text-xs text-neutral-400 px-1">
          <div className="col-span-3">Product ID or SKU</div>
          <div className="col-span-2">Qty</div>
          <div className="col-span-2">Unit Cost</div>
          <div className="col-span-3">Batch No</div>
          <div className="col-span-1">Landed /u</div>
          <div className="col-span-1"></div>
        </div>

        <div className="space-y-2">
          {lines.map((l, i) => (
            <div key={i} className="grid grid-cols-12 gap-2">
              <div className="col-span-12 md:col-span-3">
                <input
                  className={input}
                  placeholder="Type ID or SKU"
                  value={l.productInput}
                  onChange={(e) =>
                    updateLine(i, "productInput", e.target.value)
                  }
                  onBlur={() => resolveSingle(i)}
                />
                <div className="mt-1 text-xs text-neutral-400 min-h-4">
                  {l.productId ? (
                    <span>
                      Resolved →{" "}
                      <span className="text-neutral-200 font-medium">
                        #{l.productId}
                      </span>
                      {l.productSku ? <span> · {l.productSku}</span> : null}
                      {l.productName ? <span> · {l.productName}</span> : null}
                    </span>
                  ) : null}
                </div>
              </div>

              <input
                className={cx(inputNum, "col-span-6 md:col-span-2")}
                placeholder="Qty"
                type="number"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                value={l.quantity as any}
                onChange={(e) => updateLine(i, "quantity", e.target.value)}
              />
              <input
                className={cx(inputNum, "col-span-6 md:col-span-2")}
                placeholder="Unit Cost"
                type="number"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                value={l.unit_cost as any}
                onChange={(e) => updateLine(i, "unit_cost", e.target.value)}
              />
              <input
                className={cx(inputNum, "col-span-8 md:col-span-3")}
                placeholder="Batch No"
                value={l.batch_no}
                onChange={(e) => updateLine(i, "batch_no", e.target.value)}
              />
              <div className="col-span-3 md:col-span-1 flex items-center">
                <span className="text-sm">
                  {fmt(toNum(l.unit_cost) + (landedPerUnit[i] || 0), currency)}
                </span>
              </div>
              <button
                onClick={() => removeLine(i)}
                className={cx(btn, "col-span-1")}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          disabled={loading}
          onClick={submit}
          className={cx(btnGold, loading && "opacity-60 pointer-events-none")}
        >
          {loading ? "Saving…" : "Save Receipt"}
        </button>
        <button onClick={() => router.back()} className={btn}>
          Cancel
        </button>
      </div>

      <div className="pt-2 text-xs text-neutral-500">
        Landed cost preview is estimated client-side; final landed unit cost is
        computed on the server and saved to batches & ledger.
      </div>
    </div>
  );
}
