"use client";

import { api } from "@/lib/api";
import { money } from "@/lib/money";
import type { Product } from "@/types";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SkeletonCard } from "@/components/ui/SkeltonCard";
import Link from "next/link";
import { Crown } from "lucide-react";
import AddToRFQBtn from "./ui/AddToRfqBtn";

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

  const urlTags = (searchParams.get("tags") || "")
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  // ---------- derive UI state from URL (so links are shareable) ----------
  const urlCategory = searchParams.get("category") || DEFAULTS.category;
  const urlQuery = searchParams.get("q") || DEFAULTS.q;
  const urlMin = Number(searchParams.get("min") || DEFAULTS.min);
  const urlMax = Number(searchParams.get("max") || DEFAULTS.max);
  const urlSort = searchParams.get("sort") || DEFAULTS.sort;
  const urlPage = Number(searchParams.get("page") || DEFAULTS.page);
  const urlOccasion = (
    searchParams.get("occasion") || DEFAULTS.occasion
  ).toLowerCase();

  // ---------- keep your existing UI states ----------
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

  // data
  const pageSize = 20;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<APIList<Product>>({
    count: 0,
    next: null,
    previous: null,
    results: [],
  });

  // sync URL -> state (initial load + back/forward)
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

  // map UI sort -> DRF ordering
  const ordering = useMemo(() => {
    if (sort === "price-asc") return "price";
    if (sort === "price-desc") return "-price";
    if (sort === "popular") return "-sold_count"; // ensure allowed
    if (sort === "name") return "name";
    return undefined; // relevance → server default
  }, [sort]);

  const isDirty =
    category !== DEFAULTS.category ||
    query !== DEFAULTS.q ||
    minPrice > DEFAULTS.min ||
    maxPrice > DEFAULTS.max ||
    sort !== DEFAULTS.sort ||
    page !== DEFAULTS.page ||
    occasion !== DEFAULTS.occasion;
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

  // fetch from server whenever filters change
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    // build API params
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
      tags: tags.length ? tags.join(",") : undefined, // 👈 HERE
    };

    api
      .get<APIList<Product>>("/api/elvarra/portfolio/", { params }) // << keep your path
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
  }, [category, occasion, query, minPrice, maxPrice, ordering, page]);

  useEffect(() => {
    let mounted = true;
    Promise.all([api.get("/api/elvarra/categories/")])
      .then(([pRes]) => {
        if (!mounted) return;

        setCategories(pRes.data.results ?? pRes.data ?? []);
      })
      .catch((err) => console.error("Failed to fetch:", err))
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const totalPages = Math.max(1, Math.ceil((data?.count || 0) / pageSize));
  const pageItems = data?.results || [];

  // helper to write state -> URL (keeps your UI, just updates the address bar)
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
    }>
  ) {
    const p = new URLSearchParams(searchParams.toString()); // important: clone from RO params
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

  function goto(pn: number) {
    const clamped = Math.min(Math.max(1, pn), totalPages);
    setPage(clamped);
    setURL({ page: clamped });
  }

  // if (loading && page === 1 && data.results.length === 0) {
  //   // full-screen spinner on first load
  //   return (
  //     <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/70">
  //       <ESpinner />
  //     </div>
  //   );
  // }

  const allCategoryNames = useMemo(() => {
    return [
      "All",
      ...Array.from(new Set(categories.map((c) => c.name).filter(Boolean))),
    ];
  }, [categories]);
  return (
    <main className="el-text min-h-screen antialiased">
      <div className="inset-0 -z-10 opacity-30 blur-3xl">
        <div className="pointer-events-none absolute -inset-10 rounded-[100px] gradient-accent" />
      </div>

      {/* Header */}
      <div className="container mx-auto py-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold el-textn">Shop All</h1>
            <p className="mt-1 text-sm el-text-subn">
              Free shipping over {money(700)} across India.
            </p>
          </div>
          {/* <a
            href="/cart/retail"
            className="rounded-xl px-4 py-2 text-sm font-medium btn-gradient"
          >
            View Cart
          </a> */}
        </div>
      </div>

      {/* Filters + Grid */}
      <section className="container mx-auto pb-16">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
          {/* Sidebar filters */}
          <aside className="h-max rounded-2xl ring-1 ring-gray-900 el-ring el-card p-4">
            <div className="space-y-4 text-sm">
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider opacity-80">
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
                  placeholder="SKU, name, category..."
                  className="w-full rounded-xl border el-border bg-transparent px-3 py-2 text-sm outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider opacity-80">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    const c = e.target.value.toLowerCase();
                    setCategory(c);
                    setPage(1);
                    setURL({ category: c, page: 1 });
                  }}
                  className="w-full rounded-xl border el-border bg-transparent px-3 py-2 text-sm outline-none"
                >
                  <option value="All">All</option>
                  <option value="necklaces">Necklaces</option>
                  <option value="earrings">Earrings</option>
                  <option value="rings">Rings</option>
                  <option value="bracelets">Bracelets</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider opacity-80">
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
                  className="w-full rounded-xl border el-border bg-transparent px-3 py-2 text-sm outline-none"
                >
                  <option value="all">All</option>
                  <option value="wedding">Wedding</option>
                  <option value="party">Party</option>
                  <option value="daily">Daily</option>
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
                      const v = Number(e.target.value) || 0;
                      setMinPrice(v);
                      setPage(1);
                      setURL({ min: v, page: 1 });
                    }}
                    className="w-full rounded-xl border el-border bg-transparent px-3 py-2 text-sm outline-none"
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
                      const v = Number(e.target.value) || 0;
                      setMaxPrice(v);
                      setPage(1);
                      setURL({ max: v, page: 1 });
                    }}
                    className="w-full rounded-xl border el-border bg-transparent px-3 py-2 text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider opacity-80">
                  Sort
                </label>
                <select
                  value={sort}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSort(v);
                    setURL({ sort: v });
                  }}
                  className="w-full rounded-xl border el-border bg-transparent px-3 py-2 text-sm outline-none"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="popular">Popular</option>
                  <option value="name">Name</option>
                </select>
              </div>

              <div className="mt-2 flex justify-around ">
                <button
                  disabled={!isDirty}
                  className="w-1/3 btn-gradient-accent sm:hidden rounded-xl border el-border px-2 py-2 text-sm disabled:opacity-40 hover:bg-white/5"
                  aria-disabled={!isDirty}
                >
                  Go
                </button>
                <button
                  onClick={resetFilters}
                  disabled={!isDirty}
                  className=" w-1/3 sm:w-full btn-gradient-accent rounded-xl border el-border px-3 py-2 text-sm disabled:opacity-40 hover:bg-white/5"
                  aria-disabled={!isDirty}
                >
                  Reset filters
                </button>
              </div>
            </div>
          </aside>

          {/* Results grid */}
          <div>
            <div className="flex items-center justify-between text-sm">
              {/* Category chips (filter bestsellers below) */}
              {allCategoryNames.length > 1 && (
                <div className="mb-6">
                  <CategoryChips
                    categories={allCategoryNames}
                    current={category}
                    onChange={setCategory}
                  />
                </div>
              )}
              <div className=" el-text-subn hidden md:block">
                {data.count} products
              </div>
              <div className="hidden gap-2 sm:flex">
                <button
                  onClick={() => goto(page - 1)}
                  disabled={page <= 1}
                  className="rounded-xl border el-bordern el-text-subn px-3  py-1.5 disabled:opacity-50"
                >
                  Prev
                </button>
                <div className="px-1 py-1.5 el-text-subn ">
                  Page {page} / {totalPages}
                </div>
                <button
                  onClick={() => goto(page + 1)}
                  disabled={page >= totalPages}
                  className="rounded-xl border el-bordern el-text-subn px-3 py-1.5 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>

            {loading && (
              <div className="my-4 text-xs opacity-70">Refreshing…</div>
            )}

            {loading && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            )}

            {!loading && (
              <div className="  mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {pageItems.map((p) => (
                  <div
                    key={p.slug}
                    className="relative group rounded-2xl ring-1 z-10   el-ring el-card p-2"
                  >
                    <Link
                      href={`/products/${p.slug}`}
                      className="relative block"
                    >
                      <Image
                        width={640}
                        height={640}
                        src={p.image}
                        alt={p.name}
                        className="aspect-[4/5] w-full rounded-xl object-cover"
                      />
                      {p.tag === "bestseller" && (
                        <span className="absolute left-2 top-2 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider el-chip">
                          Bestseller
                        </span>
                      )}
                      {p.tag && (
                        <span
                          className={` flex items-center gap-1 absolute left-2 top-2 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full overflow-hidden
      ${
        p.tag === "premium"
          ? "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white shadow-md ring-1 ring-yellow-400"
          : "bg-[var(--chip-bg)] text-[var(--chip-fg)]"
      }`}
                        >
                          {p.tag === "premium" && (
                            <Crown className="w-4 h-4 text-yellow-200 drop-shadow-sm" />
                          )}
                          {p.tag === "premium" ? "Premium" : p.tag}

                          {/* Glossy highlight overlay */}
                          {p.tag === "premium" && (
                            <span className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent rounded-full" />
                          )}
                        </span>
                      )}

                      {p.stock < 1 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white font-semibold text-sm z-10">
                          Out of Stock
                        </div>
                      )}
                    </Link>
                    <div className="p-2  ">
                      <div className="text-sm font-medium text-nowrap overflow-hidden text-ellipsis">
                        {p.name}
                      </div>
                      {p.sku && (
                        <div className="mt-1 text-xs el-text-sub">
                          {p.category?.name}
                        </div>
                      )}

                      <div className="mt-2 flex items-center justify-between">
                        <div className="text-sm font-semibold">
                          {(p as Product).compare_at_price > 0 ? (
                            <>
                              <span className="mr-1 line-through opacity-70">
                                {money((p as Product).compare_at_price)}
                              </span>
                              <span>{money(p.price as number)}</span>
                            </>
                          ) : (
                            <span>{money(p.price as number)}</span>
                          )}
                        </div>

                        <Link
                          href={`/product/${p.slug}`}
                          className="rounded-xl border el-border px-3 py-1.5 text-xs  hidden md:block"
                        >
                          Details
                        </Link>
                      </div>
                      <AddToRFQBtn product={p} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination (mobile) */}
            <div className="mt-6 flex items-center justify-center gap-2 sm:hidden">
              <button
                onClick={() => goto(page - 1)}
                disabled={page <= 1}
                className="rounded-xl border el-border el-text-subn px-3 py-1.5 disabled:opacity-40"
              >
                Prev
              </button>
              <div className="px-1 py-1.5 text-sm el-text-subn">
                Page {page} / {totalPages}
              </div>
              <button
                onClick={() => goto(page + 1)}
                disabled={page >= totalPages}
                className="rounded-xl border el-border el-text-subn px-3 py-1.5 disabled:opacity-40"
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

function CategoryChips({
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
          className={`rounded-full  border px-3 py-1.5 text-xs transition ${
            current === c
              ? "btn-gradient-accent border-transparent"
              : "border-neutral-800  bg-neutral-900 el-text-subn hover:bg-white/5"
          }`}
          aria-pressed={current === c}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
