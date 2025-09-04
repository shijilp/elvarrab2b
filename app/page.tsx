"use client";
import SectionTitle from "@/components/SectionTitle";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { collections } from "@/data/collections";
import { products } from "@/data/products";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <main>
      {/* Hero */}
      <section className="relative isolate  ">
        <div className="absolute inset-0 -z-10 opacity-40 blur-3xl max-w-[100vw] overflow-hidden">
          <div className="pointer-events-none absolute -inset-20 rounded-[100px] gradient-accent" />
        </div>
        <div className="container grid grid-cols-1 gap-8 py-14 lg:grid-cols-2 lg:items-center lg:justify-center lg:gap-12 lg:py-20 mx-auto">
          <div>
            <p className="text-xs tracking-[0.25em] opacity-80">
              NEW COLLECTION
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
              Where Elegance Meets Light
            </h1>
            <p className="mt-4 max-w-xl text-base text-neutral-600 dark:text-neutral-300">
              Hand‑finished pieces in gold, silver, and stones—designed to be
              worn every day and loved for years. Ethical sourcing. Free
              shipping over $75.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="#bestsellers"
                className="rounded-full px-5 py-3 text-sm font-medium text-neutral-900 hover:brightness-110 dark:text-neutral-900 gradient-accent"
              >
                Shop Bestsellers
              </a>
              <a
                href="#collections"
                className="rounded-full border border-neutral-200 px-5 py-3 text-sm hover:bg-white/5 dark:border-neutral-800"
              >
                Explore Collections
              </a>
            </div>
            <div className="mt-6 flex items-center gap-4 text-xs opacity-80">
              <span>• Free 30‑day returns</span>
              <span>• 2‑year warranty</span>
              <span>• Hypoallergenic</span>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-3xl p-2 shadow-2xl ring-1 ring-neutral-200 dark:ring-neutral-800 bg-white/90 dark:bg-neutral-900/70">
              <Image
                src="/images/hero.jpg"
                alt="Hero jewelry"
                width={1200}
                height={800}
                className="h-[420px] w-full rounded-2xl object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Collections */}
      <section id="collections" className="container py-12 lg:py-16 mx-auto">
        <div className="mb-6 flex items-end justify-between">
          <SectionTitle>Featured Collections</SectionTitle>
          <Link
            href="#"
            className="text-sm underline opacity-80 hover:opacity-100"
          >
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4  justify-items-center">
          {collections.map((c) => (
            <a
              key={c.id}
              href={`#${c.id}`}
              className="group relative overflow-hidden rounded-2xl ring-1 ring-neutral-200 dark:ring-neutral-800"
            >
              <Image
                src={c.image}
                alt={c.title}
                width={900}
                height={1000}
                className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-3 text-sm font-medium tracking-wide">
                {c.title}
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Bestsellers */}
      <section id="bestsellers" className="container py-12 lg:py-16 mx-auto">
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
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 justify-items-center">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" className="container py-12 lg:py-16 mx-auto">
        <div className="relative overflow-hidden rounded-3xl p-8 ring-1 ring-neutral-200 dark:ring-neutral-800 bg-white/90 dark:bg-neutral-900/70">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <SectionTitle>Our Story</SectionTitle>
              <p className="mt-3 text-neutral-600 dark:text-neutral-300">
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
              className="rounded-2xl p-5 ring-1 ring-neutral-200 dark:ring-neutral-800 bg-white/90 dark:bg-neutral-900/70"
            >
              <blockquote className="text-neutral-600 dark:text-neutral-300">
                “{quote}”
              </blockquote>
              <figcaption className="mt-3 text-sm">— Verified Buyer</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section id="contact" className="container pb-24 mx-auto">
        <div className="rounded-3xl p-8 ring-1 ring-neutral-200 dark:ring-neutral-800 bg-white/90 dark:bg-neutral-900/70">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-center">
            <div className="lg:col-span-2">
              <h3 className="text-xl font-semibold">Join the Circle</h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
                Be first to know about new drops, limited editions, and private
                sales.
              </p>
            </div>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-xl border border-neutral-200 bg-transparent px-4 py-3 text-sm outline-none placeholder:opacity-60 dark:border-neutral-800"
              />
              <button
                type="submit"
                className="rounded-xl px-5 py-3 text-sm font-medium text-neutral-900 dark:text-neutral-900 gradient-accent"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-neutral-600 dark:text-neutral-300">
          © {new Date().getFullYear()} Elvarra — All rights reserved.
        </p>
      </section>
    </main>
  );
}
