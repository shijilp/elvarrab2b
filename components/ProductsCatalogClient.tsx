"use client";

import { api } from "@/lib/api";
import type { Product } from "@/types";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SkeletonCard } from "@/components/ui/SkeltonCard";
import Link from "next/link";
import { Crown, FileText, SlidersHorizontal, X } from "lucide-react";
import AddToRFQBtn2 from "./ui/AddToRfqBtn2";
import { useRFQCart } from "@/context/RFQCartContext";

type APIList<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

const DEFAULTS = {
  category: "All",
  q: "",
  min: 0,
  max: 0,
  sort: "relevance",
  page: 1,
  occasion: "all",
  tags: [] as string[],
};

export default function ProductsCatalogClient() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const { rfq } = useRFQCart();

  const urlTags = (searchParams.get("tags") || "")
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  const urlCategory = searchParams.get("category") || DEFAULTS.category;
  const urlQuery = searchParams.get("q") || DEFAULTS.q;
  const urlMin = Number(searchParams.get("min") || DEFAULTS.min);
  const urlMax = Number(searchParams.get("max") || DEFAULTS.max);
  const urlSort = searchParams.get("sort") || DEFAULTS.sort;
  const urlPage = Number(searchParams.get("page") || DEFAULTS.page);
  const urlOccasion = (
    searchParams.get("occasion") || DEFAULTS.occasion
  ).toLowerCase();

  const [query, setQuery] = useState(urlQuery);
  const [category, setCategory] = useState<string>(urlCategory);
  const [minPrice, setMinPrice] = useState<number>(urlMin);
  const [maxPrice, setMaxPrice] = useState<number>(urlMax);
  const [sort, setSort] = useState<string>(urlSort);
  const [page, setPage] = useState<number>(urlPage);
  const [occasion, setOccasion] = useState<string>(urlOccasion);
  const [tags, setTags] = useState<string[]>(urlTags);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [categories, setCategories] = useState<any[]>([]);

  const pageSize = 20;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<APIList<Product>>({
    count: 0,
    next: null,
    previous: null,
    results: [],
  });

  useEffect(() => {
    if (urlQuery !== query) setQuery(urlQuery);
    if (urlCategory !== category) setCategory(urlCategory);
    if (urlOccasion !== occasion) setOccasion(urlOccasion);
    if (urlMin !== minPrice) setMinPrice(urlMin);
    if (urlMax !== maxPrice) setMaxPrice(urlMax);
    if (urlSort !== sort) setSort(urlSort);
    if (urlPage !== page) setPage(urlPage);

    const freshTags = (searchParams.get("tags") || "")
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const same =
      freshTags.length === tags.length &&
      freshTags.every((t, i) => t === tags[i]);

    if (!same) setTags(freshTags);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlQuery, urlCategory, urlOccasion, urlMin, urlMax, urlSort, urlPage]);

  const ordering = useMemo(() => {
    if (sort === "price-asc") return "price";
    if (sort === "price-desc") return "-price";
    if (sort === "popular") return "-sold_count";
    if (sort === "name") return "name";
    return undefined;
  }, [sort]);

  const isDirty =
    category !== DEFAULTS.category ||
    query !== DEFAULTS.q ||
    minPrice > DEFAULTS.min ||
    maxPrice > DEFAULTS.max ||
    sort !== DEFAULTS.sort ||
    page !== DEFAULTS.page ||
    occasion !== DEFAULTS.occasion ||
    tags.length > 0;

  function resetFilters() {
    setCategory(DEFAULTS.category);
    setQuery(DEFAULTS.q);
    setMinPrice(DEFAULTS.min);
    setMaxPrice(DEFAULTS.max);
    setSort(DEFAULTS.sort);
    setPage(DEFAULTS.page);
    setOccasion(DEFAULTS.occasion);
    setTags([]);
    router.replace(pathname, { scroll: false });
  }

  function setURL(
    next: Partial<{
      category: string;
      occasion: string;
      q: string;
      min: number;
      max: number;
      sort: string;
      page: number;
      tags: string[];
    }>,
  ) {
    const p = new URLSearchParams(searchParams.toString());
    const write = (k: string, v?: string | number | null) => {
      if (v === undefined || v === "" || v === 0 || v === null) p.delete(k);
      else p.set(k, String(v));
    };

    if (next.category !== undefined)
      write("category", next.category === "All" ? "" : next.category);
    if (next.occasion !== undefined)
      write("occasion", next.occasion === "all" ? "" : next.occasion);
    if (next.q !== undefined) write("q", next.q);
    if (next.min !== undefined) write("min", next.min);
    if (next.max !== undefined) write("max", next.max);
    if (next.sort !== undefined) write("sort", next.sort);
    if (next.page !== undefined) write("page", next.page);

    if (next.tags !== undefined) {
      const v = (next.tags || []).filter(Boolean).join(",");
      if (!v) p.delete("tags");
      else p.set("tags", v);
    }

    const qstr = p.toString();
    router.replace(qstr ? `${pathname}?${qstr}` : pathname, { scroll: false });
  }

  function goto(pn: number, totalPages: number) {
    const clamped = Math.min(Math.max(1, pn), totalPages);
    setPage(clamped);
    setURL({ page: clamped });
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: Record<string, any> = {
      page,
      page_size: pageSize,
      search: query || undefined,
      category: category !== "All" ? category : undefined,
      occasion: occasion !== "all" ? occasion : undefined,
      min_price: minPrice || undefined,
      max_price: maxPrice || undefined,
      ordering,
      tags: tags.length ? tags.join(",") : undefined,
    };

    api
      .get<APIList<Product>>("/b2b/catalog/", { params })
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch((err) => {
        console.error("Fetch products failed:", err);
        if (!cancelled)
          setData({ count: 0, next: null, previous: null, results: [] });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [category, occasion, query, minPrice, maxPrice, ordering, page, tags]);

  useEffect(() => {
    let mounted = true;
    api
      .get("/api/elvarra/categories/")
      .then((res) => {
        if (!mounted) return;
        setCategories(res.data.results ?? res.data ?? []);
      })
      .catch((err) => console.error("Failed to fetch categories:", err));

    return () => {
      mounted = false;
    };
  }, []);

  const totalPages = Math.max(1, Math.ceil((data?.count || 0) / pageSize));
  const pageItems = data?.results || [];

  const allCategoryNames = useMemo(() => {
    return [
      "All",
      ...Array.from(new Set(categories.map((c) => c.name).filter(Boolean))),
    ];
  }, [categories]);

  return (
    <main className="min-h-screen antialiased bg-neutral-950 text-neutral-100">
      {/* Dark-only background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -inset-24 opacity-25 blur-3xl gradient-accent rounded-[120px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-neutral-950 to-black" />
      </div>

      {/* Header */}
      <div className="container mx-auto py-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs tracking-[0.25em] text-neutral-300/80">
              ELVARRA B2B
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-neutral-50">
              Wholesale Catalog
            </h1>
            <p className="mt-1 text-sm text-neutral-300">
              View tiers, add items to RFQ, and request a quote.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/wholesale-inquiry"
              className="rounded-xl border border-neutral-800 bg-neutral-950/50 px-4 py-2 text-sm hover:bg-white/5"
            >
              Request Line Sheet
            </Link>

            <Link
              href="/b2b/rfq"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-neutral-950 btn-gradient-accent"
            >
              <FileText className="h-4 w-4" />
              View RFQ
              {rfq ? (
                <span className="ml-1 rounded-full bg-black/15 px-2 py-0.5 text-xs text-neutral-950">
                  {rfq.items.length}
                </span>
              ) : null}
            </Link>
          </div>
        </div>

        {/* Top chips row */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {allCategoryNames.length > 1 ? (
            <CategoryChipsB2B
              categories={allCategoryNames}
              current={category}
              onChange={(c) => {
                setCategory(c);
                setPage(1);
                setURL({ category: c, page: 1 });
              }}
            />
          ) : null}

          {isDirty ? (
            <button
              onClick={resetFilters}
              className="ml-auto inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-950/50 px-3 py-1.5 text-xs hover:bg-white/5"
            >
              <X className="h-4 w-4" />
              Clear filters
            </button>
          ) : (
            <div className="ml-auto text-xs text-neutral-400 hidden sm:block">
              {data.count} items
            </div>
          )}
        </div>
      </div>

      {/* Layout */}
      <section className="container mx-auto pb-16">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          {/* Sidebar */}
          <aside className="h-max rounded-2xl border border-neutral-800 bg-neutral-950/50 p-4">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-sm font-medium text-neutral-100">
                <SlidersHorizontal className="h-4 w-4 opacity-80" />
                Filters
              </div>
              <div className="text-xs text-neutral-400">{data.count} items</div>
            </div>

            <div className="mt-4 space-y-4 text-sm">
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-neutral-300/80">
                  Search
                </label>
                <input
                  value={query}
                  onChange={(e) => {
                    const v = e.target.value;
                    setQuery(v);
                    setPage(1);
                    setURL({ q: v, page: 1 });
                  }}
                  placeholder="SKU / name / keyword..."
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/10"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-neutral-300/80">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    const c = e.target.value;
                    setCategory(c);
                    setPage(1);
                    setURL({ category: c, page: 1 });
                  }}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/10"
                >
                  <option value="All">All</option>
                  {allCategoryNames
                    .filter((x) => x !== "All")
                    .map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-neutral-300/80">
                  Occasion
                </label>
                <select
                  value={occasion}
                  onChange={(e) => {
                    const v = e.target.value.toLowerCase();
                    setOccasion(v);
                    setPage(1);
                    setURL({ occasion: v, page: 1 });
                  }}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/10"
                >
                  <option value="all">All</option>
                  <option value="wedding">Wedding</option>
                  <option value="party">Party</option>
                  <option value="daily">Daily</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-wider text-neutral-300/80">
                    Min
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={minPrice}
                    onChange={(e) => {
                      const v = Number(e.target.value) || 0;
                      setMinPrice(v);
                      setPage(1);
                      setURL({ min: v, page: 1 });
                    }}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/10"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-wider text-neutral-300/80">
                    Max
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={maxPrice}
                    onChange={(e) => {
                      const v = Number(e.target.value) || 0;
                      setMaxPrice(v);
                      setPage(1);
                      setURL({ max: v, page: 1 });
                    }}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-neutral-300/80">
                  Sort
                </label>
                <select
                  value={sort}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSort(v);
                    setURL({ sort: v });
                  }}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/10"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-asc">Price: Low → High</option>
                  <option value="price-desc">Price: High → Low</option>
                  <option value="popular">Popular</option>
                  <option value="name">Name</option>
                </select>
              </div>

              <button
                onClick={resetFilters}
                disabled={!isDirty}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950/50 px-3 py-2 text-sm disabled:opacity-40 hover:bg-white/5"
              >
                Reset filters
              </button>
            </div>
          </aside>

          {/* Results */}
          <div>
            <div className="flex items-center justify-between text-sm">
              <div className="text-xs text-neutral-300">
                Showing{" "}
                <span className="font-semibold">{pageItems.length}</span> of{" "}
                <span className="font-semibold">{data.count}</span> items
              </div>

              <div className="hidden gap-2 sm:flex">
                <button
                  onClick={() => goto(page - 1, totalPages)}
                  disabled={page <= 1}
                  className="rounded-xl border border-neutral-800 bg-neutral-950/50 px-3 py-1.5 text-neutral-200 disabled:opacity-50 hover:bg-white/5"
                >
                  Prev
                </button>
                <div className="px-1 py-1.5 text-neutral-300">
                  Page {page} / {totalPages}
                </div>
                <button
                  onClick={() => goto(page + 1, totalPages)}
                  disabled={page >= totalPages}
                  className="rounded-xl border border-neutral-800 bg-neutral-950/50 px-3 py-1.5 text-neutral-200 disabled:opacity-40 hover:bg-white/5"
                >
                  Next
                </button>
              </div>
            </div>

            {loading ? (
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {pageItems.map((p) => (
                  <B2BProductCard key={p.slug} p={p} />
                ))}
              </div>
            )}

            <div className="mt-6 flex items-center justify-center gap-2 sm:hidden">
              <button
                onClick={() => goto(page - 1, totalPages)}
                disabled={page <= 1}
                className="rounded-xl border border-neutral-800 bg-neutral-950/50 px-3 py-1.5 text-neutral-200 disabled:opacity-40 hover:bg-white/5"
              >
                Prev
              </button>
              <div className="px-1 py-1.5 text-sm text-neutral-300">
                Page {page} / {totalPages}
              </div>
              <button
                onClick={() => goto(page + 1, totalPages)}
                disabled={page >= totalPages}
                className="rounded-xl border border-neutral-800 bg-neutral-950/50 px-3 py-1.5 text-neutral-200 disabled:opacity-40 hover:bg-white/5"
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

/* ----------------- Card (Dark-only) ----------------- */

function B2BProductCard({ p }: { p: Product }) {
  const tierMin = p?.wholesale_price?.[0]?.min_qty || 1;

  return (
    <div className="relative group rounded-2xl border border-neutral-800 bg-neutral-950/50 p-2 hover:bg-neutral-900/40 transition">
      <Link href={`/products/${p.slug}`} className="relative block">
        <Image
          width={640}
          height={640}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          src={(p as any).image}
          alt={p.name}
          className="aspect-[4/5] w-full rounded-xl object-cover"
        />

        {p.tag === "bestseller" && (
          <span className="absolute left-2 top-2 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider bg-white/10 text-neutral-100 border border-white/10">
            Bestseller
          </span>
        )}

        {!!p.tag && p.tag !== "bestseller" && (
          <span
            className={`flex items-center gap-1 absolute left-2 top-2 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full overflow-hidden
              ${
                p.tag === "premium"
                  ? "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black shadow-md ring-1 ring-yellow-400"
                  : "bg-white/10 text-neutral-100 border border-white/10"
              }`}
          >
            {p.tag === "premium" && <Crown className="w-4 h-4 text-black/80" />}
            {p.tag === "premium" ? "Premium" : p.tag}
          </span>
        )}
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {(p as any).stock < 1 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white font-semibold text-sm">
            Out of Stock
          </div>
        )}
      </Link>

      <div className="p-2">
        <div className="text-sm font-medium text-neutral-100 text-nowrap overflow-hidden text-ellipsis">
          {p.name}
        </div>

        <div className="mt-1 text-xs text-neutral-400">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(p as any).category?.name || "—"}
        </div>
        <div className="mt-1 text-xs text-neutral-400">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(p as any).sku || "—"}
        </div>

        <div className="mt-2 space-y-2">
          {p.wholesale_price && p.wholesale_price.length > 0 ? (
            <div className="rounded-xl border border-neutral-800 bg-black/30 p-2">
              {p.wholesale_price.slice(0, 3).map((tier, idx) => (
                <div
                  key={idx}
                  className="flex justify-between text-[11px] font-medium text-neutral-200"
                >
                  <span className="text-neutral-400">{tier.min_qty}+ pcs</span>
                  <span className="font-semibold text-[var(--color-accent)]">
                    ₹{Number(tier.unit_price).toFixed(2)}
                  </span>
                </div>
              ))}
              {p.wholesale_price.length > 3 && (
                <div className="mt-1 text-[10px] text-neutral-500">
                  + more slabs inside
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-neutral-400">
              Wholesale pricing on request
            </div>
          )}

          <AddToRFQBtn2 product={p} defaultQty={tierMin} minQty={tierMin} />

          <Link
            href={`/b2b/catalog/${p.slug}`}
            className="inline-flex w-full items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950/50 px-3 py-2 text-xs text-neutral-200 hover:bg-white/5"
          >
            View details
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ----------------- Category Chips (Dark-only) ----------------- */

function CategoryChipsB2B({
  categories,
  current,
  onChange,
}: {
  categories: string[];
  current: string;
  onChange: (c: string) => void;
}) {
  return (
    <div className="flex w-full flex-wrap gap-2">
      {categories.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className={`rounded-full border px-3 py-1.5 text-xs transition ${
            current === c
              ? "btn-gradient-accent border-transparent text-neutral-950"
              : "border-neutral-800 bg-neutral-950/50 text-neutral-200 hover:bg-white/5"
          }`}
          aria-pressed={current === c}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
