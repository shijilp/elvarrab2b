import { Suspense } from "react";
import { Spinner } from "@/components/admin/Spinner";
import ProductPageClient from "@/components/ProductPageClient";
import { Metadata } from "next";

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
async function getProduct(slug: string) {
  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, "") ||
    "http://localhost:8000";
  const res = await fetch(`${API_BASE}/products/${slug}/`, {
    next: { revalidate: 300 },
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Product fetch failed: ${res.status}`);
  return res.json() as Promise<{
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
  }>;
}
// Build absolute image URL when needed:
function abs(url?: string | null) {
  if (!url) return undefined;
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
    return new URL(url, base || "http://localhost:3000").toString();
  } catch {
    return url || undefined;
  }
}

// ✅ Note params is a Promise in Next 15
export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const p = await getProduct(slug);

  if (!p) {
    return {
      title: "Product not found · Elvarra",
      description: "This product may be unavailable or discontinued.",
      robots: { index: false, follow: false },
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
    : "/og/default.jpg";
  const canonical = `/products/${p.slug}`;

  return {
    title,
    description,
    openGraph: {
      // type: "website", // (omit "product" – Next union doesn’t allow it)
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

export default function ProductsPage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <ProductPageClient />
    </Suspense>
  );
}
