import { MetadataRoute } from "next";

const API_BASE =
  process.env.BACKEND_URL?.replace(/\/+$/, "") ||
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, "") ||
  "http://localhost:8000";
const SITE_URL = "https://b2b.elvarra.in";

function backendRoot() {
  return API_BASE.replace(/\/api\/elvarra$/i, "");
}

type FeedItem = { slug: string; updated_at?: string; created_at?: string };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;

  const res = await fetch(`${backendRoot()}/b2b/sitemap-feed/`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) throw new Error(`Sitemap feed failed: ${res.status}`);

  const data = (await res.json()) as {
    products: FeedItem[];
    categories: FeedItem[];
  };

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/catalog`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/contact`, changeFrequency: "monthly", priority: 0.5 },


  ];

  const categoryPages: MetadataRoute.Sitemap = data.categories.map((cat) => ({
    url: `${baseUrl}/catalog?category=${encodeURIComponent(cat.slug)}`,
    lastModified: new Date(cat.updated_at || cat.created_at || Date.now()),
    changeFrequency: "weekly",
    priority: 0.8,
  }));
  const productPages: MetadataRoute.Sitemap = data.products.map((p) => ({
    url: `${baseUrl}/products/${p.slug}`,
    lastModified: new Date(p.updated_at || p.created_at || Date.now()),
    changeFrequency: "weekly",
    priority: 0.9,
  }));
  return [...staticPages, ...categoryPages, ...productPages];
}
