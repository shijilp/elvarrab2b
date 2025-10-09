"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ProductMini, resolveProduct } from "../_shared/productResolver";
import Link from "next/link";

type Warehouse = { id: number; code: string; name: string };

type Line = {
  productInput: string;
  product?: ProductMini;
  batch_no?: string;
  quantity: number | "";
};

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");
const card =
  "rounded-2xl border border-neutral-800 bg-neutral-950/70 shadow-lg";
const baseInput =
  "w-full rounded-lg border border-neutral-800 bg-neutral-900/70 px-3 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40";
const input = baseInput + " h-10 leading-none";
const inputNum =
  input +
  " appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";
const btn =
  "rounded-lg border border-neutral-700 px-3 py-2 hover:bg-neutral-800 active:bg-neutral-700 transition";
const btnGold =
  "rounded-lg px-4 py-2 bg-[#d4af37] text-black font-medium hover:opacity-90 active:opacity-80 transition";

export default function NewTransferPage() {
  const router = useRouter();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [source, setSource] = useState<number | "">("");
  const [target, setTarget] = useState<number | "">("");
  const [reference, setReference] = useState<string>("");
  const [lines, setLines] = useState<Line[]>([
    { productInput: "", batch_no: "", quantity: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("warehouses?mine=1");
        setWarehouses(res.data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        setErr(e?.response?.data?.detail || "Failed to load warehouses");
      }
    })();
  }, []);

  const addLine = () =>
    setLines((p) => [...p, { productInput: "", batch_no: "", quantity: "" }]);
  const removeLine = (i: number) =>
    setLines((p) => p.filter((_, idx) => idx !== i));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const update = (i: number, key: keyof Line, v: any) =>
    setLines((p) => p.map((l, idx) => (idx === i ? { ...l, [key]: v } : l)));

  const resolveOne = async (i: number) => {
    const l = lines[i];
    if (!l.productInput) return;
    try {
      const p = await resolveProduct(l.productInput);
      update(i, "product", p);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      update(i, "product", undefined);
      setErr(e?.message || "Failed to resolve product");
      setTimeout(() => setErr(null), 2500);
    }
  };

  const submit = async () => {
    setErr(null);
    setOk(null);
    if (!source || !target)
      return setErr("Select source and target warehouses.");
    if (source === target)
      return setErr("Source and target cannot be the same.");

    const prepared = [];
    for (const l of lines) {
      if (!l.product && l.productInput) {
        try {
          const p = await resolveProduct(l.productInput);
          l.product = p;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
          setErr(e?.message || "Could not resolve a product");
          return;
        }
      }
      if (!l.product || !l.quantity) continue;
      prepared.push({
        product: l.product.id,
        quantity: Number(l.quantity),
        batch_no: l.batch_no || undefined,
      });
    }
    if (prepared.length === 0) return setErr("Add at least one valid line.");

    const payload = {
      source_warehouse: source,
      target_warehouse: target,
      reference: reference || null,
      lines: prepared,
    };

    setLoading(true);
    try {
      await api.post("inventory/transfers/", payload);
      setOk("Transfer posted.");
      setTimeout(() => router.push("/admin/inventory/dashboard"), 800);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setErr(
        e?.response?.data?.detail ||
          JSON.stringify(e?.response?.data) ||
          "Failed to post transfer"
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
          <li className="opacity-90">{"Transfer"} </li>
        </ol>
      </nav>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          <span className="text-[#d4af37]">Elvarra</span> · New Transfer
        </h1>
      </div>

      {err && (
        <div className={cx(card, "p-3 border border-red-700/60 text-red-300")}>
          {err}
        </div>
      )}
      {ok && (
        <div
          className={cx(
            card,
            "p-3 border border-emerald-700/60 text-emerald-300"
          )}
        >
          {ok}
        </div>
      )}

      <div className={cx(card, "p-4 grid grid-cols-1 md:grid-cols-3 gap-4")}>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-neutral-400">Source Warehouse</span>
          <select
            className={input}
            value={source}
            onChange={(e) => setSource(Number(e.target.value))}
          >
            <option value="">Select source…</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.code} — {w.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-neutral-400">Target Warehouse</span>
          <select
            className={input}
            value={target}
            onChange={(e) => setTarget(Number(e.target.value))}
          >
            <option value="">Select target…</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.code} — {w.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-neutral-400">Reference (optional)</span>
          <input
            className={input}
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="TX-2025-0003"
          />
        </label>
      </div>

      <div className={cx(card, "p-4 space-y-3")}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Lines</h2>
          <button onClick={addLine} className={btn}>
            + Add line
          </button>
        </div>

        <div className="hidden md:grid grid-cols-12 gap-2 text-xs text-neutral-400 px-1">
          <div className="col-span-4">Product (ID or SKU)</div>
          <div className="col-span-3">Batch (optional)</div>
          <div className="col-span-3">Quantity</div>
          <div className="col-span-2"></div>
        </div>

        <div className="space-y-2">
          {lines.map((l, i) => (
            <div key={i} className="grid grid-cols-12 gap-2">
              <div className="col-span-12 md:col-span-4">
                <input
                  className={input}
                  placeholder="Type ID or SKU"
                  value={l.productInput}
                  onChange={(e) => update(i, "productInput", e.target.value)}
                  onBlur={() => resolveOne(i)}
                />
                <div className="mt-1 text-xs text-neutral-400 min-h-4">
                  {l.product ? (
                    <>
                      Resolved →{" "}
                      <span className="text-neutral-200 font-medium">
                        #{l.product.id}
                      </span>
                      {l.product.sku && <> · {l.product.sku}</>}
                      {l.product.name && <> · {l.product.name}</>}
                    </>
                  ) : null}
                </div>
              </div>

              <input
                className={cx(input, "col-span-6 md:col-span-3")}
                placeholder="Batch No (optional)"
                value={l.batch_no || ""}
                onChange={(e) => update(i, "batch_no", e.target.value)}
              />

              <input
                className={cx(inputNum, "col-span-6 md:col-span-3")}
                placeholder="Qty"
                type="number"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                value={l.quantity as any}
                onChange={(e) => update(i, "quantity", e.target.value)}
              />

              <button
                onClick={() => removeLine(i)}
                className={cx(btn, " col-span-2")}
              >
                ✕ Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          disabled={loading}
          onClick={submit}
          className={cx(btnGold, loading && "opacity-60 pointer-events-none")}
        >
          {loading ? "Posting…" : "Post Transfer"}
        </button>
        <button onClick={() => router.back()} className={btn}>
          Cancel
        </button>
      </div>
    </div>
  );
}
