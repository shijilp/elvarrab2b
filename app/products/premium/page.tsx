"use client";
import { api } from "@/lib/api";
import { money } from "@/lib/money";
import { Product } from "@/types";
import Link from "next/link";
import React, { useEffect, useState } from "react";

// --------------------------------------------------------------
// 2) Premium Collection Page
// --------------------------------------------------------------
function PremiumCollectionPage() {
  // Replace this with real data from your API

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([api.get("/portfolio/?tags=deal")])
      .then(([pRes]) => {
        if (!mounted) return;
        setProducts(pRes.data.results ?? pRes.data ?? []);
      })
      .catch((err) => console.error("Failed to fetch:", err))
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main
      className={`bg-neutral-950 text-neutral-50  min-h-screen antialiased`}
    >
      {/* Optional: include <HeaderNav /> globally in layout instead */}

      <section className="container py-10">
        <nav className={`text-xs text-neutral-50`}>
          <Link href="/" className="underline">
            Home
          </Link>{" "}
          / <span>Premium</span>
        </nav>
        <header className="mt-2 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              Elvarra Premium Collection
            </h1>
            <p className={`mt-1 text-sm text-neutral-50`}>
              Our finest pieces — elevated materials, precision finishes,
              limited runs.
            </p>
          </div>
          <Link
            href="/products"
            className={`rounded-xl px-4 py-2 text-sm font-medium bg-gradient-to-r from-yellow-500 to-amber-500 text-neutral-900 hover:brightness-110`}
          >
            Shop all
          </Link>
        </header>

        {/* Feature banner */}
        <div
          className={`mt-6 overflow-hidden rounded-2xl ring-1 ring-neutral-800 bg-neutral-900/70`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3">
            <div className="p-6 md:col-span-2">
              <h2 className="text-lg font-semibold">
                Hand‑polished, hypoallergenic, lifetime shine
              </h2>
              <ul className={`mt-2 list-disc pl-5 text-sm text-neutral-50`}>
                <li>18–24K gold plating over premium base</li>
                <li>AAA zircon / lab diamond options</li>
                <li>2‑year warranty • gift packaging</li>
              </ul>
              <a
                href="#grid"
                className={`mt-4 inline-block rounded-xl px-4 py-2 text-sm font-medium bg-gradient-to-r from-yellow-500 to-amber-500 text-neutral-900 hover:brightness-110`}
              >
                Explore pieces
              </a>
            </div>
            <div className="relative h-48 md:h-auto">
              <img
                src="https://images.unsplash.com/photo-1603561596112-0e8e1f43d0a6?q=80&w=1200&auto=format&fit=crop"
                alt="Premium hero"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Grid */}
        <div
          id="grid"
          className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
        >
          {products.map((p) => (
            <a
              key={p.slug}
              href={`/product/${p.slug}`}
              className={`group overflow-hidden rounded-2xl ring-1 ring-neutral-800 bg-neutral-900/70`}
            >
              <div className="relative">
                <img
                  src={p.image}
                  alt={p.name}
                  className="aspect-[4/5] w-full object-cover"
                />
                <span
                  className={`absolute left-2 top-2 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider bg-yellow-500 text-neutral-900`}
                >
                  Premium
                </span>
              </div>
              <div className="p-3">
                <div className="text-sm font-medium">{p.name}</div>
                <div className="mt-1 text-sm font-semibold">
                  {money(p.price)}
                </div>
                <div className={`mt-1 text-xs text-neutral-50`}>
                  Ships in 24–48h • Free returns
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}

// Default export for canvas preview (renders the collection page)
export default PremiumCollectionPage;
