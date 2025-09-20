"use client";
import ESpinner from "@/components/ElvarraSpinner";
import AddToCartBtn from "@/components/ui/AddToCartBtn";
import { api } from "@/lib/api";
import { money } from "@/lib/money";
import { Product } from "@/types";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";

// ---------------------------
// Mock retail product data (replace with API fetch)
// ---------------------------
// export type Product = {
//   slug: string;
//   title: string;
//   sku: string;
//   image: string;
//   category: "necklaces" | "earrings" | "rings" | "bracelets";
//   price: number; // retail price
//   compareAt?: number; // optional crossed-out price for promos
//   bestseller?: boolean;
// };

/* const ALL_PRODUCTS: Product[] = [
  {
    slug: "aurelia-pendant",
    title: "Aurelia Pendant",
    sku: "ELV-AUR-PND-18G",
    image:
      "https://images.unsplash.com/photo-1603561596112-0e8e1f43d0a6?q=80&w=1200&auto=format&fit=crop",
    category: "necklaces",
    price: 89,
    compareAt: 109,
    bestseller: true,
  },
  {
    slug: "luna-drop-earrings",
    title: "Luna Drop Earrings",
    sku: "ELV-LUN-DRP-GLD",
    image:
      "https://images.unsplash.com/photo-1631049035182-249067d76152?q=80&w=1200&auto=format&fit=crop",
    category: "earrings",
    price: 49,
    bestseller: true,
  },
  {
    slug: "seren-band-ring",
    title: "Seren Band Ring",
    sku: "ELV-SRN-RNG-GLD",
    image:
      "https://images.unsplash.com/photo-1589924641763-c68a3abf2f40?q=80&w=1200&auto=format&fit=crop",
    category: "rings",
    price: 59,
  },
  {
    slug: "velour-cuff-bracelet",
    title: "Velour Cuff Bracelet",
    sku: "ELV-VLR-CFF-GLD",
    image:
      "https://images.unsplash.com/photo-1611599538395-8a85b43892ab?q=80&w=1200&auto=format&fit=crop",
    category: "bracelets",
    price: 79,
  },
  {
    slug: "nova-stud-earrings",
    title: "Nova Stud Earrings",
    sku: "ELV-NOV-STD-SS",
    image:
      "https://images.unsplash.com/photo-1544473244-f5b2e3bbd98b?q=80&w=1200&auto=format&fit=crop",
    category: "earrings",
    price: 29,
  },
  {
    slug: "celeste-chain-necklace",
    title: "Celeste Chain Necklace",
    sku: "ELV-CEL-CHN-18G",
    image:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1200&auto=format&fit=crop",
    category: "necklaces",
    price: 69,
  },
]; */

// ---------------------------
// Page
// ---------------------------
export default function ProductsPage() {
  // Theme — default to dark, can be wired to a global toggle later
  const [products, setProducts] = useState<Product[]>([]);

  // Filters and sorting (retail)
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(0); // 0 = no cap
  const [sort, setSort] = useState<string>("relevance");
  const pageSize = 8;
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/products/")
      .then((res) => {
        setProducts(res.data.results);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch products:", err);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    let list = products.slice();
    if (category !== "all")
      list = list.filter((p) => p.category?.name.toLowerCase() === category);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((p) =>
        [p.name, p.sku, p.category?.name, p.slug].some(
          (s) => s && s.toLowerCase().includes(q)
        )
      );
    }
    if (minPrice > 0) list = list.filter((p) => p.price >= minPrice);
    if (maxPrice > 0) list = list.filter((p) => p.price <= maxPrice);

    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "popular":
        list.sort((a, b) => (b.tag ? 1 : 0) - (a.tag ? 1 : 0));
        break;
      default:
        break; // relevance (no-op)
    }
    return list;
  }, [products, category, query, minPrice, maxPrice, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page]
  );

  function goto(p: number) {
    setPage(Math.min(Math.max(1, p), totalPages));
  }
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/70 dark:bg-black/70 z-50">
        <ESpinner />
      </div>
    );
  }

  return (
    <main className={`  el-text min-h-screen antialiased`}>
      <div className=" inset-0 -z-10 opacity-30 blur-3xl">
        <div className="pointer-events-none absolute -inset-10 rounded-[100px] gradient-accent" />
      </div>
      {/* Header */}
      <div className="container py-6 mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Shop All</h1>
            <p className={`mt-1 text-sm el-text-sub `}>
              Free shipping over $150 • 30‑day returns • 2‑year warranty
            </p>
          </div>
          <a
            href="/cart/retail"
            className={`rounded-xl px-4 py-2 text-sm font-medium btn-gradient`}
          >
            View Cart
          </a>
        </div>
      </div>

      {/* Filters + Grid */}
      <section className="container pb-16 mx-auto">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
          {/* Sidebar filters */}
          <aside className={`h-max rounded-2xl ring-1 el-ring el-card p-4`}>
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
                  className={`w-full rounded-xl border el-border bg-transparent px-3 py-2 text-sm outline-none`}
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
                  className={`w-full rounded-xl border el-border bg-transparent px-3 py-2 text-sm outline-none`}
                >
                  <option value="all">All</option>
                  <option value="necklaces">Necklaces</option>
                  <option value="earrings">Earrings</option>
                  <option value="rings">Rings</option>
                  <option value="bracelets">Bracelets</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-wider opacity-80">
                    Min price
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={minPrice}
                    onChange={(e) => {
                      setMinPrice(Number(e.target.value) || 0);
                      setPage(1);
                    }}
                    className={`w-full rounded-xl border el-border bg-transparent px-3 py-2 text-sm outline-none`}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-wider opacity-80">
                    Max price
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={maxPrice}
                    onChange={(e) => {
                      setMaxPrice(Number(e.target.value) || 0);
                      setPage(1);
                    }}
                    className={`w-full rounded-xl border el-border bg-transparent px-3 py-2 text-sm outline-none`}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider opacity-80">
                  Sort
                </label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className={`w-full rounded-xl border el-border bg-transparent px-3 py-2 text-sm outline-none`}
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="popular">Popular</option>
                </select>
              </div>
              {/* <a
                href="/checkout/retail"
                className={`inline-block w-full rounded-xl px-3 py-2 text-center text-sm font-medium btn-gradient`}
              >
                Checkout
              </a> */}
            </div>
          </aside>

          {/* Results grid */}
          <div>
            <div className="flex items-center justify-between text-sm">
              <div className={`el-text-sub`}>{filtered.length} products</div>
              <div className="hidden gap-2 sm:flex">
                <button
                  onClick={() => goto(page - 1)}
                  disabled={page <= 1}
                  className={`rounded-xl border el-border px-3 py-1.5 disabled:opacity-40`}
                >
                  Prev
                </button>
                <div className="px-1 py-1.5">
                  Page {page} / {totalPages}
                </div>
                <button
                  onClick={() => goto(page + 1)}
                  disabled={page >= totalPages}
                  className={`rounded-xl border el-border px-3 py-1.5 disabled:opacity-40`}
                >
                  Next
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {pageItems.map((p) => (
                <div
                  key={p.slug}
                  className={`group rounded-2xl ring-1 el-ring el-card p-2`}
                >
                  <a href={`/product/${p.slug}`} className="relative block">
                    <Image
                      width={64}
                      height={64}
                      src={p.image}
                      alt={p.name}
                      className="aspect-[4/5] w-full rounded-xl object-cover"
                    />
                    {p.tag && (
                      <span
                        className={`absolute left-2 top-2 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider el-chip`}
                      >
                        Bestseller
                      </span>
                    )}
                  </a>
                  <div className="p-2">
                    <div className="text-sm font-medium">{p.name}</div>
                    <div className={`mt-1 text-xs el-text-sub`}>
                      SKU: {p.sku}
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-sm font-semibold">
                        {p.compare_at_price ? (
                          <>
                            <span className="mr-1 line-through opacity-70">
                              {money(p.compare_at_price)}
                            </span>
                            <span>{money(p.price)}</span>
                          </>
                        ) : (
                          <span>{money(p.price)}</span>
                        )}
                      </div>
                      <a
                        href={`/product/${p.slug}`}
                        className={`rounded-xl border el-border px-3 py-1.5 text-xs`}
                      >
                        Details
                      </a>
                    </div>

                    <AddToCartBtn product={p} />
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination (mobile) */}
            <div className="mt-6 flex items-center justify-center gap-2 sm:hidden">
              <button
                onClick={() => goto(page - 1)}
                disabled={page <= 1}
                className={`rounded-xl border el-border px-3 py-1.5 disabled:opacity-40`}
              >
                Prev
              </button>
              <div className="px-1 py-1.5 text-sm">
                Page {page} / {totalPages}
              </div>
              <button
                onClick={() => goto(page + 1)}
                disabled={page >= totalPages}
                className={`rounded-xl border el-border px-3 py-1.5 disabled:opacity-40`}
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
