import { MetadataRoute } from "next";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, "") ||
  "http://localhost:8000";



type FeedItem = { slug: string; updated_at?: string; created_at?: string };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.b2b.elvarra.in";

  const res = await fetch(`${API_BASE}/sitemap-feed/`, {
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`Sitemap feed failed: ${res.status}`);

  const data = (await res.json()) as {
    products: FeedItem[];
    categories: FeedItem[];
  };

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/catalog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), priority: 0.5 },


  ];

  const categoryPages: MetadataRoute.Sitemap = data.categories.map((cat) => ({
    url: `${baseUrl}/catalog?category=${cat.slug}`,
    lastModified: new Date(cat.updated_at || cat.created_at || Date.now()),
    changeFrequency: "weekly",
    priority: 0.8,
  }));
  /* ---------------- NEW COLLECTION CATEGORY PAGES ---------------- */
  // const collectionCategoryPages: MetadataRoute.Sitemap = data.categories.map((cat) => ({
  //   url: `${baseUrl}/collections/${cat.slug}`,
  //   lastModified: new Date(cat.updated_at || cat.created_at || Date.now()),
  //   changeFrequency: "weekly",
  //   priority: 0.85, // higher → preferred by Google
  // }));
  const productPages: MetadataRoute.Sitemap = data.products.map((p) => ({
    url: `${baseUrl}/products/${p.slug}`,
    lastModified: new Date(p.updated_at || p.created_at || Date.now()),
    changeFrequency: "weekly",
    priority: 0.9,
  }));

    const collectionPages: MetadataRoute.Sitemap = data.products.map((p) => ({
    url: `${baseUrl}/collections/${p.slug}`,
    lastModified: new Date(p.updated_at || p.created_at || Date.now()),
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  return [...staticPages, ...categoryPages,  ...productPages];
}
