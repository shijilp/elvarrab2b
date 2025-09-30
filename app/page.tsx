"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import SectionTitle from "@/components/SectionTitle";
import ProductCard from "@/components/ProductCard";
import { api } from "@/lib/api";
import { SkeletonCard } from "@/components/ui/SkeltonCard";
import { Product } from "@/types";
import OccassionTab from "@/components/OccassionTab";

export default function Page() {
  // const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [products, setProducts] = useState<any[]>([]);
  // const [category, setCategory] = useState("All");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [sort, setSort] = useState<string>("featured");

  // useEffect(() => {
  //   api
  //     .get("/products/")
  //     .then((res) => {
  //       setProducts(res.data.results);
  //     })
  //     .catch((err) => console.error("Failed to fetch products:", err));

  //   api
  //     .get("/categories/")
  //     .then((res) => {
  //       setCategories(res.data.results);
  //     })
  //     .catch((err) => console.error("Failed to fetch categories:", err));
  // }, []);

  useEffect(() => {
    let mounted = true;
    Promise.all([api.get("/products/"), api.get("/categories/")])
      .then(([pRes, cRes]) => {
        if (!mounted) return;
        setProducts(pRes.data.results ?? pRes.data ?? []);
        setCategories(cRes.data.results ?? cRes.data ?? []);
      })
      .catch((err) => console.error("Failed to fetch:", err))
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const allCategories = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(
          products.map((p) => p.category?.name).filter(Boolean) as string[]
        )
      ),
    ];
  }, [products]);

  const allCategoryNames = useMemo(() => {
    return [
      "All",
      ...Array.from(new Set(categories.map((c) => c.name).filter(Boolean))),
    ];
  }, [categories]);

  // Derived product list (filter + sort)
  const visibleProducts = useMemo(() => {
    let list = products;
    if (activeCategory !== "All") {
      list = list.filter((p) => p.category?.name === activeCategory);
    }
    switch (sort) {
      case "price-asc":
        return [...list].sort(
          (a, b) => Number(a.price ?? 0) - Number(b.price ?? 0)
        );
      case "price-desc":
        return [...list].sort(
          (a, b) => Number(b.price ?? 0) - Number(a.price ?? 0)
        );
      case "name":
        return [...list].sort((a, b) => a.name.localeCompare(b.name));
      default:
        return list; // featured (keep server order)
    }
  }, [products, activeCategory, sort]);

  //const handleC = async () => {
  //await api.post("orders/send-confirmation/", { order_id: 17 });
  // await api.post("orders/send-shipped/", { order_id: 17 });
  // await api.post("/orders/send-delivered/", { order_id: 17 });
  //};

  return (
    <main className="">
      {/* Hero */}
      {/* <PromoBanner id="promo1" message="Discover our latest collection!" /> */}
      <section className="relative isolate">
        <div className="absolute inset-0 -z-10 opacity-40 blur-3xl  max-w-[100vw] overflow-hidden">
          <div className="pointer-events-none absolute -inset-20 rounded-[100px] gradient-accent" />
        </div>
        <div className="container grid grid-cols-1 gap-8 py-14 lg:grid-cols-2 lg:items-center lg:gap-12 lg:py-20 mx-auto">
          <div>
            <p className="text-xs tracking-[0.25em] opacity-80">ELVARRA</p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
              Where Elegance Meets Light
            </h1>
            <p className="mt-4 max-w-xl text-base text-neutral-300">
              Elvarra brings you hand-finished fashion jewelry crafted in gold,
              silver, and sparkling stones. Designed to elevate your everyday
              style and be loved for years to come. Responsibly sourced. Always
              affordable.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="#bestsellers"
                className="rounded-full px-5 py-3 text-sm font-medium text-neutral-900 hover:brightness-110 dark:text-neutral-900 btn-gradient-accent"
              >
                Shop Bestsellers
              </Link>
              <Link
                href="/products"
                className="rounded-full border border-neutral-200 px-5 py-3 text-sm hover:bg-white/5 dark:border-neutral-800"
              >
                Explore Collections
              </Link>
            </div>
            <div className="mt-6 flex items-center gap-4 text-xs opacity-80">
              <span>• Elegance in Every Detail</span>
              <span>• Luxury, Redefined</span>
              <span>• Crafted to Captivate</span>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-3xl p-2 shadow-2xl ring-1 ring-neutral-200 dark:ring-neutral-800 bg-white/90 dark:bg-neutral-900/70">
              <Image
                src="/images/about-1.jpg"
                alt="Hero jewelry"
                width={640}
                height={640}
                className="h-[420px] w-full rounded-2xl object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Collections */}
      {/* <section id="collections" className="container py-12 lg:py-16 mx-auto">
        <div className="mb-6 flex items-end justify-between">
          <SectionTitle>Featured Collections</SectionTitle>
          <Link
            href="#"
            className="text-sm underline opacity-80 hover:opacity-100"
          >
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {categories.map((c) => (
            <a
              key={c.id}
              href={`#${c.id}`}
              className="group relative overflow-hidden rounded-2xl ring-1 ring-neutral-200 dark:ring-neutral-800"
            >
              <Image
                src={c.icon}
                alt={c.name}
                width={900}
                height={1000}
                className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-3 text-sm font-medium tracking-wide">
                {c.name}
              </div>
            </a>
          ))}
        </div>
      </section> */}

      {/* --------------- Collections --------------- */}
      <section id="collections" className="container mx-auto py-12 lg:py-16">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionTitle>Categories</SectionTitle>
          <Link
            href="/products"
            className="text-sm underline opacity-80 hover:opacity-100"
          >
            View all
          </Link>
        </div>

        {/* Visual collection grid from backend categories */}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={{
                pathname: "/products",
                query: { category: c.slug ?? c.id },
              }}
              className="group relative overflow-hidden rounded-xl md:rounded-2xl ring-1 el-border  ring-neutral-200 dark:ring-neutral-800"
              aria-label={`Open ${c.name} collection`}
            >
              <Image
                src={c.icon ?? "/images/about-2.jpg"}
                alt={c.name}
                width={900}
                height={600} // reduce height
                className="aspect-[4/3] md:aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-2 md:bottom-2 left-2 md:left-3 text-xs md:text-sm sm:text-sm font-medium tracking-wide text-white">
                {c.name}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Bestsellers */}
      {/* <section id="bestsellers" className="container py-12 lg:py-16 mx-auto">
        <div className="mb-6 flex items-end justify-between">
          <SectionTitle>Bestsellers</SectionTitle>
          <div className="flex items-center gap-2 text-xs">
            <button className="rounded-full border border-neutral-200 px-3 py-1.5 dark:border-neutral-800">
              Filter
            </button>
            <button className="rounded-full border border-neutral-200 px-3 py-1.5 dark:border-neutral-800">
              Sort
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section> */}

      {/* ---------------- Bestsellers ---------------- */}
      <section id="bestsellers" className="container mx-auto py-12 lg:py-16">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SectionTitle>Featured Collections</SectionTitle>
          <div className="flex items-center gap-3">
            <SortSelect value={sort} onChange={setSort} />
          </div>
        </div>
        {/* Category chips (filter bestsellers below) */}
        {allCategoryNames.length > 1 && (
          <div className="mb-6">
            <CategoryChips
              categories={allCategoryNames}
              current={activeCategory}
              onChange={setActiveCategory}
            />
          </div>
        )}
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {visibleProducts.map((p) => (
              <ProductCard key={p.id} product={p as Product} />
            ))}
          </div>
        )}
      </section>
      <section className="container mx-auto md:hidden py-6">
        <Link
          href="/products"
          className="inline-flex w-full items-center justify-center rounded-full px-5 py-3
               text-sm font-medium text-neutral-900 dark:text-neutral-900 btn-gradient-accent"
          aria-label="Explore more products"
        >
          Explore our collections
        </Link>
      </section>
      {/* About */}
      <section id="about" className="container py-12 lg:py-16 mx-auto">
        <div className="relative overflow-hidden rounded-3xl p-8 ring-1 ring-neutral-800 bg-neutral-900/70">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <SectionTitle>Our Story</SectionTitle>
              <p className="mt-3  text-neutral-300">
                We craft pieces that celebrate light, form, and everyday luxury.
                Designed in-house and produced in small batches with ethical
                partners. Every collection is a love letter to modern
                femininity—understated, confident, timeless.
              </p>
              <div className="mt-6 flex gap-3 text-xs opacity-80">
                <span>• Nickel-free</span>
                <span>• 18k gold plating</span>
                <span>• Lab-grown stones</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {["about-1.jpg", "about-2.jpg", "about-3.jpg", "about-4.jpg"].map(
                (img) => (
                  <Image
                    key={img}
                    src={`/images/${img}`}
                    alt={img}
                    width={800}
                    height={600}
                    className="h-40 w-full rounded-xl object-cover"
                  />
                )
              )}
            </div>
          </div>
        </div>
      </section>

      <OccassionTab />

      {/* Testimonials */}
      <section className="container py-12 lg:py-16 mx-auto">
        <SectionTitle>What Our Customers Say</SectionTitle>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            "Stunning quality and shine.",
            "Perfect everyday pieces.",
            "Feels premium, looks gorgeous!",
          ].map((quote, i) => (
            <figure
              key={i}
              className="rounded-2xl p-5 ring-1 ring-neutral-800 bg-neutral-900/70"
            >
              <blockquote className="text-neutral-300">“{quote}”</blockquote>
              <figcaption className="mt-3 text-sm">— Verified Buyer</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section id="contact" className="container pb-24 mx-auto">
        <div className="rounded-3xl p-8 ring-1 ring-neutral-800 bg-neutral-900/70">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-center">
            <div className="lg:col-span-2">
              <h3 className="text-xl font-semibold">Join the Circle</h3>
              <p className="mt-2 text-sm text-neutral-300">
                Be first to know about new drops, limited editions, and private
                sales.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <form className="flex w-full gap-2">
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full rounded-xl border  bg-transparent px-4 py-3 text-sm outline-none placeholder:opacity-60 border-neutral-800"
                />
                <button
                  type="button"
                  className="rounded-xl px-5 py-3 text-sm font-medium text-neutral-900 dark:text-neutral-900 btn-gradient-accent"
                >
                  Subscribe
                </button>
              </form>

              {/* Instagram link */}
              <Link
                href="https://instagram.com/elvar.ra"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-medium hover:bg-white/5 border-neutral-800"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                >
                  <path
                    d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 
      0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7zm0-2h10c3.87 
      0 7 3.13 7 7v10c0 3.87-3.13 7-7 7H7c-3.87 
      0-7-3.13-7-7V7c0-3.87 3.13-7 7-7zm5 
      7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 
      2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm4.5-3a1.5 
      1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z"
                  />
                </svg>
                <span className="hidden sm:inline">Follow</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function SortSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-xs">
      <span className="opacity-70">Sort</span>
      <select
        className="rounded-full border border-neutral-200 el-bgn  px-2 py-1.5 dark:border-neutral-800"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="featured">Featured</option>
        <option value="price-asc">Price: Low → High</option>
        <option value="price-desc">Price: High → Low</option>
        <option value="name">Name</option>
      </select>
    </label>
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
          className={`rounded-full border px-3 py-1.5 text-xs transition ${
            current === c
              ? "btn-gradient-accent border-transparent"
              : "border-neutral-200 dark:border-neutral-800 hover:bg-white/5"
          }`}
          aria-pressed={current === c}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
