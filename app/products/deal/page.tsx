"use client";
import { PromoBanner } from "@/components/PromoBanner";
import { api } from "@/lib/api";
import { money } from "@/lib/utils";
import { Product } from "@/types";
import Link from "next/link";
import React, { JSX, useEffect, useState } from "react";

export default function DealsPage() {
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
    <main className={`bg-neutral-950 text-neutral-50 min-h-screen antialiased`}>
      <PromoBanner
        id="flash-deal"
        message="Limited time: extra 10% off on top of deals at checkout"
        ctaText="Use code EXTRA10"
        href="/deals"
        accent="emerald"
      />

      <div className="container py-10">
        <header className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Today’s Deals</h1>
            <p className={`mt-1 text-sm text-neutral-300`}>
              Hand-picked discounts across our bestsellers.
            </p>
          </div>
          <Link
            href="/"
            className={`rounded-xl px-4 py-2 text-sm font-medium bg-gradient-to-r from-yellow-500 to-amber-500 text-neutral-900 hover:brightness-110`}
          >
            Back to shop
          </Link>
        </header>

        <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((d) => (
            <a
              key={d.slug}
              href={`/product/${d.slug}`}
              className={`group relative overflow-hidden rounded-2xl ring-1 ring-neutral-800 bg-neutral-900/70`}
            >
              {<PromoRibbon text="dddd" color="emerald" />}
              <img
                src={d.image}
                alt={d.name}
                className="aspect-[4/5] w-full object-cover"
              />
              <div className="p-3">
                <div className="text-sm font-medium">{d.name}</div>
                <div className="mt-1 text-sm">
                  <span className="mr-2 font-semibold">
                    {money(d.price, "INR")}
                  </span>
                  <span className={`text-xs line-through text-neutral-300`}>
                    {money(d.compare_at_price)}
                  </span>
                </div>
                <span
                  className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-yellow-500 text-neutral-900`}
                >
                  Save{" "}
                  {Math.round(
                    ((d.compare_at_price - d.price) / d.compare_at_price) * 100
                  )}
                  %
                </span>
              </div>
            </a>
          ))}
        </section>
      </div>
    </main>
  );
}

export type PromoRibbonProps = {
  text: string;
  color?: "yellow" | "pink" | "emerald" | "blue";
};

function PromoRibbon({
  text,
  color = "yellow",
}: PromoRibbonProps): JSX.Element {
  const colorBg = (
    {
      yellow: "bg-amber-500 text-neutral-900",
      pink: "bg-pink-500 text-white",
      emerald: "bg-emerald-500 text-white",
      blue: "bg-sky-500 text-white",
    } as const
  )[color];

  return (
    <div
      className={`absolute left-[-30px] top-4 rotate-[-45deg] ${colorBg} px-12 py-1 text-xs font-semibold uppercase shadow`}
    >
      {text}
    </div>
  );
}
