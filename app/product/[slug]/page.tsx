"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Product } from "@/types";

// Zoom needs CSS; keep it client-only
import "react-medium-image-zoom/dist/styles.css";
import AddToCartBtn from "@/components/ui/AddToCartBtn";
import TagBadge from "@/components/ui/TagBadge";

// const product = { // id: 1, // name: "Luna Drop Earrings",
//  // price: "$69", // images: [ // "https://images.unsplash.com/photo-1631049035182-249067d76152?q=80&w=1200&auto=format&fit=crop", //
// "https://images.unsplash.com/photo-1603561596112-0a132b3f78a0?q=80&w=1200&auto=format&fit=crop",
// // "https://images.unsplash.com/photo-1589924641763-c68a3abf2f40?q=80&w=1200&auto=format&fit=crop", // ],
// // description: // "Hand‑finished earrings with 18k gold plating and cubic zirconia stones. Hypoallergenic and lightweight for daily wear.",
// // details: [ // "18k gold plating", // "Nickel‑free & hypoallergenic", // "2‑year warranty", // "Designed in-house", // ], // };
const Zoom = dynamic(() => import("react-medium-image-zoom"), { ssr: false });

type ParamShape = { slug: string };

const ProductPage: React.FC = () => {
  const params = useParams<ParamShape>();
  const router = useRouter();
  const slug = params?.slug;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch
  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await api.get(`/products/${slug}/`);
        if (cancelled) return;
        setProduct(res.data);
        setError(null);
      } catch (e) {
        console.error("Product load failed:", e);
        if (!cancelled) {
          setProduct(null);
          setError("Product not found");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Build gallery safely
  const gallery: string[] = useMemo(() => {
    const primary = product?.image ? [product.image] : [];
    const others = (product?.images || [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((im: any) => (typeof im === "string" ? im : im?.image))
      .filter(Boolean) as string[];
    // dedupe while preserving order
    const seen = new Set<string>();
    return [...primary, ...others].filter((url) =>
      url && !seen.has(url) ? (seen.add(url), true) : false
    );
  }, [product]);

  // Set main image
  useEffect(() => {
    if (gallery.length > 0) setMainImage(gallery[0]);
  }, [gallery]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="aspect-square rounded-2xl bg-white/5 border border-[var(--border)] animate-pulse" />
          <div className="space-y-4">
            <div className="h-7 w-3/4 rounded bg-[var(--surface)] animate-pulse" />
            <div className="h-5 w-1/3 rounded bg-[var(--surface)] animate-pulse" />
            <div className="h-12 w-40 rounded bg-[var(--surface)] animate-pulse" />
            <div className="h-24 w-full rounded bg-[var(--surface)] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }
  const isOutOfStock = product ? !product.in_stock : true;

  // Soft 404 in client (avoid server-only notFound())
  if (!product || error) {
    return (
      <main className="min-h-[60vh] mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-2xl font-semibold">Product not found</h1>
        <p className="mt-2 opacity-80">
          The item you’re looking for isn’t available.{" "}
          <button
            onClick={() => router.push("/products")}
            className="underline underline-offset-4 hover:opacity-80"
          >
            Browse all products
          </button>
          .
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-elvarra text-elvarra antialiased">
      {/* Product */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          {/* GALLERY */}
          <div className="w-full">
            {/* Main image */}
            {mainImage && (
              <Zoom>
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden ring-1 ring-elvarra/20">
                  {product.tag && <TagBadge tag={product.tag} />}
                  <Image
                    src={mainImage}
                    alt={product.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                    priority
                  />
                </div>
              </Zoom>
            )}

            {/* Thumbs: mobile horizontal, desktop vertical left rail */}
            {/* Desktop vertical rail */}
            {gallery.length > 1 && (
              <div className="mt-3 w-full overflow-x-auto">
                <div className="flex gap-2 pb-1 snap-x snap-mandatory">
                  {gallery.map((img, idx) => {
                    const active = mainImage === img;
                    return (
                      <button
                        key={idx}
                        onClick={() => setMainImage(img)}
                        aria-label={`View image ${idx + 1}`}
                        className={`relative w-20 h-20 rounded-xl overflow-hidden border transition shrink-0 snap-start outline-none focus:ring-2 focus:ring-[var(--brand)] ${
                          active
                            ? "border-[var(--brand)] ring-2 ring-[var(--brand)]"
                            : "border-[var(--border)] hover:border-[var(--brand)]/60"
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`${product.name} thumbnail ${idx + 1}`}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* INFO */}
          <div className="w-full">
            <h1 className="text-2xl sm:text-3xl font-semibold">
              {product.name}
            </h1>
            {product.price && (
              <p className="mt-2 text-lg sm:text-xl font-medium">
                {product.price}
              </p>
            )}
            {product.description && (
              <p className="mt-4 text-sm leading-6 opacity-90">
                {product.description}
              </p>
            )}
            {/* <ul className="mt-6 list-disc space-y-1 pl-5 text-sm"> {product.details.map((d, i) => ( <li key={i}>{d}</li> ))} </ul> */}
            <div className="mt-7 grid grid-cols-2 gap-3">
              <AddToCartBtn
                product={product}
                outofStock={isOutOfStock}
                className={`col-span-2 sm:col-span-1 rounded-xl px-5 py-3 text-sm font-medium bg-gradient-to-r from-rose-400 to-pink-500 text-white hover:brightness-110 dark:from-yellow-500 dark:to-amber-500 dark:text-neutral-900`}
              />
              <button
                type="button"
                className="col-span-2 sm:col-span-1 rounded-xl border border-elvarra px-5 py-3 text-sm hover:bg-white/5"
              >
                Wishlist
              </button>
            </div>

            <div className="mt-6 text-xs opacity-80 space-y-1">
              <p>• Free shipping over $75</p>
              <p>• Delivery in 3–5 business days</p>
              <p>• Easy 30-day returns</p>
            </div>
          </div>
        </div>
      </section>

      {/* Related */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-lg sm:text-xl font-semibold">You may also like</h2>
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-2xl ring-1 ring-elvarra/30 card-elvarra p-2"
            >
              <div className="relative w-full aspect-[4/5] overflow-hidden rounded-xl">
                <Image
                  src=""
                  alt="Related product"
                  fill
                  sizes="(max-width:1024px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
              <div className="p-2">
                <p className="text-sm font-medium">Sample Product {i}</p>
                <span className="text-sm opacity-80">$79</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default ProductPage;
