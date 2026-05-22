"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Product, Variant } from "@/types";

// Zoom needs CSS; keep it client-only
import "react-medium-image-zoom/dist/styles.css";

import TagBadge from "@/components/ui/TagBadge";
import Link from "next/link";
import { money } from "@/lib/money";
import AddToRFQBtn from "./ui/AddToRfqBtn";
import AddToRFQBtn2 from "./ui/AddToRfqBtn2";
import { useRFQCart } from "@/context/RFQCartContext";
type WholesaleTier = { min_qty: number; unit_price: number | string };
type ProductWithTiers = Product & { wholesale_price?: WholesaleTier[] };

const Zoom = dynamic(() => import("react-medium-image-zoom"), { ssr: false });

type ParamShape = { slug: string };
function stockLabel(p: Product) {
  if (p.stock > 0) {
    if (p.low_stock_threshold && p.stock <= p.low_stock_threshold)
      return "Low stock";
    return "In stock";
  }
  if (p.stock < 1 && p.backorder_allowed) return "Backorder available";
  return "Out of stock";
}
const tierForQty = (tiers: WholesaleTier[] = [], qty: number) =>
  [...tiers]
    .sort((a, b) => b.min_qty - a.min_qty)
    .find((t) => qty >= t.min_qty);

// Lowest “from” price
const lowestTier = (tiers: WholesaleTier[] = []) =>
  [...tiers].sort((a, b) => Number(a.unit_price) - Number(b.unit_price))[0];

const ProductPageClient: React.FC = () => {
  const params = useParams<ParamShape>();
  const router = useRouter();
  const { rfq /*, updateQty if you want tier buttons to bump RFQ line too*/ } =
    useRFQCart();
  const slug = params?.slug;
  const [product, setProduct] = useState<Product | null>(null);

  const rawTiers = (product?.wholesale_price ?? []) as Array<{
    min_qty: number;
    unit_price: number;
  }>;
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);

  const tiers = useMemo(
    () => [...rawTiers].sort((a, b) => a.min_qty - b.min_qty),
    [rawTiers],
  );
  console.log("Tiers:", tiers);
  const initialMOQ = tiers.length ? tiers[0].min_qty : 1;
  console.log("Initial MOQ:", initialMOQ);
  const [orderQty, setOrderQty] = useState<number>(initialMOQ);

  useEffect(() => {
    if (tiers.length && orderQty < tiers[0].min_qty) {
      setOrderQty(tiers[0].min_qty);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tiers?.[0]?.min_qty]);
  const line = useMemo(
    () => rfq?.items?.find((it) => it.product === product?.id) ?? null,
    [rfq?.items, product?.id],
  );
  const displayQty = line?.requested_qty ?? orderQty;
  const activeTier = useMemo(() => {
    if (!tiers.length) return null;
    return (
      [...tiers].reverse().find((t) => displayQty >= t.min_qty) ?? tiers[0]
    );
  }, [tiers, displayQty]);
  const fromTier = lowestTier(tiers);
  const unit = Number(activeTier?.unit_price ?? product?.price ?? 0);
  const estimate = useMemo(() => displayQty * unit, [displayQty, unit]);

  // Fetch
  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await api.get(`/b2b/catalogs/${slug}/`);
        if (cancelled) return;
        setProduct(res.data);
        setSelectedVariant((res.data as Product).variants?.[0] ?? null);

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
      url && !seen.has(url) ? (seen.add(url), true) : false,
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

  const isOutOfStock = product ? product.stock < 1 : false;

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
  const hasCompare =
    product.compare_at_price &&
    Number(product.compare_at_price) > Number(product.price);
  const currency = selectedVariant || product.currency;

  return (
    <main className="min-h-screen bg-elvarra text-elvarra antialiased">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 text-xs opacity-80">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/products" className="hover:opacity-80">
              Products
            </Link>
          </li>
          <li>›</li>
          <li>
            <Link
              href={`/category/${product.category?.slug}`}
              className="hover:opacity-80"
            >
              {product.category?.name}
            </Link>
          </li>
          <li>›</li>
          <li className="opacity-90">{product.name}</li>
        </ol>
      </nav>
      {/* Product */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          {/* GALLERY */}
          <div className="w-full relative">
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
            {isOutOfStock && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white font-semibold text-sm z-10">
                Out of Stock
              </div>
            )}

            {/* Thumbs: mobile horizontal, desktop vertical left rail */}
            {/* Desktop vertical rail */}
            {gallery.length > 1 && (
              <div className="mt-3 w-full overflow-x-auto">
                <div className="   flex gap-2 pb-1 snap-x snap-mandatory">
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
            <span
              className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider bg-elvarra/10 text-elvarra inline-block mb-2`}
            >
              {product?.tag}
            </span>
            <h1 className="text-2xl sm:text-3xl font-semibold">
              {product.name}
            </h1>
            {/* Price */}
            <div className="mt-2 flex flex-wrap items-baseline gap-3">
              {tiers.length > 0 ? (
                <>
                  {/* “From” price */}
                  <span className="text-lg sm:text-xl font-medium">
                    From{" "}
                    {money(
                      Number(fromTier?.unit_price ?? product.price),
                      product.currency,
                    )}
                  </span>

                  {/* Live price for entered qty */}
                  {activeTier && (
                    <span className="text-sm rounded-full px-2 py-1 bg-emerald-900/20 ring-1 ring-emerald-700/30 text-emerald-200">
                      {orderQty} pcs →{" "}
                      {money(Number(activeTier.unit_price), product.currency)} /
                      pc
                    </span>
                  )}
                </>
              ) : (
                // Fallback to retail
                <>
                  <span className="text-lg sm:text-xl font-medium">
                    {/* <p className=" text-zinc-500">Contact for Price</p> */}
                  </span>
                </>
              )}
            </div>

            {/* Stock / Inventory / Backorder */}
            <div className="mt-2 text-sm">
              <span
                className={`inline-flex items-center rounded-lg px-2 py-1 ring-1 ${
                  product.stock > 0
                    ? "ring-green-500/40 text-green-400"
                    : product.backorder_allowed
                      ? "ring-amber-500/40 text-amber-400"
                      : "ring-rose-500/40 text-rose-400"
                }`}
                title={`Inventory: ${product.stock}${
                  product.backorder_allowed ? " (backorders allowed)" : ""
                }`}
              >
                {stockLabel(product)}
              </span>
              {product.stock > 0 &&
                product.low_stock_threshold &&
                product.stock <= product.low_stock_threshold && (
                  <span className="ml-2 text-xs opacity-70">
                    Only {product.stock} left
                  </span>
                )}
            </div>

            {product.description && (
              <p className="mt-4 text-sm leading-6 opacity-90">
                {product.description}
              </p>
            )}
            <div className={`mt-3 grid grid-cols-2 gap-3 text-xs el-subfgn`}>
              <div className={`rounded-xl el-ringn el-cardn p-3`}>
                MOQ: <span className="font-medium text-current">3 units</span>
              </div>

              <div className={`rounded-xl el-ringn el-cardn p-3`}>
                Lead time:{" "}
                <span className="font-medium text-current">
                  {product?.id && `3 - 10`} days
                </span>
              </div>
            </div>

            {tiers.length > 0 && (
              <div className="mt-3 rounded-2xl ring-1 ring-neutral-800 bg-neutral-900/70 p-3">
                <div className="mb-2 text-xs uppercase tracking-wider opacity-80">
                  Wholesale tiers
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {tiers.map((t) => {
                    const isActive =
                      !!activeTier && activeTier.min_qty === t.min_qty;
                    return (
                      <button
                        key={t.min_qty}
                        type="button"
                        onClick={() =>
                          setOrderQty(Math.max(orderQty, t.min_qty))
                        }
                        className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm
              ${
                isActive
                  ? "border-amber-400 bg-amber-400/10 text-amber-200"
                  : "el-bordern hover:bg-white/5"
              }`}
                        title={`${t.min_qty}+ pcs at ${money(
                          Number(t.unit_price),
                          product.currency,
                        )} each`}
                      >
                        <span>{t.min_qty}+ pcs</span>
                        <span className="font-semibold">
                          {money(Number(t.unit_price), product.currency)}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {/* Extended calc: line total at current qty */}
                {/* Estimate (tracks tier buttons until added; RFQ +/- after added) */}
                {tiers.length > 0 && (
                  <div className="mt-3 text-sm flex items-center justify-between">
                    <span className="opacity-80">
                      Estimate ({displayQty} ×{" "}
                      {unit.toLocaleString(undefined, {
                        style: "currency",
                        currency: product?.currency || "INR",
                      })}
                      )
                    </span>
                    <span className="font-medium">
                      {(displayQty * unit).toLocaleString(undefined, {
                        style: "currency",
                        currency: product?.currency || "INR",
                      })}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Options */}
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs uppercase tracking-wider opacity-80">
                  Metal
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    className={`rounded-xl border el-bordern px-3 py-2 text-sm hover:bg-white/5`}
                    aria-label={`Choose metal Gold`}
                  >
                    {product.spec && product.spec.base_material}
                  </button>
                </div>
              </div>
              {/* <div>
                <label className="mb-2 block text-xs uppercase tracking-wider opacity-80">
                  Length
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    className={`rounded-xl border el-bordern px-3 py-2 text-sm hover:bg-white/5`}
                    aria-label={`Choose length 16`}
                  >
                    16 inches
                  </button>
                </div>
              </div> */}
            </div>
            {/* <ul className="mt-6 list-disc space-y-1 pl-5 text-sm"> {product.details.map((d, i) => ( <li key={i}>{d}</li> ))} </ul> */}
            <div className="mt-7 grid grid-cols-2 gap-3">
              {/* <button
                type="button"
                className="col-span-2 sm:col-span-1 rounded-xl border border-elvarra px-5 py-3 text-sm hover:bg-white/5"
              >
                Wishlist
              </button> */}
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {/* <Link
                href="/wholesale-inquiry"
                className={`flex-1 rounded-xl px-5 py-3 text-sm font-medium btn-gradient-accent text-center`}
              >
                Request Wholesale Quote
              </Link> */}
              <AddToRFQBtn2
                product={product}
                quantity={orderQty}
                minQty={initialMOQ}
              />

              {/* <button
                className={`rounded-xl border el-bordern px-4 py-3 text-sm`}
              >
                Download Spec Sheet
              </button> */}
            </div>

            {/*    <div className="mt-6 space-y-3">
              {[
                {
                  q: "Materials & Specs",
                  a: "Brass base, 18k gold plating (0.3–0.5μm), lab‑grown stone. Individual polybag + insert card; retail box optional.",
                },
                {
                  q: "Packaging Options",
                  a: "Standard OPP bag, velvet pouch, or branded rigid box. Barcode & price labels available.",
                },
                {
                  q: "Shipping Terms",
                  a: "FOB, CIF, DAP available. Consolidation support for multi‑SKU POs.",
                },
                {
                  q: "After‑Sales",
                  a: "2‑year limited warranty. Batch replacement for manufacturing defects.",
                },
              ].map((item, i) => (
                <details
                  key={i}
                  className={`group rounded-2xl el-ringn el-cardn p-4`}
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium">
                    <span>{item.q}</span>
                    <span className="ml-4 transition group-open:rotate-45 opacity-60">
                      ＋
                    </span>
                  </summary>
                  <p className={`mt-2 text-sm el-subfgn`}>{item.a}</p>
                </details>
              ))}
            </div> */}

            {/* Attributes grid */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="rounded-2xl ring-1  ring-neutral-800   p-4 bg-neutral-900/70">
                <h3 className="font-medium mb-2">Details</h3>
                <ul className="space-y-1 opacity-90">
                  <li>
                    <span className="opacity-70">SKU:</span> {product.sku}
                  </li>
                  {product.brand && (
                    <li>
                      <span className="opacity-70">Brand:</span> {product.brand}
                    </li>
                  )}
                  {product.gtin && (
                    <li>
                      <span className="opacity-70">GTIN:</span> {product.gtin}
                    </li>
                  )}
                  {product.mpn && (
                    <li>
                      <span className="opacity-70">MPN:</span> {product.mpn}
                    </li>
                  )}
                  <li>
                    <span className="opacity-70">Category:</span>{" "}
                    {product.category?.name}
                  </li>
                  <li>
                    <span className="opacity-70">Currency:</span>{" "}
                    {product.currency}
                  </li>
                  {/* {product.tag && (
                    <li>
                      <span className="opacity-70">Tag:</span> {product.tag}
                    </li>
                  )} */}
                  <li>
                    <span className="opacity-70">Active:</span>{" "}
                    {product.is_active ? "Yes" : "No"}
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl ring-1 ring-neutral-800   p-4 bg-neutral-900/70">
                <h3 className="font-medium mb-2">Dimensions</h3>
                <ul className="space-y-1 opacity-90">
                  <li>
                    <span className="opacity-70">Weight:</span>{" "}
                    {product.weight_kg ?? "—"} kg
                  </li>
                  <li>
                    <span className="opacity-70">Length:</span>{" "}
                    {product.length_cm ?? "—"} cm
                  </li>
                  <li>
                    <span className="opacity-70">Width:</span>{" "}
                    {product.width_cm ?? "—"} cm
                  </li>
                  <li>
                    <span className="opacity-70">Height:</span>{" "}
                    {product.height_cm ?? "—"} cm
                  </li>
                </ul>
              </div>
            </div>

            {/* Spec */}
            {product.spec && (
              <div className="mt-8 rounded-2xl ring-1 p-4 text-sm ring-neutral-800   bg-neutral-900/70">
                <h3 className="font-medium mb-2">Material & Finish</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 opacity-90">
                  <li>
                    <span className="opacity-70">Base material:</span>{" "}
                    {product.spec.base_material}
                  </li>
                  {product.spec.silver_fineness != null && (
                    <li>
                      <span className="opacity-70">Silver fineness:</span>{" "}
                      {product.spec.silver_fineness}
                    </li>
                  )}
                  {product.spec.gold_karat != null && (
                    <li>
                      <span className="opacity-70">Gold karat:</span>{" "}
                      {product.spec.gold_karat}K
                    </li>
                  )}
                  {product.spec.plating_type && (
                    <li>
                      <span className="opacity-70">Plating:</span>{" "}
                      {product.spec.plating_type}
                    </li>
                  )}
                  {product.spec.plating_thickness_microns != null && (
                    <li>
                      <span className="opacity-70">Plating thickness:</span>{" "}
                      {product.spec.plating_thickness_microns}μm
                    </li>
                  )}
                  {product.spec.coating && (
                    <li>
                      <span className="opacity-70">Coating:</span>{" "}
                      {product.spec.coating}
                    </li>
                  )}
                  {product.spec.hypoallergenic != null && (
                    <li>
                      <span className="opacity-70">Hypoallergenic:</span>{" "}
                      {product.spec.hypoallergenic ? "Yes" : "No"}
                    </li>
                  )}
                  {product.spec.water_resistant != null && (
                    <li>
                      <span className="opacity-70">Water resistant:</span>{" "}
                      {product.spec.water_resistant ? "Yes" : "No"}
                    </li>
                  )}
                  {product.spec.nickel_free != null && (
                    <li>
                      <span className="opacity-70">Nickel-free:</span>{" "}
                      {product.spec.nickel_free ? "Yes" : "No"}
                    </li>
                  )}
                  {product.spec.lead_free != null && (
                    <li>
                      <span className="opacity-70">Lead-free:</span>{" "}
                      {product.spec.lead_free ? "Yes" : "No"}
                    </li>
                  )}
                  {product.spec.cadmium_free != null && (
                    <li>
                      <span className="opacity-70">Cadmium-free:</span>{" "}
                      {product.spec.cadmium_free ? "Yes" : "No"}
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related */}
      {/*  <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-lg sm:text-xl font-semibold">You may also like</h2>
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-2xl ring-1 ring-neutral-800   bg-neutral-900/70 card-elvarra p-2"
            >
              <div className="relative w-full aspect-[4/5] overflow-hidden rounded-xl">
                <Image
                  src="/images/about-1.jpg"
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
      </section> */}
    </main>
  );
};

export default ProductPageClient;
