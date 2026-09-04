"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";

import { api } from "@/lib/api";
import { money } from "@/lib/money";
import { trackEvent } from "@/lib/analytics";
import type { Product, Variant } from "@/types";
import AddToCartBtn from "./ui/AddToCartBtn";

import "react-medium-image-zoom/dist/styles.css";

const Zoom = dynamic(() => import("react-medium-image-zoom"), { ssr: false });

type ParamShape = { slug: string };
type WholesaleTier = { min_qty: number; unit_price: number | string };

function stockLabel(product: Product) {
  if (product.stock > 0) {
    if (
      product.low_stock_threshold &&
      product.stock <= product.low_stock_threshold
    ) {
      return "Low stock";
    }
    return "In stock";
  }

  if (product.backorder_allowed) return "Backorder available";
  return "Out of stock";
}

function stockClasses(product: Product) {
  if (product.stock > 0) {
    return product.low_stock_threshold &&
      product.stock <= product.low_stock_threshold
      ? "border-amber-400/30 bg-amber-500/10 text-amber-200"
      : "border-emerald-400/30 bg-emerald-500/10 text-emerald-200";
  }

  return product.backorder_allowed
    ? "border-amber-400/30 bg-amber-500/10 text-amber-200"
    : "border-rose-400/30 bg-rose-500/10 text-rose-200";
}

function cleanValue(value?: string | number | null, suffix = "") {
  if (value === undefined || value === null || value === "") return "—";
  return `${value}${suffix}`;
}

export default function ProductPageClient({
  initialProduct,
}: {
  initialProduct?: Product;
}) {
  const params = useParams<ParamShape>();
  const router = useRouter();
  const slug = params?.slug;

  const [product, setProduct] = useState<Product | null>(
    initialProduct ?? null,
  );
  const [loading, setLoading] = useState(!initialProduct);
  const [error, setError] = useState<string | null>(null);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [orderQty, setOrderQty] = useState(1);

  const tiers = useMemo<WholesaleTier[]>(() => {
    return [...(product?.wholesale_price ?? [])]
      .map((tier) => ({
        min_qty: Number(tier.min_qty),
        unit_price: Number(tier.unit_price),
      }))
      .filter(
        (tier) =>
          Number.isFinite(tier.min_qty) &&
          tier.min_qty > 0 &&
          Number.isFinite(Number(tier.unit_price)),
      )
      .sort((a, b) => a.min_qty - b.min_qty);
  }, [product?.wholesale_price]);

  const activeTier = useMemo(() => {
    if (!tiers.length) return null;
    return (
      [...tiers].reverse().find((tier) => orderQty >= tier.min_qty) ?? tiers[0]
    );
  }, [tiers, orderQty]);

  const bestTier = useMemo(() => {
    if (!tiers.length) return null;
    return [...tiers].sort(
      (a, b) => Number(a.unit_price) - Number(b.unit_price),
    )[0];
  }, [tiers]);

  const unitPrice = Number(activeTier?.unit_price ?? product?.price ?? 0);
  const estimatedTotal = orderQty * unitPrice;

  useEffect(() => {
    if (!slug) return;

    if (initialProduct?.slug === slug) {
      setSelectedVariant(
        initialProduct.variants?.length === 1
          ? initialProduct.variants[0]
          : null,
      );
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const response = await api.get(`/b2b/catalogs/${slug}/`);
        if (cancelled) return;

        const loadedProduct = response.data as Product;
        setProduct(loadedProduct);
        setSelectedVariant(
          loadedProduct.variants?.length === 1
            ? loadedProduct.variants[0]
            : null,
        );
        setError(null);
      } catch (loadError) {
        console.error("Product load failed:", loadError);
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
  }, [slug, initialProduct]);

  useEffect(() => {
    if (!product) return;

    trackEvent({
      event_type: "product_view",
      product_id: product.id,
      product_slug: product.slug,
      category: product.category?.name || "",
      meta: {
        ga4: {
          currency: product.currency || "INR",
          value: Number(
            product.wholesale_price?.[0]?.unit_price ?? product.price ?? 0,
          ),
          items: [
            {
              item_id: product.sku || String(product.id),
              item_name: product.name,
              item_category: product.category?.name || "",
            },
          ],
        },
      },
    });
  }, [product?.id]);

  const gallery = useMemo(() => {
    const primary = product?.image ? [product.image] : [];
    const additional = (product?.images ?? [])
      .map((image) => {
        if (typeof image === "string") return image;
        const item = image as typeof image & { image_url?: string | null };
        return item.image_url || item.image;
      })
      .filter(Boolean) as string[];

    return Array.from(new Set([...primary, ...additional]));
  }, [product]);

  useEffect(() => {
    if (gallery.length) setMainImage(gallery[0]);
  }, [gallery]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#06111f] text-slate-100">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="aspect-square animate-pulse rounded-3xl border border-slate-800 bg-slate-900/60" />
            <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/40 p-6">
              <div className="h-5 w-28 animate-pulse rounded bg-slate-800" />
              <div className="h-9 w-4/5 animate-pulse rounded bg-slate-800" />
              <div className="h-7 w-40 animate-pulse rounded bg-slate-800" />
              <div className="h-24 w-full animate-pulse rounded bg-slate-800" />
              <div className="h-12 w-full animate-pulse rounded bg-slate-800" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!product || error) {
    return (
      <main className="min-h-[70vh] bg-[#06111f] text-slate-100">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-xl rounded-3xl border border-slate-800 bg-slate-950/60 p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
              Elvarra Wholesale
            </p>
            <h1 className="mt-3 text-2xl font-semibold text-white">
              Product not found
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              This trade product is no longer available or the product link has
              changed.
            </p>
            <button
              onClick={() => router.push("/catalog")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/20"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to catalog
            </button>
          </div>
        </div>
      </main>
    );
  }

  const isOutOfStock = product.stock < 1;
  const hasOnlinePrice = tiers.length > 0;
  const currency = product.currency || "INR";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#06111f] text-slate-100 antialiased">
      <div className="pointer-events-none absolute inset-0 -z-0 bg-[radial-gradient(circle_at_12%_8%,rgba(37,99,235,0.14),transparent_30%),radial-gradient(circle_at_90%_18%,rgba(6,182,212,0.10),transparent_26%),linear-gradient(180deg,#06111f_0%,#071827_48%,#020617_100%)]" />

      <nav className="relative z-10 mx-auto max-w-7xl px-4 pt-6 text-xs text-slate-400 sm:px-6 lg:px-8">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/catalog" className="transition hover:text-cyan-300">
              Wholesale Catalog
            </Link>
          </li>
          {product.category?.name ? (
            <>
              <li className="text-slate-600">/</li>
              <li>
                <Link
                  href={`/catalog?category=${encodeURIComponent(
                    product.category.name,
                  )}`}
                  className="transition hover:text-cyan-300"
                >
                  {product.category.name}
                </Link>
              </li>
            </>
          ) : null}
          <li className="text-slate-600">/</li>
          <li className="max-w-[55vw] truncate text-slate-300">
            {product.name}
          </li>
        </ol>
      </nav>

      <section className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="min-w-0">
            <div className="rounded-3xl border border-slate-800 bg-slate-950/55 p-2 shadow-[0_24px_80px_-45px_rgba(34,211,238,.45)] backdrop-blur-sm sm:p-3">
              {mainImage ? (
                <Zoom>
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-900">
                    <Image
                      src={mainImage}
                      alt={product.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 55vw"
                      className="object-cover"
                      priority
                    />

                    {product.tag ? (
                      <span className="absolute left-4 top-4 rounded-full border border-cyan-300/30 bg-slate-950/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200 backdrop-blur">
                        {product.tag}
                      </span>
                    ) : null}

                    {isOutOfStock && !product.backorder_allowed ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-950/65 backdrop-blur-[1px]">
                        <span className="rounded-full border border-rose-400/40 bg-rose-500/15 px-4 py-2 text-sm font-semibold text-rose-100">
                          Out of stock
                        </span>
                      </div>
                    ) : null}
                  </div>
                </Zoom>
              ) : (
                <div className="grid aspect-square place-items-center rounded-2xl bg-slate-900 text-sm text-slate-500">
                  Product image unavailable
                </div>
              )}
            </div>

            {gallery.length > 1 ? (
              <div className="mt-3 overflow-x-auto pb-1">
                <div className="flex gap-2">
                  {gallery.map((image, index) => {
                    const active = image === mainImage;
                    return (
                      <button
                        key={`${image}-${index}`}
                        type="button"
                        onClick={() => setMainImage(image)}
                        aria-label={`View product image ${index + 1}`}
                        className={[
                          "relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border bg-slate-900 transition",
                          active
                            ? "border-cyan-300 ring-2 ring-cyan-400/30"
                            : "border-slate-800 hover:border-cyan-500/50",
                        ].join(" ")}
                      >
                        <Image
                          src={image}
                          alt={`${product.name} thumbnail ${index + 1}`}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-950/55 p-5 shadow-[0_24px_80px_-48px_rgba(37,99,235,.7)] backdrop-blur-sm sm:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-200">
                Trade Product
              </span>
              {product.sku ? (
                <span className="text-xs text-slate-500">
                  SKU {product.sku}
                </span>
              ) : null}
            </div>

            <h1 className="mt-4 text-3xl font-semibold leading-tight text-white sm:text-4xl">
              {product.name}
            </h1>

            <div className="mt-4 flex flex-wrap items-end gap-x-3 gap-y-2">
              {hasOnlinePrice ? (
                <>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Trade price from
                    </p>
                    <p className="mt-1 text-2xl font-bold text-cyan-200">
                      {money(Number(bestTier?.unit_price ?? 0), currency)}
                    </p>
                  </div>
                  <span className="mb-1 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-300">
                    {money(unitPrice, currency)} / unit at selected quantity
                  </span>
                </>
              ) : (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Trade pricing
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-200">
                    Contact trade support
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${stockClasses(
                  product,
                )}`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {stockLabel(product)}
              </span>

              {product.stock > 0 &&
              product.low_stock_threshold &&
              product.stock <= product.low_stock_threshold ? (
                <span className="text-xs text-slate-500">
                  Only {product.stock} currently available
                </span>
              ) : null}
            </div>

            {product.description ? (
              <p className="mt-5 whitespace-pre-line text-sm leading-7 text-slate-300">
                {product.description}
              </p>
            ) : null}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/45 p-4">
                <div className="flex items-center gap-2 text-cyan-300">
                  <Truck className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-[0.16em]">
                    Lead time
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold text-white">
                  3–10 business days
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/45 p-4">
                <div className="flex items-center gap-2 text-cyan-300">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-[0.16em]">
                    Trade checkout
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold text-white">
                  Eligibility checked in cart
                </p>
              </div>
            </div>

            {tiers.length ? (
              <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/35 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                      Quantity pricing
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Larger quantities can unlock lower unit prices.
                    </p>
                  </div>
                  <PackageCheck className="h-5 w-5 text-cyan-300" />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {tiers.map((tier) => {
                    const isActive = activeTier?.min_qty === tier.min_qty;
                    return (
                      <button
                        key={tier.min_qty}
                        type="button"
                        onClick={() => setOrderQty(tier.min_qty)}
                        className={[
                          "rounded-xl border px-3 py-2 text-left transition",
                          isActive
                            ? "border-cyan-400/50 bg-cyan-500/10"
                            : "border-slate-800 bg-slate-950/40 hover:border-blue-500/40 hover:bg-blue-500/5",
                        ].join(" ")}
                      >
                        <span className="block text-[10px] uppercase tracking-wider text-slate-500">
                          {tier.min_qty}+ units
                        </span>
                        <span className="mt-1 block text-sm font-bold text-cyan-200">
                          {money(Number(tier.unit_price), currency)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {hasOnlinePrice ? (
              <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/45 p-4">
                <div className="flex items-center justify-between gap-4">
                  <label
                    htmlFor="trade-order-qty"
                    className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300"
                  >
                    Quantity
                  </label>
                  <span className="text-xs text-slate-500">
                    Add the quantity you want; wholesale eligibility is checked
                    in your cart.
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() =>
                      setOrderQty((quantity) => Math.max(1, quantity - 1))
                    }
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-slate-700 bg-slate-950 text-slate-200 transition hover:border-cyan-500/40 hover:text-cyan-200"
                  >
                    <Minus className="h-4 w-4" />
                  </button>

                  <input
                    id="trade-order-qty"
                    type="number"
                    min={1}
                    max={product.stock > 0 ? product.stock : undefined}
                    value={orderQty}
                    onChange={(event) => {
                      const next = Number(event.target.value);
                      if (!Number.isFinite(next)) return;
                      const normalized = Math.max(1, Math.floor(next));
                      setOrderQty(
                        product.stock > 0
                          ? Math.min(product.stock, normalized)
                          : normalized,
                      );
                    }}
                    className="h-11 min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 text-center text-base font-semibold text-white outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/10"
                  />

                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() =>
                      setOrderQty((quantity) =>
                        product.stock > 0
                          ? Math.min(product.stock, quantity + 1)
                          : quantity + 1,
                      )
                    }
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-slate-700 bg-slate-950 text-slate-200 transition hover:border-cyan-500/40 hover:text-cyan-200"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-slate-500">
                    Unit price: {money(unitPrice, currency)}
                  </span>
                  <span className="font-semibold text-slate-200">
                    Estimated total: {money(estimatedTotal, currency)}
                  </span>
                </div>
              </div>
            ) : null}

            <div className="mt-5">
              {hasOnlinePrice ? (
                <AddToCartBtn
                  product={product}
                  variant={selectedVariant}
                  quantity={orderQty}
                  outofStock={isOutOfStock && !product.backorder_allowed}
                  noPrice={false}
                />
              ) : (
                <Link
                  href="/contact"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-500/40 bg-cyan-500/10 px-5 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/20"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Contact trade support
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <section className="rounded-3xl border border-slate-800 bg-slate-950/50 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-200">
              Product details
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <InfoRow label="SKU" value={product.sku || "—"} />
              <InfoRow label="Brand" value={product.brand || "—"} />
              <InfoRow label="Category" value={product.category?.name || "—"} />
              <InfoRow label="GTIN" value={product.gtin || "—"} />
              <InfoRow label="MPN" value={product.mpn || "—"} />
            </dl>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-950/50 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-200">
              Dimensions
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <InfoRow
                label="Weight"
                value={cleanValue(product.weight_kg, " kg")}
              />
              <InfoRow
                label="Length"
                value={cleanValue(product.length_cm, " cm")}
              />
              <InfoRow
                label="Width"
                value={cleanValue(product.width_cm, " cm")}
              />
              <InfoRow
                label="Height"
                value={cleanValue(product.height_cm, " cm")}
              />
            </dl>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-950/50 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-200">
              Material & finish
            </h2>
            {product.spec ? (
              <dl className="mt-4 space-y-3 text-sm">
                <InfoRow
                  label="Base material"
                  value={formatBaseMaterial(product.spec.base_material)}
                />
                <InfoRow
                  label="Plating"
                  value={product.spec.plating_type || "—"}
                />
                <InfoRow
                  label="Gold karat"
                  value={
                    product.spec.gold_karat != null
                      ? `${product.spec.gold_karat}K`
                      : "—"
                  }
                />
                <InfoRow label="Coating" value={product.spec.coating || "—"} />
                <InfoRow
                  label="Water resistant"
                  value={
                    product.spec.water_resistant == null
                      ? "—"
                      : product.spec.water_resistant
                        ? "Yes"
                        : "No"
                  }
                />
                <InfoRow
                  label="Hypoallergenic"
                  value={
                    product.spec.hypoallergenic == null
                      ? "—"
                      : product.spec.hypoallergenic
                        ? "Yes"
                        : "No"
                  }
                />
              </dl>
            ) : (
              <p className="mt-4 text-sm text-slate-500">
                Material specifications are not available for this product.
              </p>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

function formatBaseMaterial(value?: string | null) {
  if (!value) return "—";

  const normalized = value.trim().toUpperCase();
  if (normalized === "316L_STEEL") {
    return "Stainless Steel";
  }

  return value;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-800/70 pb-3 last:border-0 last:pb-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className="max-w-[65%] text-right font-medium text-slate-200">
        {value}
      </dd>
    </div>
  );
}
