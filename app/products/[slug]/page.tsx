import { Suspense } from "react";
import type { Metadata } from "next";
import { Spinner } from "@/components/admin/Spinner";
import ProductPageClient from "@/components/ProductPageClient";

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

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "http://localhost:3000";
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, "") ||
  "http://localhost:8000";

async function getProduct(slug: string) {
  const res = await fetch(`${API_BASE}/products/${slug}/`, {
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Product fetch failed: ${res.status}`);
  return (await res.json()) as {
    id: number;
    name: string;
    slug: string;
    description?: string;
    price?: number | string;
    currency?: string;
    images?: string[];
    meta_title?: string;
    meta_description?: string;
    og_title?: string;
    og_description?: string;
    og_image?: string | null;
    brand?: string | null;
    availability?: "InStock" | "OutOfStock" | "PreOrder";
  };
}

function abs(url?: string | null) {
  if (!url) return undefined;
  try {
    return new URL(url, SITE_URL).toString();
  } catch {
    return url || undefined;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params; // <-- await the Promise
  const p = await getProduct(slug);

  if (!p) {
    return {
      title: "Product not found · Elvarra",
      description: "This product may be unavailable or discontinued.",
      robots: { index: false, follow: false },
      alternates: { canonical: `${SITE_URL}/products/${slug}` },
    };
  }

  const title = p.meta_title?.trim() || p.og_title?.trim() || p.name;
  const description =
    p.meta_description?.trim() ||
    p.og_description?.trim() ||
    (p.description ?? "").slice(0, 160);

  const ogImg = p.og_image
    ? abs(p.og_image)
    : p.images?.length
    ? abs(p.images[0])
    : undefined;

  const canonical = `${SITE_URL}/products/${p.slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonical,
      images: ogImg ? [ogImg] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImg ? [ogImg] : undefined,
    },
    alternates: { canonical },
    robots: { index: true, follow: true },
  };
}

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params; // <-- await the Promise
  return (
    <Suspense fallback={<PageFallback />}>
      <ProductPageClient />
    </Suspense>
  );
}
