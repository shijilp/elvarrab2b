import { Suspense } from "react";
import ProductPageClient from "@/components/ProductPageClient";
import { Metadata } from "next";
import Spinner from "@/components/Spinner";
import { notFound } from "next/navigation";
import type { Product } from "@/types";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://b2b.elvarra.in";

type WholesaleTier = {
  min_qty: number;
  unit_price: number | string;
};

type ApiImage =
  | string
  | {
      image?: string | null;
      image_url?: string | null;
    };

type SeoProduct = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price?: number | string;
  currency?: string;
  image?: string | null;
  image_url?: string | null;
  images?: ApiImage[];
  meta_title?: string;
  meta_description?: string;
  brand?: string | null;
  sku?: string | null;
  category?: { name?: string | null; slug?: string | null } | null;
  stock?: number;
  is_active?: boolean;
  wholesale_price?: WholesaleTier[];
};

function PageFallback() {
  return (
    <main className="container mx-auto py-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Spinner key={i} />
        ))}
      </div>
    </main>
  );
}

function backendRoot() {
  const raw =
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_BASE ||
    "http://localhost:8000";

  return raw
    .replace(/\/+$/, "")
    .replace(/\/api\/elvarra$/i, "");
}

async function getProduct(slug: string): Promise<SeoProduct | null> {
  const res = await fetch(
    `${backendRoot()}/b2b/catalogs/${encodeURIComponent(slug)}/`,
    {
      next: { revalidate: 300 },
    },
  );

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`B2B product fetch failed: ${res.status}`);
  return (await res.json()) as SeoProduct;
}

function absoluteUrl(url?: string | null, base = SITE_URL) {
  if (!url) return undefined;
  try {
    return new URL(url, `${base.replace(/\/+$/, "")}/`).toString();
  } catch {
    return undefined;
  }
}

function productImages(p: SeoProduct) {
  const urls: string[] = [];

  const push = (value?: string | null) => {
    if (!value) return;
    const resolved =
      absoluteUrl(value, value.startsWith("/media/") ? backendRoot() : SITE_URL) ||
      value;
    if (!urls.includes(resolved)) urls.push(resolved);
  };

  push(p.image_url);
  push(p.image);

  for (const entry of p.images || []) {
    if (typeof entry === "string") {
      push(entry);
    } else {
      push(entry.image_url);
      push(entry.image);
    }
  }

  return urls;
}

function publicWholesaleOffer(p: SeoProduct) {
  const tiers = (p.wholesale_price || [])
    .map((tier) => ({
      min_qty: Number(tier.min_qty),
      unit_price: Number(tier.unit_price),
    }))
    .filter(
      (tier) =>
        Number.isFinite(tier.min_qty) &&
        tier.min_qty > 0 &&
        Number.isFinite(tier.unit_price) &&
        tier.unit_price >= 0,
    )
    .sort((a, b) => a.unit_price - b.unit_price);

  // The B2B product UI only exposes a public price when wholesale tiers exist.
  // Do not emit a Product offer from the retail/base price when the page itself
  // effectively says "contact for price".
  if (!tiers.length) return null;

  const tier = tiers[0];
  const currency = (p.currency || "INR").toUpperCase();

  return {
    "@type": "Offer",
    url: `${SITE_URL}/products/${encodeURIComponent(p.slug)}`,
    priceCurrency: currency,
    price: tier.unit_price,
    availability:
      Number(p.stock || 0) > 0
        ? "https://schema.org/InStock"
        : (p as SeoProduct & { backorder_allowed?: boolean }).backorder_allowed
          ? "https://schema.org/BackOrder"
          : "https://schema.org/OutOfStock",
    itemCondition: "https://schema.org/NewCondition",
    seller: {
      "@type": "Organization",
      name: "Elvarra Wholesale",
      url: SITE_URL,
    },
  };
}

function buildProductJsonLd(p: SeoProduct) {
  const offer = publicWholesaleOffer(p);
  if (!offer) return null;

  const images = productImages(p);
  const product: Record<string, unknown> = {
    "@type": "Product",
    name: p.name,
    url: `${SITE_URL}/products/${encodeURIComponent(p.slug)}`,
    description: p.description || undefined,
    image: images.length ? images : undefined,
    sku: p.sku || undefined,
    category: p.category?.name || undefined,
    brand: p.brand
      ? {
          "@type": "Brand",
          name: p.brand,
        }
      : undefined,
    offers: offer,
  };

  const breadcrumb = {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Wholesale catalog",
        item: `${SITE_URL}/catalog`,
      },
      ...(p.category?.name
        ? [{
            "@type": "ListItem",
            position: 2,
            name: p.category.name,
            item: `${SITE_URL}/catalog?category=${encodeURIComponent(p.category.slug || "")}`,
          }]
        : []),
      {
        "@type": "ListItem",
        position: p.category?.name ? 3 : 2,
        name: p.name,
        item: `${SITE_URL}/products/${encodeURIComponent(p.slug)}`,
      },
    ],
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      Object.fromEntries(
        Object.entries(product).filter(([, value]) => value !== undefined),
      ),
      breadcrumb,
    ],
  };
}

function safeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const p = await getProduct(slug);

  if (!p || p.is_active === false) {
    return {
      title: "Product not found · Elvarra Wholesale",
      description: "This product may be unavailable or discontinued.",
      robots: { index: false, follow: false },
    };
  }

  const title = p.meta_title?.trim() || p.name;
  const description =
    p.meta_description?.trim() ||
    (p.description ?? "").replace(/\s+/g, " ").trim().slice(0, 160) ||
    `Buy ${p.name} at wholesale prices from Elvarra. View trade pricing, product specifications and stock availability.`;
  const images = productImages(p);
  const canonical = `/products/${p.slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonical,
      images: images.length ? [images[0]] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images.length ? [images[0]] : undefined,
    },
    alternates: { canonical },
    robots: { index: true, follow: true },
  };
}

export default async function ProductsPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const product = await getProduct(slug);
  if (!product || product.is_active === false) notFound();
  const jsonLd = buildProductJsonLd(product);

  return (
    <>
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
        />
      ) : null}
      <Suspense fallback={<PageFallback />}>
        <ProductPageClient initialProduct={product as Product} />
      </Suspense>
    </>
  );
}
