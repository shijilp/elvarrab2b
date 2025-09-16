"use client";
import Image from "next/image";
import React, { useMemo, useState } from "react";

// ------------------------------------------------------------
// Elvarra / Elvara — WHOLESALE PRODUCTS PAGE (Catalog Grid)
// Theme unchanged; content tailored for B2B (tiers, MOQ, quote flow)
// Save as: app/products/page.tsx
// ------------------------------------------------------------

// Theme palette utilities (kept local for standalone file)
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

// Mock product data (replace with API fetch)
export type Product = {
  slug: string;
  title: string;
  sku: string;
  image: string;
  category: "necklaces" | "earrings" | "rings" | "bracelets";
  moq: number;
  tiers: { min: number; unit: number }[];
  fast?: boolean;
};

const ALL_PRODUCTS: Product[] = [
  {
    slug: "aurelia-pendant",
    title: "Aurelia Pendant",
    sku: "ELV-AUR-PND-18G",
    image:
      "https://images.unsplash.com/photo-1603561596112-0e8e1f43d0a6?q=80&w=1200&auto=format&fit=crop",
    category: "necklaces",
    moq: 25,
    tiers: [
      { min: 25, unit: 48 },
      { min: 100, unit: 42 },
      { min: 300, unit: 39 },
    ],
    fast: true,
  },
  {
    slug: "luna-drop-earrings",
    title: "Luna Drop Earrings",
    sku: "ELV-LUN-DRP-GLD",
    image:
      "https://images.unsplash.com/photo-1631049035182-249067d76152?q=80&w=1200&auto=format&fit=crop",
    category: "earrings",
    moq: 25,
    tiers: [
      { min: 25, unit: 24 },
      { min: 100, unit: 21 },
      { min: 300, unit: 19 },
    ],
    fast: true,
  },
  {
    slug: "seren-band-ring",
    title: "Seren Band Ring",
    sku: "ELV-SRN-RNG-GLD",
    image:
      "https://images.unsplash.com/photo-1589924641763-c68a3abf2f40?q=80&w=1200&auto=format&fit=crop",
    category: "rings",
    moq: 25,
    tiers: [
      { min: 25, unit: 16 },
      { min: 100, unit: 14 },
      { min: 300, unit: 12 },
    ],
  },
  {
    slug: "velour-cuff-bracelet",
    title: "Velour Cuff Bracelet",
    sku: "ELV-VLR-CFF-GLD",
    image:
      "https://images.unsplash.com/photo-1611599538395-8a85b43892ab?q=80&w=1200&auto=format&fit=crop",
    category: "bracelets",
    moq: 25,
    tiers: [
      { min: 25, unit: 39 },
      { min: 100, unit: 34 },
      { min: 300, unit: 29 },
    ],
  },
  // add a few more examples
  {
    slug: "nova-stud-earrings",
    title: "Nova Stud Earrings",
    sku: "ELV-NOV-STD-SS",
    image:
      "https://images.unsplash.com/photo-1544473244-f5b2e3bbd98b?q=80&w=1200&auto=format&fit=crop",
    category: "earrings",
    moq: 25,
    tiers: [
      { min: 25, unit: 15 },
      { min: 100, unit: 13 },
      { min: 300, unit: 11 },
    ],
  },
  {
    slug: "celeste-chain-necklace",
    title: "Celeste Chain Necklace",
    sku: "ELV-CEL-CHN-18G",
    image:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1200&auto=format&fit=crop",
    category: "necklaces",
    moq: 25,
    tiers: [
      { min: 25, unit: 32 },
      { min: 100, unit: 29 },
      { min: 300, unit: 26 },
    ],
  },
];

function formatTier(p: Product) {
  const low = p.tiers[p.tiers.length - 1].unit;
  const high = p.tiers[0].unit;
  return `$${low}–$${high}`;
}

export default function ProductsPage() {
  // Theme — default to dark, can be wired to a global toggle later
  const theme: ThemeMode = "dark";
  const palette = useMemo(() => paletteForTheme(theme), [theme]);

  // Filters and sorting
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [minUnits, setMinUnits] = useState<number>(0); // minimum MOQ/units buyer wants
  const [sort, setSort] = useState<string>("relevance");
  const pageSize = 8;
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list = ALL_PRODUCTS.slice();
    if (category !== "all") list = list.filter((p) => p.category === category);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((p) =>
        [p.title, p.sku, p.category, p.slug].some((s) =>
          s.toLowerCase().includes(q)
        )
      );
    }
    if (minUnits > 0) {
      list = list.filter((p) => p.tiers.some((t) => t.min <= minUnits));
    }
    switch (sort) {
      case "price-asc": {
        list.sort(
          (a, b) =>
            a.tiers[a.tiers.length - 1].unit - b.tiers[b.tiers.length - 1].unit
        );
        break;
      }
      case "price-desc": {
        list.sort((a, b) => b.tiers[0].unit - a.tiers[0].unit);
        break;
      }
      case "moq-asc": {
        list.sort((a, b) => a.moq - b.moq);
        break;
      }
      case "fast": {
        list.sort((a, b) => (b.fast ? 1 : 0) - (a.fast ? 1 : 0));
        break;
      }
      default:
        break; // relevance (no-op)
    }
    return list;
  }, [category, query, minUnits, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page]
  );

  function goto(p: number) {
    setPage(Math.min(Math.max(1, p), totalPages));
  }

  return (
    <main className={`${palette.bg} ${palette.fg} min-h-screen antialiased`}>
      {/* Header (minimal — use your shared layout header in app/layout.tsx if needed) */}
      <div className="container py-6 mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Wholesale Catalog</h1>
            <p className={`mt-1 text-sm ${palette.subfg}`}>
              Browse all SKUs. MOQ from 25 • Tiered pricing • Private‑label
              ready.
            </p>
          </div>
          <a
            href="/wholesale-inquiry"
            className={`rounded-xl px-4 py-2 text-sm font-medium ${palette.button}`}
          >
            Request Line Sheet
          </a>
        </div>
      </div>

      {/* Filters + Grid */}
      <section className="container pb-16 mx-auto">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
          {/* Sidebar filters */}
          <aside
            className={`rounded-2xl ${palette.ring} ${palette.card} p-4 h-max`}
          >
            <div className="space-y-4 text-sm">
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider opacity-80">
                  Search
                </label>
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="SKU, name, category..."
                  className={`w-full rounded-xl border ${palette.border} bg-transparent px-3 py-2 text-sm outline-none`}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider opacity-80">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setPage(1);
                  }}
                  className={`w-full rounded-xl border ${palette.border} bg-transparent px-3 py-2 text-sm outline-none`}
                >
                  <option value="all">All</option>
                  <option value="necklaces">Necklaces</option>
                  <option value="earrings">Earrings</option>
                  <option value="rings">Rings</option>
                  <option value="bracelets">Bracelets</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider opacity-80">
                  Min. units
                </label>
                <input
                  type="number"
                  min={0}
                  value={minUnits}
                  onChange={(e) => {
                    setMinUnits(Number(e.target.value) || 0);
                    setPage(1);
                  }}
                  className={`w-full rounded-xl border ${palette.border} bg-transparent px-3 py-2 text-sm outline-none`}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider opacity-80">
                  Sort
                </label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className={`w-full rounded-xl border ${palette.border} bg-transparent px-3 py-2 text-sm outline-none`}
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-asc">Lowest unit price</option>
                  <option value="price-desc">Highest unit price</option>
                  <option value="moq-asc">Lowest MOQ</option>
                  <option value="fast">Fast‑moving first</option>
                </select>
              </div>
              <a
                href="/wholesale-inquiry"
                className={`inline-block w-full rounded-xl px-3 py-2 text-center text-sm font-medium ${palette.button}`}
              >
                Get Custom Quote
              </a>
            </div>
          </aside>

          {/* Results grid */}
          <div>
            <div className="flex items-center justify-between text-sm">
              <div className={`${palette.subfg}`}>
                {filtered.length} products
              </div>
              <div className="hidden gap-2 sm:flex">
                <button
                  onClick={() => goto(page - 1)}
                  disabled={page <= 1}
                  className={`rounded-xl border ${palette.border} px-3 py-1.5 disabled:opacity-40`}
                >
                  Prev
                </button>
                <div className="px-1 py-1.5">
                  Page {page} / {totalPages}
                </div>
                <button
                  onClick={() => goto(page + 1)}
                  disabled={page >= totalPages}
                  className={`rounded-xl border ${palette.border} px-3 py-1.5 disabled:opacity-40`}
                >
                  Next
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {pageItems.map((p) => (
                <a
                  key={p.slug}
                  href={`/product/${p.slug}`}
                  className={`group rounded-2xl ${palette.ring} ${palette.card} p-2`}
                >
                  <div className="relative">
                    <Image
                      width={64}
                      height={64}
                      src={p.image}
                      alt={p.title}
                      className="aspect-[4/5] w-full rounded-xl object-cover"
                    />
                    {p.fast && (
                      <span
                        className={`absolute left-2 top-2 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${palette.chip}`}
                      >
                        Fast‑moving
                      </span>
                    )}
                  </div>
                  <div className="p-2">
                    <div className="text-sm font-medium">{p.title}</div>
                    <div className={`mt-1 text-xs ${palette.subfg}`}>
                      SKU: {p.sku}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span>Tier {formatTier(p)}</span>
                      <span className="opacity-80">MOQ {p.moq}</span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      {p.tiers.slice(0, 2).map((t) => (
                        <div
                          key={t.min}
                          className={`rounded-xl ${palette.ring} ${palette.card} p-2 text-center`}
                        >
                          <div className="opacity-80">{t.min}+</div>
                          <div className="font-medium">${t.unit}</div>
                        </div>
                      ))}
                    </div>
                    <a
                      href={`/wholesale-inquiry?sku=${encodeURIComponent(
                        p.sku
                      )}`}
                      className={`mt-3 block w-full rounded-xl px-3 py-2 text-center text-sm ${palette.button}`}
                    >
                      Request Quote
                    </a>
                  </div>
                </a>
              ))}
            </div>

            {/* Pagination (mobile) */}
            <div className="mt-6 flex items-center justify-center gap-2 sm:hidden">
              <button
                onClick={() => goto(page - 1)}
                disabled={page <= 1}
                className={`rounded-xl border ${palette.border} px-3 py-1.5 disabled:opacity-40`}
              >
                Prev
              </button>
              <div className="px-1 py-1.5 text-sm">
                Page {page} / {totalPages}
              </div>
              <button
                onClick={() => goto(page + 1)}
                disabled={page >= totalPages}
                className={`rounded-xl border ${palette.border} px-3 py-1.5 disabled:opacity-40`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/*
------------------------------------------------------------
TESTS (sample snippets; put into tests/ or __tests__/)

// tests/products-filter.test.ts
// Example unit-ish test if you extract filtering to a function.
// Here we just show intent, since this file is a page component.

// import { filterProducts } from "app/products/page";
// it("filters by category and query", () => {
//   const out = filterProducts(ALL_PRODUCTS, { category: "earrings", query: "Luna" });
//   expect(out.every(p => p.category === "earrings")).toBe(true);
//   expect(out.some(p => /luna/i.test(p.title))).toBe(true);
// });
------------------------------------------------------------
*/
