"use client";

import { api } from "@/lib/api";
import { money } from "@/lib/money";
import type { Category, Ocassion, Product } from "@/types";
import Image from "next/image";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SkeletonCard } from "@/components/ui/SkeltonCard";
import Link from "next/link";
import {
  Crown,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Truck,
  Building2,
  PackageCheck,
  ShieldCheck,
  BadgePercent,
} from "lucide-react";
import AddToCartBtn from "../ui/AddToCartBtn";
import { useAuth } from "@/context/AuthContext";

type APIList<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

const DEFAULTS = {
  category: "All",
  subcategory: "All",

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
  const gridTopRef = useRef<HTMLDivElement | null>(null);
  const urlTags = (searchParams.get("tags") || "")
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  const bootKeyRef = useRef<string | null>(null);
  const didBootRef = useRef(false);
  const [bootLoaded, setBootLoaded] = useState(false);

  const urlCategory = searchParams.get("category") || DEFAULTS.category;
  const urlSubcategory =
    searchParams.get("subcategory") || DEFAULTS.subcategory;

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
  const [subcategory, setSubcategory] = useState<string>(urlSubcategory);

  const [minPrice, setMinPrice] = useState<number>(urlMin);
  const [maxPrice, setMaxPrice] = useState<number>(urlMax);
  const [sort, setSort] = useState<string>(urlSort);
  const [page, setPage] = useState<number>(urlPage);
  const [occasion, setOccasion] = useState<string>(urlOccasion);
  const [tags, setTags] = useState<string[]>(urlTags);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [categories, setCategories] = useState<Category[]>([]);
  const [occasions, setOccasions] = useState<Ocassion[]>([]);

  const [showFilters, setShowFilters] = useState(false);
  const { user, initialized } = useAuth();
  const FREE_SHIP_THRESHOLD = 500;

  const pageSize = 18;
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<APIList<Product>>({
    count: 0,
    next: null,
    previous: null,
    results: [],
  });

  // Sync URL → State
  useEffect(() => {
    if (urlQuery !== query) setQuery(urlQuery);
    if (urlCategory !== category) setCategory(urlCategory);
    if (urlOccasion !== occasion) setOccasion(urlOccasion);
    if (urlMin !== minPrice) setMinPrice(urlMin);
    if (urlMax !== maxPrice) setMaxPrice(urlMax);
    if (urlSort !== sort) setSort(urlSort);
    if (urlPage !== page) setPage(urlPage);
    if (urlSubcategory !== subcategory) setSubcategory(urlSubcategory);
    const freshTags = (searchParams.get("tags") || "")
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    if (JSON.stringify(freshTags) !== JSON.stringify(tags)) setTags(freshTags);
  }, [searchParams]);

  const ordering = useMemo(() => {
    if (sort === "price-asc") return "price";
    if (sort === "price-desc") return "-price";
    if (sort === "popular") return "-sold_count";
    if (sort === "name") return "name";
    return undefined;
  }, [sort]);

  const isDirty =
    category !== DEFAULTS.category ||
    subcategory !== DEFAULTS.subcategory ||
    query !== DEFAULTS.q ||
    minPrice > DEFAULTS.min ||
    maxPrice > DEFAULTS.max ||
    sort !== DEFAULTS.sort ||
    occasion !== DEFAULTS.occasion ||
    tags.length > 0;

  function resetFilters() {
    setCategory(DEFAULTS.category);
    setSubcategory(DEFAULTS.subcategory);
    setQuery(DEFAULTS.q);
    setMinPrice(DEFAULTS.min);
    setMaxPrice(DEFAULTS.max);
    setSort(DEFAULTS.sort);
    setPage(DEFAULTS.page);
    setOccasion(DEFAULTS.occasion);
    setTags([]);
    router.replace(pathname, { scroll: false });
  }
  // Fetch categories
  // useEffect(() => {
  //   Promise.all([api.get("/categories/"), api.get("/occasions/")]).then(
  //     ([c, o]) => {
  //       setCategories(c.data.results ?? c.data ?? []);
  //       setOccasions(o.data.results ?? o.data ?? []);
  //     },
  //   );
  // }, []);

  useEffect(() => {
    let cancelled = false;

    const loadFilters = async () => {
      try {
        const [c, o] = await Promise.all([
          api.get("/api/elvarra/categories/"),
          api.get("/api/elvarra/occasions/"),
        ]);
        if (cancelled) return;
        setCategories(c.data.results ?? c.data ?? []);
        setOccasions(o.data.results ?? o.data ?? []);
      } catch {
        // ignore – filters are non-blocking
      }
    };

    // Run when browser is idle (so first products render wins)
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).requestIdleCallback(() => !cancelled && loadFilters());
    } else {
      setTimeout(() => !cancelled && loadFilters(), 0);
    }

    return () => {
      cancelled = true;
    };
  }, []);

  // useEffect(() => {
  //   if (!initialized) return;
  //   console.log("user from ad", user);

  //   if (!user) router.replace("/login");
  // }, [initialized, user, router]);

  useEffect(() => {
    let cancelled = false;

    // compute a “boot key” (unfiltered, initial page only)
    const bootKey = JSON.stringify({
      page: urlPage,
      page_size: pageSize,
    });

    bootKeyRef.current = bootKey;

    setLoading(true);

    api
      .get<APIList<Product>>("/b2b/catalog/", {
        params: {
          page: urlPage,
          page_size: pageSize,
        },
      })
      .then((res) => {
        if (cancelled) return;
        setData(res.data);
        didBootRef.current = true;
        setBootLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;
        setData({ count: 0, next: null, previous: null, results: [] });
        didBootRef.current = true;
        setBootLoaded(true);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // IMPORTANT: run once (first paint)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch products
  useEffect(() => {
    let cancelled = false;

    // Don’t run filtered fetch until the boot request has completed
    if (!bootLoaded) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: Record<string, any> = {
      page,
      page_size: pageSize,
      search: query || undefined,
      category: category !== "All" ? category : undefined,
      subcategory: subcategory !== "All" ? subcategory : undefined,

      occasion: occasion !== "all" ? occasion : undefined,
      min_price: minPrice || undefined,
      max_price: maxPrice || undefined,
      ordering,
      tags: tags.length ? tags.join(",") : undefined,
    };

    // If current request is EXACTLY the same as the boot request (unfiltered initial page),
    // skip it to avoid duplicate network call.
    const currentKey = JSON.stringify({
      page: params.page,
      page_size: params.page_size,
      // only include filters if present
      ...(params.search ? { search: params.search } : {}),
      ...(params.category ? { category: params.category } : {}),
      ...(params.occasion ? { occasion: params.occasion } : {}),
      ...(params.min_price ? { min_price: params.min_price } : {}),
      ...(params.max_price ? { max_price: params.max_price } : {}),
      ...(params.ordering ? { ordering: params.ordering } : {}),
      ...(params.tags ? { tags: params.tags } : {}),
    });

    const bootKey = bootKeyRef.current;

    // bootKey is always {page, page_size} only
    // so we also ensure “no filters” before skipping
    const noFilters =
      !params.search &&
      !params.category &&
      !params.occasion &&
      !params.subcategory &&
      !params.min_price &&
      !params.max_price &&
      !params.ordering &&
      !params.tags;

    if (
      didBootRef.current &&
      noFilters &&
      bootKey === JSON.stringify({ page, page_size: pageSize })
    ) {
      return;
    }

    setLoading(true);

    api
      .get<APIList<Product>>("/b2b/catalog/", { params })
      .then((res) => !cancelled && setData(res.data))
      .catch(
        () =>
          !cancelled &&
          setData({ count: 0, next: null, previous: null, results: [] }),
      )
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [
    bootLoaded,
    category,
    subcategory,

    occasion,
    query,
    minPrice,
    maxPrice,
    ordering,
    page,
    tags,
  ]);
  const totalPages = Math.max(1, Math.ceil((data?.count || 0) / pageSize));
  const pageItems = data?.results || [];

  function setURL(
    next: Partial<{
      category: string;
      subcategory: string;
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
      if (
        v === undefined ||
        v === null ||
        v === "" ||
        v === "All" ||
        v === "all" ||
        v === 0
      ) {
        p.delete(k);
      } else {
        p.set(k, String(v));
      }
    };

    // ✅ Only touch keys that exist in `next`
    if ("category" in next) write("category", next.category);
    if ("subcategory" in next) write("subcategory", next.subcategory);

    if ("occasion" in next) write("occasion", next.occasion);
    if ("q" in next) write("q", next.q);
    if ("min" in next) write("min", next.min);
    if ("max" in next) write("max", next.max);
    if ("sort" in next) write("sort", next.sort);
    if ("page" in next) write("page", next.page === 1 ? undefined : next.page);

    if ("tags" in next) {
      next.tags?.length ? p.set("tags", next.tags.join(",")) : p.delete("tags");
    }

    const qstr = p.toString();
    router.replace(qstr ? `${pathname}?${qstr}` : pathname, { scroll: false });
  }

  function goto(pn: number) {
    const clamped = Math.min(Math.max(1, pn), totalPages);
    setPage(clamped);
    setURL({ page: clamped });
  }

  useEffect(() => {
    gridTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [page]);

  const selectedCategoryObj = useMemo(() => {
    if (category === "All") return null;
    return categories.find(
      (c) => c?.slug?.toLowerCase() === category.toLowerCase(),
    );
  }, [categories, category]);

  const visibleSubcategories = useMemo(() => {
    const items = selectedCategoryObj?.subcategories ?? [];
    return items.filter((sc) => sc?.slug);
  }, [selectedCategoryObj]);

  // const allCategoryNames = useMemo(
  //   () => ["All", ...new Set(categories.map((c) => c.slug).filter(Boolean))],
  //   [categories],
  // );

  const allCategories = useMemo(
    () => [{ id: 0, name: "All", slug: "All" }, ...categories],
    [categories],
  );
  return (
    <main className="min-h-screen bg-[#07111f] text-slate-100">
      {/* B2B Hero Header */}
      <section className="border-b border-slate-700/70 bg-[radial-gradient(circle_at_top_left,#1d4ed830,transparent_36%),linear-gradient(135deg,#07111f,#0f172a_55%,#111827)]">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <div className="grid gap-6 lg:grid-cols-[1fr_420px] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
                <Building2 className="h-4 w-4" />
                Elvarra Wholesale Trade
              </div>

              <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-white md:text-6xl">
                Built for resellers, boutiques and bulk buyers.
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
                Access trade pricing, bulk-ready collections and fast catalogue
                ordering with a professional B2B buying experience.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
                  <PackageCheck className="h-5 w-5 text-cyan-300" />
                  <p className="mt-2 text-sm font-semibold text-white">
                    Bulk Order Ready
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    MOQ and wholesale rules apply
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
                  <BadgePercent className="h-5 w-5 text-cyan-300" />
                  <p className="mt-2 text-sm font-semibold text-white">
                    Trade Pricing
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Wholesale unit price display
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
                  <ShieldCheck className="h-5 w-5 text-cyan-300" />
                  <p className="mt-2 text-sm font-semibold text-white">
                    Verified Supply
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Curated for business buyers
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-cyan-400/20 bg-slate-950/70 p-6 shadow-2xl shadow-cyan-950/40">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
                Wholesale Terms
              </p>
              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between rounded-2xl bg-slate-900 p-4">
                  <span className="text-sm text-slate-300">
                    Minimum order value
                  </span>
                  <span className="font-bold text-white">₹2,000</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-900 p-4">
                  <span className="text-sm text-slate-300">
                    Qty / SKU ratio
                  </span>
                  <span className="font-bold text-white">1.40+</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-900 p-4">
                  <span className="text-sm text-slate-300">
                    Shipping benefit
                  </span>
                  <span className="font-bold text-cyan-300">
                    {money(FREE_SHIP_THRESHOLD)}+
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Filter Toggle */}
      <div className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur border-b border-slate-700 px-4 py-3 flex items-center justify-between md:hidden">
        <button
          onClick={() => setShowFilters(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition"
        >
          <Filter className="w-4 h-4" />
          <span className="text-sm">Trade Filters {isDirty && "•"}</span>
        </button>
        <span className="text-sm text-slate-400">{data.count} items</span>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block">
            <div className="sticky top-6">
              <FilterSidebar
                query={query}
                setQuery={setQuery}
                occasions={occasions}
                category={category}
                categories={categories}
                setCategory={setCategory}
                subcategory={subcategory}
                setSubcategory={setSubcategory}
                occasion={occasion}
                setOccasion={setOccasion}
                minPrice={minPrice}
                setMinPrice={setMinPrice}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                sort={sort}
                setSort={setSort}
                isDirty={isDirty}
                resetFilters={resetFilters}
                setURL={setURL}
              />
            </div>
          </aside>

          {/* Mobile Filters Drawer */}
          {showFilters && (
            <div className="fixed inset-0 z-50 flex md:hidden">
              <div
                className="absolute inset-0 bg-black/60"
                onClick={() => setShowFilters(false)}
              />
              <div className="relative ml-auto w-full max-w-sm bg-slate-900 border-l border-slate-700 p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Trade Filters</h2>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-2 hover:bg-slate-800 rounded-xl"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <FilterSidebar
                  query={query}
                  setQuery={setQuery}
                  categories={categories}
                  occasions={occasions}
                  category={category}
                  setCategory={setCategory}
                  subcategory={subcategory}
                  setSubcategory={setSubcategory}
                  occasion={occasion}
                  setOccasion={setOccasion}
                  minPrice={minPrice}
                  setMinPrice={setMinPrice}
                  maxPrice={maxPrice}
                  setMaxPrice={setMaxPrice}
                  sort={sort}
                  setSort={setSort}
                  isDirty={isDirty}
                  resetFilters={resetFilters}
                  setURL={setURL}
                  onApply={() => setShowFilters(false)}
                />
              </div>
            </div>
          )}

          {/* Main Content */}
          <div>
            {/* Category Chips */}
            <div ref={gridTopRef} />
            <div className="mb-8 overflow-x-auto scrollbar-hide">
              <div className="flex gap-3 pb-2">
                {allCategories.map((c) => {
                  const value = c.slug;
                  const active = category === value;

                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        setCategory(value);
                        setSubcategory("All");
                        setPage(1);
                        setURL({
                          category: value === "All" ? undefined : value,
                          subcategory: undefined,
                          page: 1,
                        });
                      }}
                      className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                        active
                          ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg"
                          : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                      }`}
                    >
                      {c.name}
                    </button>
                  );
                })}
              </div>

              {category !== "All" && visibleSubcategories.length > 1 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setSubcategory("All");
                      setPage(1);
                      setURL({
                        subcategory: undefined,
                        page: 1,
                      });
                    }}
                    className={`px-4 py-2 rounded-full text-xs md:text-sm font-medium transition ${
                      subcategory === "All"
                        ? "bg-white text-black"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    All {selectedCategoryObj?.name}
                  </button>

                  {visibleSubcategories.map((sc) => (
                    <button
                      key={sc.id}
                      onClick={() => {
                        setSubcategory(sc.slug);
                        setPage(1);
                        setURL({
                          subcategory: sc.slug,
                          page: 1,
                        });
                      }}
                      className={`px-4 py-2 rounded-full text-xs md:text-sm font-medium transition ${
                        subcategory === sc.slug
                          ? "bg-cyan-400 text-slate-950"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      {sc.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Results Info */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-slate-400">
                Showing {pageItems.length} of {data.count} wholesale products
              </p>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setURL({ sort: e.target.value });
                }}
                className="bg-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="relevance">Trade Relevance</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="popular">Popular</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
                {pageItems.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-12">
                <button
                  onClick={() => goto(page - 1)}
                  disabled={page <= 1}
                  className="p-3 rounded-xl bg-slate-800 disabled:opacity-50 hover:bg-slate-700 transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-slate-400">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => goto(page + 1)}
                  disabled={page >= totalPages}
                  className="p-3 rounded-xl bg-slate-800 disabled:opacity-50 hover:bg-slate-700 transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Type-Safe Filter Sidebar
// ──────────────────────────────────────────────────────────────────────
interface FilterSidebarProps {
  query: string;
  setQuery: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  subcategory: string;
  setSubcategory: (value: string) => void;

  occasion: string;
  occasions: Ocassion[];
  categories: Category[];
  setOccasion: (value: string) => void;
  minPrice: number;
  setMinPrice: (value: number) => void;
  maxPrice: number;
  setMaxPrice: (value: number) => void;
  sort: string;
  setSort: (value: string) => void;
  isDirty: boolean;
  resetFilters: () => void;
  setURL: (
    update: Partial<{
      category: string;
      occasion: string;
      subcategory: string;
      q: string;
      min: number;
      max: number;
      sort: string;
      page: number;
      tags: string[];
    }>,
  ) => void;
  onApply?: () => void;
}

function FilterSidebar({
  query,
  setQuery,
  category,
  setCategory,
  subcategory,
  setSubcategory,
  categories,
  occasion,
  occasions,
  setOccasion,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  sort,
  setSort,
  isDirty,
  resetFilters,
  setURL,
  onApply,
}: FilterSidebarProps) {
  // const selectedCategoryObj =
  //   category === "All"
  //     ? null
  //     : categories.find(
  //         (c) =>
  //           c?.name?.toLowerCase() === category.toLowerCase() ||
  //           c?.slug?.toLowerCase() === category.toLowerCase(),
  //       );
  const selectedCategoryObj =
    category === "All"
      ? null
      : categories.find(
          (c) => c?.slug?.toLowerCase() === category.toLowerCase(),
        );
  const subcategories = selectedCategoryObj?.subcategories ?? [];
  return (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="text-xs uppercase tracking-wider text-slate-500">
          Search
        </label>
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setURL({ q: e.target.value, subcategory: undefined, page: 1 });
          }}
          placeholder="Search name, SKU, category..."
          className="mt-2 w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-600 focus:border-cyan-500 transition outline-none"
        />
      </div>

      {/* Category */}
      <div>
        <label className="text-xs uppercase tracking-wider text-slate-500">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => {
            const value = e.target.value;
            setCategory(value);
            setSubcategory("All");

            setURL({
              category: value === "All" ? undefined : value,
              subcategory: undefined,
              page: 1,
            });
          }}
          className="mt-2 w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-600 focus:border-cyan-500 outline-none"
        >
          <option value="All">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      {category !== "All" && subcategories.length > 0 && (
        <div>
          <label className="text-xs uppercase tracking-wider text-slate-500">
            Collections
          </label>
          <select
            value={subcategory}
            onChange={(e) => {
              const value = e.target.value;
              setSubcategory(value);
              setURL({
                subcategory: value === "All" ? undefined : value,
                page: 1,
              });
            }}
            className="mt-2 w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-600 focus:border-cyan-500 outline-none"
          >
            <option value="All">Subcategories</option>
            {subcategories.map((sc) => (
              <option key={sc.id} value={sc.slug}>
                {sc.name}
              </option>
            ))}
          </select>
        </div>
      )}
      {/* Occasion */}
      <div>
        <label className="text-xs uppercase tracking-wider text-slate-500">
          Occasion
        </label>
        <select
          value={occasion}
          onChange={(e) => {
            const value = e.target.value;
            setOccasion(value);
            setURL({ occasion: value === "all" ? undefined : value, page: 1 });
          }}
          className="mt-2 w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-600 focus:border-cyan-500 outline-none"
        >
          <option value="all">All Occasions</option>
          {occasions.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs uppercase tracking-wider text-slate-500">
            Min Price
          </label>
          <input
            type="number"
            value={minPrice || ""}
            onChange={(e) => {
              const value = Number(e.target.value) || 0;
              setMinPrice(value);
              setURL({ min: value || undefined, page: 1 });
            }}
            placeholder="0"
            className="mt-2 w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-600 focus:border-cyan-500 outline-none"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-slate-500">
            Max Price
          </label>
          <input
            type="number"
            value={maxPrice || ""}
            onChange={(e) => {
              const value = Number(e.target.value) || 0;
              setMaxPrice(value);
              setURL({ max: value || undefined, page: 1 });
            }}
            placeholder="Any"
            className="mt-2 w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-600 focus:border-cyan-500 outline-none"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 pt-4">
        <button
          onClick={resetFilters}
          disabled={!isDirty}
          className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
        >
          Reset All Filters
        </button>
        {onApply && (
          <button
            onClick={onApply}
            className="py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 font-semibold text-black shadow-lg hover:shadow-cyan-500/25 transition"
          >
            Apply Filters
          </button>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Product Card
// ──────────────────────────────────────────────────────────────────────
function ProductCard({ product: p }: { product: Product }) {
  const isLowStock = p.stock > 0 && p.stock < 3; // 1 or 2 left
  const lowStockText =
    p.stock === 1 ? "Only 1 left" : p.stock === 2 ? "Only 2 left" : "";

  const hoverImage = useMemo(() => {
    // expecting p.images = [{ image: "url" }, ...]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const imgs: any[] = (p as any)?.images ?? [];
    const second = imgs?.[1]?.image;
    return second || null;
  }, [p]);
  return (
    <div className="group relative bg-slate-900/50 rounded-2xl overflow-hidden border border-slate-700 hover:border-cyan-500/50 transition-all duration-300">
      <Link href={`/products/${p.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden">
          {" "}
          {/* Primary image */}
          <Image
            src={p.image}
            alt={p.name}
            width={600}
            height={800}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-500
    ${hoverImage ? "group-hover:opacity-0" : "group-hover:scale-110"}
  `}
          />
          {/* Hover image (only if available) */}
          {hoverImage && (
            <Image
              src={hoverImage}
              alt={`${p.name} - alternate`}
              width={600}
              height={800}
              className="absolute inset-0 w-full h-full object-cover opacity-0
      transition-all duration-500 group-hover:opacity-100 group-hover:scale-110"
            />
          )}
          {p.tag === "bestseller" && (
            <span className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-red-600 text-white text-xs font-bold">
              Bestseller
            </span>
          )}
          {p.tag === "premium" && (
            <span className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-300 to-blue-500 text-black text-xs font-bold flex items-center gap-1">
              <Crown className="w-3 h-3" /> Premium
            </span>
          )}
          {/* Kids / Girls Audience Badge */}
          {p.audience === "kids" && (
            <span className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-pink-500 text-white text-[10px] md:text-xs font-bold shadow-lg">
              🧸 For Kids
            </span>
          )}
          {p.audience === "girls" && (
            <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-fuchsia-600 text-white text-[9px] md:text-xs font-bold shadow-lg">
              <span className="md:hidden">👧 Girls</span>
              <span className="hidden md:inline">👧 Girls • Teen Friendly</span>
            </span>
          )}
          {/* ✅ Low Stock Badge (same style) */}
          {/* ✅ Low Stock Badge (same style) */}
          {isLowStock && (
            <div className="absolute bottom-1 left-2 z-10">
              <span
                className="inline-flex items-center gap-1.5 rounded-full
                bg-rose-600/95 text-white px-3 py-1 text-[10px] md:text-xs
                font-extrabold tracking-wide shadow-lg ring-2 ring-white/20 animate-pulse"
              >
                ⏳ {lowStockText}
              </span>
            </div>
          )}
          {p.is_free_shipping && (
            <span
              className="absolute bottom-1 right-2 flex items-center gap-1 px-2.5 py-1 rounded-full
              bg-black/70 text-cyan-200 border-cyan-300/40
              text-[9px] md:text-xs font-bold uppercase tracking-wider border shadow-lg backdrop-blur sm:flex"
            >
              <Truck className="w-3.5 h-3.5" />
              Free Ship
            </span>
          )}
          {p.stock < 1 && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <span className="text-xl font-bold">Sold Out</span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/products/${p.slug}`} className="block">
          <h3 className="font-medium text-base line-clamp-2  ">{p.name}</h3>
        </Link>
        <div className="flex gap-2 md:gap-3">
          <p className="text-[10px]  md:text-sm text-sm text-slate-500 mt-1">
            {p.category?.name}
            {p.subcategory?.name ? ` • ${p.subcategory.name}` : ""}
          </p>
          <p className=" text-[10px]  md:text-sm text-slate-500 mt-1 text-nowrap ">
            {p.sku}
          </p>
        </div>
        {/* Optional urgency line (nice for conversion) */}
        {isLowStock && (
          <p className="mt-2 text-[11px] md:text-xs font-semibold text-rose-400">
            {lowStockText} — selling fast 🔥
          </p>
        )}

        <div className="mt-3 flex items-center justify-between">
          <div>
            {p.wholesale_price?.[0]?.unit_price ? (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Trade Price
                </p>
                <span className="text-lg font-bold text-cyan-300">
                  {money(p.wholesale_price[0].unit_price)}
                </span>
              </div>
            ) : (
              <span className="text-sm font-semibold text-slate-300">
                Contact for trade pricing
              </span>
            )}
          </div>

          {/* <Link
            href={`/product/${p.slug}`}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-600 hover:border-cyan-500 transition"
          >
            Details
          </Link> */}
        </div>

        <div className="mt-4">
          <AddToCartBtn
            product={p}
            variant={null}
            outofStock={p.stock < 1}
            noPrice={!p.wholesale_price?.[0]?.unit_price}
          />
        </div>
      </div>
    </div>
  );
}
