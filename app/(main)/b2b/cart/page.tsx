"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useMemo, useState } from "react";

// ------------------------------------------------------------
// Elvarra / Elvara — WHOLESALE CART PAGE (Quote / PO Builder)
// Theme unchanged; B2B features: MOQ steps, tier pricing, trade terms, totals
// Save as: app/cart/page.tsx
// ------------------------------------------------------------

// Theme palette utilities (local copy for standalone)
export type ThemeMode = "dark" | "light";
export type Palette = {
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
// Types & helpers
// ---------------------------
export type Tier = { min: number; unit: number };
export type CartItem = {
  slug: string;
  title: string;
  sku: string;
  image: string;
  moq: number;
  tiers: Tier[]; // sorted ascending by min
  qty: number; // must be >= moq and step by moq for this demo
  leadTime: string;
};

function unitForQty(tiers: Tier[], qty: number): number {
  // choose the highest tier whose min <= qty
  let best = tiers[0]?.unit ?? 0;
  for (const t of tiers) {
    if (qty >= t.min) best = t.unit;
  }
  return best;
}

function formatMoney(n: number) {
  return `$${n.toFixed(2)}`;
}

// ---------------------------
// Mock data (replace from store / API)
// ---------------------------
const INITIAL_ITEMS: CartItem[] = [
  {
    slug: "aurelia-pendant",
    title: "Aurelia Pendant",
    sku: "ELV-AUR-PND-18G",
    image:
      "https://images.unsplash.com/photo-1603561596112-0e8e1f43d0a6?q=80&w=1200&auto=format&fit=crop",
    moq: 25,
    tiers: [
      { min: 25, unit: 48 },
      { min: 100, unit: 42 },
      { min: 300, unit: 39 },
    ],
    qty: 50,
    leadTime: "7–12 days (in‑stock)",
  },
  {
    slug: "luna-drop-earrings",
    title: "Luna Drop Earrings",
    sku: "ELV-LUN-DRP-GLD",
    image:
      "https://images.unsplash.com/photo-1631049035182-249067d76152?q=80&w=1200&auto=format&fit=crop",
    moq: 25,
    tiers: [
      { min: 25, unit: 24 },
      { min: 100, unit: 21 },
      { min: 300, unit: 19 },
    ],
    qty: 25,
    leadTime: "7–12 days (in‑stock)",
  },
];

// ---------------------------
// Default export: Cart Page
// ---------------------------
export default function CartPage() {
  const theme: ThemeMode = "dark"; // match your site mode
  const palette = useMemo(() => paletteForTheme(theme), [theme]);

  const [items, setItems] = useState<CartItem[]>(INITIAL_ITEMS);
  const [terms, setTerms] = useState("DAP"); // EXW / FOB / DAP / DDP
  const [note, setNote] = useState("");

  const subtotal = useMemo(() => {
    return items.reduce((sum, it) => {
      const unit = unitForQty(it.tiers, it.qty);
      return sum + unit * it.qty;
    }, 0);
  }, [items]);

  // Simple freight estimate placeholder (replace with API)
  const freight = useMemo(() => {
    switch (terms) {
      case "EXW":
        return 0;
      case "FOB":
        return 120;
      case "DAP":
        return 280;
      case "DDP":
        return 360;
      default:
        return 0;
    }
  }, [terms]);

  const total = subtotal + freight;

  function updateQty(idx: number, next: number) {
    setItems((prev) => {
      const clone = [...prev];
      const it = clone[idx];
      // enforce MOQ and stepping by MOQ for demo
      const step = it.moq;
      const min = it.moq;
      const normalized = Math.max(min, Math.round(next / step) * step);
      clone[idx] = { ...it, qty: normalized };
      return clone;
    });
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  return (
    <main className={`${palette.bg} ${palette.fg} min-h-screen antialiased`}>
      <div className="container py-8">
        <h1 className="text-2xl font-semibold">Quote / Purchase Order</h1>
        <p className={`mt-1 text-sm ${palette.subfg}`}>
          MOQ steps, tiered pricing applied automatically by quantity.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          {/* Items */}
          <section
            className={`rounded-2xl ${palette.ring} ${palette.card} p-4`}
          >
            {items.length === 0 ? (
              <div className={`text-sm ${palette.subfg}`}>
                Your list is empty.{" "}
                <Link href="/products" className="underline">
                  Browse products
                </Link>
                .
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((it, idx) => {
                  const unit = unitForQty(it.tiers, it.qty);
                  const line = unit * it.qty;
                  return (
                    <div
                      key={it.sku}
                      className={`grid grid-cols-12 gap-3 rounded-xl ${palette.ring} ${palette.card} p-3`}
                    >
                      <div className="col-span-12 md:col-span-2">
                        <Image
                          width={64}
                          height={64}
                          src={it.image}
                          alt={it.title}
                          className="aspect-square w-full rounded-lg object-cover"
                        />
                      </div>
                      <div className="col-span-12 md:col-span-10">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <div className="text-sm font-medium">
                              {it.title}
                            </div>
                            <div className={`text-xs ${palette.subfg}`}>
                              SKU: {it.sku}
                            </div>
                            <div className={`mt-1 text-xs ${palette.subfg}`}>
                              MOQ {it.moq} • Lead time {it.leadTime}
                            </div>
                          </div>
                          <button
                            onClick={() => removeItem(idx)}
                            className={`rounded-xl border ${palette.border} px-3 py-1.5 text-xs`}
                          >
                            Remove
                          </button>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                          <div>
                            <label className="mb-1 block text-xs opacity-80">
                              Quantity
                            </label>
                            <input
                              type="number"
                              value={it.qty}
                              min={it.moq}
                              step={it.moq}
                              onChange={(e) =>
                                updateQty(idx, Number(e.target.value) || it.moq)
                              }
                              className={`w-full rounded-xl border ${palette.border} bg-transparent px-3 py-2 text-sm outline-none`}
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs opacity-80">
                              Unit (applied)
                            </label>
                            <div className="rounded-xl border border-dashed px-3 py-2 text-sm">
                              {formatMoney(unit)}
                            </div>
                          </div>
                          <div>
                            <label className="mb-1 block text-xs opacity-80">
                              Line total
                            </label>
                            <div className="rounded-xl border border-dashed px-3 py-2 text-sm">
                              {formatMoney(line)}
                            </div>
                          </div>
                          <div>
                            <label className="mb-1 block text-xs opacity-80">
                              Tier
                            </label>
                            <div
                              className={`rounded-xl ${palette.ring} ${palette.card} px-3 py-2 text-xs`}
                            >
                              {it.tiers
                                .map((t) => `${t.min}+@$${t.unit}`)
                                .join(" · ")}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Summary */}
          <aside className="space-y-4">
            <div className={`rounded-2xl ${palette.ring} ${palette.card} p-4`}>
              <h2 className="text-lg font-semibold">Summary</h2>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="opacity-80">Subtotal</span>
                  <span>{formatMoney(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="opacity-80">
                    Estimated freight ({terms})
                  </span>
                  <span>{formatMoney(freight)}</span>
                </div>
                <div className="flex items-center justify-between border-t pt-2">
                  <span className="font-medium">Total</span>
                  <span className="font-semibold">{formatMoney(total)}</span>
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-1 block text-xs uppercase tracking-wider opacity-80">
                  Trade terms
                </label>
                <select
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className={`w-full rounded-xl border ${palette.border} bg-transparent px-3 py-2 text-sm outline-none`}
                >
                  <option value="EXW">EXW</option>
                  <option value="FOB">FOB</option>
                  <option value="DAP">DAP</option>
                  <option value="DDP">DDP</option>
                </select>
              </div>

              <div className="mt-3">
                <label className="mb-1 block text-xs uppercase tracking-wider opacity-80">
                  Order note
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className={`w-full rounded-xl border ${palette.border} bg-transparent px-3 py-2 text-sm outline-none`}
                  placeholder="Packaging, barcode labels, deadline, etc."
                />
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2">
                <a
                  href={`/wholesale-inquiry?items=${encodeURIComponent(
                    JSON.stringify(
                      items.map((i) => ({ sku: i.sku, qty: i.qty }))
                    )
                  )}&terms=${terms}`}
                  className={`rounded-xl px-4 py-3 text-center text-sm font-medium ${palette.button}`}
                >
                  Request Final Quote
                </a>
                <button
                  className={`rounded-xl border ${palette.border} px-4 py-3 text-sm`}
                >
                  Generate Draft PO (PDF)
                </button>
              </div>
            </div>

            <div
              className={`rounded-2xl ${palette.ring} ${palette.card} p-4 text-sm ${palette.subfg}`}
            >
              <div className="font-medium text-current">Notes</div>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>MOQ enforced per SKU; quantities step by MOQ.</li>
                <li>Tier unit price auto-applies based on quantity.</li>
                <li>
                  Lead times shown are indicative; final dates confirmed on PI.
                </li>
              </ul>
            </div>
          </aside>
        </div>

        {/* Continue shopping */}
        <div className="mt-6 text-sm">
          <Link href="/products" className="underline">
            Continue shopping
          </Link>
        </div>
      </div>
    </main>
  );
}

/*
------------------------------------------------------------
TESTS (snippets; place in tests/ or __tests__/)

// tests/unit-price.test.ts
import { describe, it, expect } from "vitest"; // or jest
import { } from "app/cart/page"; // helpers are local; if you export them, test below

// Example (if exported):
// import { unitForQty } from "app/cart/page";
// describe("unitForQty", () => {
//   const tiers = [{ min: 25, unit: 48 }, { min: 100, unit: 42 }, { min: 300, unit: 39 }];
//   it("applies first tier at MOQ", () => { expect(unitForQty(tiers, 25)).toBe(48); });
//   it("applies mid tier for 150", () => { expect(unitForQty(tiers, 150)).toBe(42); });
//   it("applies top tier for 600", () => { expect(unitForQty(tiers, 600)).toBe(39); });
// });
------------------------------------------------------------
*/
