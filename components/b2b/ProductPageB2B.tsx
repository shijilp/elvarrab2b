"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";

// ------------------------------------------------------------
// Elvara / Elvarra — Product Detail Page (Wholesale‑first content)
// Theme, layout, and styles remain the same. Content + CTAs are updated
// for B2B/wholesale (MOQ, tiered pricing, lead times, trade request).
// ------------------------------------------------------------
// Save as: app/product/[slug]/page.tsx
// ------------------------------------------------------------

// ---------------------------
// Theme palette utilities
// ---------------------------
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

export function paletteForTheme(theme: ThemeMode): Palette {
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
// Pricing helpers (pure)
// ---------------------------
export type Tier = { min: number; price: number };

export function computeSavings(compareAt: number, price: number): number {
  const diff = Math.max(0, compareAt - price);
  return Math.round(diff * 100) / 100;
}

export function priceForQty(qty: number, tiers: Tier[]): number {
  const sorted = [...tiers].sort((a, b) => a.min - b.min);
  let active = sorted[0]?.price ?? 0;
  for (const t of sorted) if (qty >= t.min) active = t.price;
  return active;
}

// ---------------------------
// Star rating (accessible)
// ---------------------------
function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className={`h-4 w-4 ${
        filled ? "fill-current" : "fill-transparent stroke-current"
      }`}
    >
      <path d="M10 1.6l2.35 4.76 5.25.76-3.8 3.7.9 5.22L10 13.95 5.3 16.04l.9-5.22-3.8-3.7 5.25-.76L10 1.6z" />
    </svg>
  );
}

export function StarRating({
  value = 4.8,
  count = 214,
}: {
  value?: number;
  count?: number;
}) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  const stars = Array.from({ length: 5 }).map((_, i) => {
    const filled = i < full || (i === full && half);
    return <StarIcon key={i} filled={filled} />;
  });
  return (
    <div
      className="flex items-center gap-2 text-xs"
      aria-label={`Rating ${value.toFixed(1)} out of 5`}
    >
      <div className="flex items-center text-yellow-500">{stars}</div>
      <span className="opacity-80">
        {value.toFixed(1)} ({count})
      </span>
    </div>
  );
}

// -----------------------------------
// Default export: Product Detail Page
// -----------------------------------
export default function ProductPage() {
  // Switch this to "light" to preview the Elvara vibe locally
  const theme: ThemeMode = "dark";
  const palette = paletteForTheme(theme);

  const product = {
    title: "Aurelia Pendant — Wholesale",
    // MSRP for reference; wholesale tiers below
    msrp: 109,
    badge: "Wholesale Catalog",
    description:
      "B2B‑ready pendant with 18k gold plating and lab‑grown stone. Built for consistent quality and scale: stable plating specs, batch QA, and retail packaging options.",
    images: [
      "https://images.unsplash.com/photo-1603561596112-0e8e1f43d0a6?q=80&w=1400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1612392061783-45e1df9f0d4e?q=80&w=1400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=1400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1603575449153-8dd4f0a2f0f8?q=80&w=1400&auto=format&fit=crop",
    ],
    options: {
      metal: ["18k Gold", "Silver Rhodium", "Rose Gold"],
      length: ['16"', '18"', '20"'],
    },
    highlights: [
      "MOQ 25 units",
      "Tiered pricing",
      "2‑year warranty",
      "Nickel‑free / Hypoallergenic",
      "Private label & barcode ready",
    ],
    tiers: [
      { min: 25, price: 48 },
      { min: 100, price: 42 },
      { min: 300, price: 39 },
      { min: 1000, price: 35 },
    ] as Tier[],
    leadTime: "7–12 business days for in‑stock; 18–25 days for made‑to‑order",
    logistics: "Ships from KSA & India. DDP/DAP available. HS Code on request.",
    compliance: ["REACH compliant", "Nickel release tested", "RoHS"],
  } as const;

  const saveVsMsrpAtMinTier = computeSavings(
    product.msrp,
    product.tiers[0].price
  );

  return (
    <main className={`${palette.bg} ${palette.fg} min-h-screen antialiased`}>
      {/* Breadcrumbs */}
      <nav
        className="mx-auto max-w-7xl px-4 pt-6 text-xs sm:px-6"
        aria-label="Breadcrumb"
      >
        <ol className="flex flex-wrap gap-2 opacity-80">
          <li>
            <Link href="/" className="underline hover:opacity-100">
              Home
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/products" className="underline hover:opacity-100">
              Necklaces (Wholesale)
            </Link>
          </li>
          <li>/</li>
          <li aria-current="page" className="opacity-100">
            {product.title}
          </li>
        </ol>
      </nav>

      {/* Gallery + Info */}
      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:py-12">
        {/* Image gallery */}
        <div>
          <div
            className={`overflow-hidden rounded-3xl ${palette.ring} ${palette.card} p-2`}
          >
            <Image
              width={64}
              height={64}
              src={product.images[0]}
              alt={product.title}
              className="aspect-square w-full rounded-2xl object-cover transition-transform duration-300 hover:scale-[1.02]"
            />
          </div>
          <div className="mt-3 grid grid-cols-4 gap-3">
            {product.images.slice(1).map((src, i) => (
              <div
                key={i}
                className={`overflow-hidden rounded-2xl ${palette.ring}`}
              >
                <Image
                  width={64}
                  height={64}
                  src={src}
                  alt={`thumb-${i}`}
                  className="aspect-square w-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Sticky info panel */}
        <div className="lg:sticky lg:top-8">
          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${palette.chip}`}
            >
              {product.badge}
            </span>
            <StarRating value={4.8} count={214} />
          </div>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
            {product.title}
          </h1>

          {/* Wholesale summary */}
          <div
            className={`mt-3 grid grid-cols-2 gap-3 text-xs ${palette.subfg}`}
          >
            <div className={`rounded-xl ${palette.ring} ${palette.card} p-3`}>
              MOQ: <span className="font-medium text-current">25 units</span>
            </div>
            <div className={`rounded-xl ${palette.ring} ${palette.card} p-3`}>
              Save vs MSRP:{" "}
              <span className="font-medium text-current">
                ${saveVsMsrpAtMinTier}/unit
              </span>
            </div>
            <div className={`rounded-xl ${palette.ring} ${palette.card} p-3`}>
              Lead time:{" "}
              <span className="font-medium text-current">
                {product.leadTime}
              </span>
            </div>
            <div className={`rounded-xl ${palette.ring} ${palette.card} p-3`}>
              Logistics:{" "}
              <span className="font-medium text-current">
                {product.logistics}
              </span>
            </div>
          </div>

          <p className={`mt-4 ${palette.subfg}`}>{product.description}</p>

          {/* Options */}
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider opacity-80">
                Metal
              </label>
              <div className="grid grid-cols-3 gap-2">
                {product.options.metal.map((opt) => (
                  <button
                    key={opt}
                    className={`rounded-xl border ${palette.border} px-3 py-2 text-sm hover:bg-white/5`}
                    aria-label={`Choose ${opt}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider opacity-80">
                Length
              </label>
              <div className="grid grid-cols-3 gap-2">
                {product.options.length.map((opt) => (
                  <button
                    key={opt}
                    className={`rounded-xl border ${palette.border} px-3 py-2 text-sm hover:bg-white/5`}
                    aria-label={`Choose length ${opt}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tiered Pricing Table */}
          <div className="mt-6">
            <h3 className="text-sm font-medium">
              Tiered wholesale pricing (per unit)
            </h3>
            <div className="mt-2 grid grid-cols-4 gap-2 text-sm">
              {product.tiers.map((t) => (
                <div
                  key={t.min}
                  className={`rounded-xl ${palette.ring} ${palette.card} p-3 text-center`}
                >
                  <div className="text-xs opacity-80">{t.min}+ units</div>
                  <div className="text-base font-semibold">${t.price}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Purchase / Inquiry Row */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <input
              type="number"
              defaultValue={25}
              min={25}
              className={`w-28 rounded-xl border ${palette.border} bg-transparent px-3 py-3 text-sm outline-none`}
              aria-label="Order quantity (MOQ 25)"
            />
            <Link
              href="/wholesale-inquiry"
              className={`flex-1 rounded-xl px-5 py-3 text-sm font-medium ${palette.button} text-center`}
            >
              Request Wholesale Quote
            </Link>
            <button
              className={`rounded-xl border ${palette.border} px-4 py-3 text-sm`}
            >
              Download Spec Sheet
            </button>
          </div>

          {/* Compliance & badges */}
          <div
            className={`mt-4 grid grid-cols-3 gap-3 text-xs ${palette.subfg}`}
          >
            {product.compliance.map((c) => (
              <div
                key={c}
                className={`rounded-xl ${palette.ring} ${palette.card} p-3 text-center`}
              >
                {c}
              </div>
            ))}
          </div>

          {/* Details accordions */}
          <div className="mt-6 space-y-3">
            {[
              {
                q: "Materials & Specs",
                a: "Brass base, 18k gold plating (0.3–0.5μm), lab‑grown stone. Individual polybag + insert card; retail box optional.",
              },
              {
                q: "Packaging Options",
                a: "Standard OPP bag, velvet pouch, or branded rigid box. Barcode & price labels available.",
              },
              {
                q: "Shipping Terms",
                a: "FOB, CIF, DAP available. Consolidation support for multi‑SKU POs.",
              },
              {
                q: "After‑Sales",
                a: "2‑year limited warranty. Batch replacement for manufacturing defects.",
              },
            ].map((item, i) => (
              <details
                key={i}
                className={`group rounded-2xl ${palette.ring} ${palette.card} p-4`}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium">
                  <span>{item.q}</span>
                  <span className="ml-4 transition group-open:rotate-45 opacity-60">
                    ＋
                  </span>
                </summary>
                <p className={`mt-2 text-sm ${palette.subfg}`}>{item.a}</p>
              </details>
            ))}
          </div>

          {/* Social proof */}
          <div
            className="mt-8 rounded-2xl border-dashed p-4 text-sm opacity-80"
            style={{ borderWidth: 1 }}
          >
            Trusted by 150+ retailers • Private‑label ready • Consistent
            replenishment cycles
          </div>
        </div>
      </section>

      {/* Related / Assortment suggestions */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <h2 className="text-2xl font-semibold">
          Recommended for your assortment
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <a
              key={i}
              href="#"
              className={`group rounded-2xl ${palette.ring} ${palette.card} p-2`}
            >
              <div className="relative">
                <Image
                  width={64}
                  height={64}
                  src="https://images.unsplash.com/photo-1589924641763-c68a3abf2f40?q=80&w=1200&auto=format&fit=crop"
                  className="aspect-[4/5] w-full rounded-xl object-cover"
                  alt="Related product"
                />
                <span
                  className={`absolute left-2 top-2 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${palette.chip}`}
                >
                  Fast‑moving
                </span>
              </div>
              <div className="p-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Seren Band Ring</span>
                  <span>
                    $
                    {priceForQty(100, [
                      { min: 25, price: 24 },
                      { min: 100, price: 21 },
                      { min: 300, price: 19 },
                    ])}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}

/*
------------------------------------------------------------
TESTS (copy into your test directory)

import { computeSavings, priceForQty, paletteForTheme } from "app/product/[slug]/page";

describe("priceForQty tiers", () => {
  const tiers = [
    { min: 25, price: 48 },
    { min: 100, price: 42 },
    { min: 300, price: 39 },
    { min: 1000, price: 35 },
  ];
  it("uses base tier for MOQ", () => {
    expect(priceForQty(25, tiers)).toBe(48);
  });
  it("picks correct middle tier", () => {
    expect(priceForQty(150, tiers)).toBe(42);
  });
  it("picks highest tier for very large qty", () => {
    expect(priceForQty(2000, tiers)).toBe(35);
  });
});

describe("computeSavings", () => {
  it("returns positive diff when msrp > tier price", () => {
    expect(computeSavings(109, 48)).toBe(61);
  });
  it("returns 0 when msrp <= tier price", () => {
    expect(computeSavings(48, 109)).toBe(0);
    expect(computeSavings(48, 48)).toBe(0);
  });
});

describe("paletteForTheme", () => {
  it("dark palette contains expected tokens", () => {
    const p = paletteForTheme("dark");
    expect(p.bg).toContain("neutral-950");
    expect(p.button).toContain("yellow-500");
  });
  it("light palette contains expected tokens", () => {
    const p = paletteForTheme("light");
    expect(p.bg).toContain("neutral-50");
    expect(p.button).toContain("rose-400");
  });
});
------------------------------------------------------------
*/
