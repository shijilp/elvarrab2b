import { api } from "@/lib/api";

export type ProductMini = { id: number; sku?: string; name?: string };

const cache = new Map<string, ProductMini>(); // keys: ID:123 or SKU:ABC

async function fetchById(id: number): Promise<ProductMini | null> {
  try {
    const r = await api.get(`portfolio/${id}/`);
    const d = r.data;
    if (!d || typeof d.id !== "number") return null;
    return { id: d.id, sku: d.sku, name: d.name };
  } catch {
    return null;
  }
}

async function fetchBySku(sku: string): Promise<ProductMini | null> {
  const r = await api.get(`portfolio?sku=${encodeURIComponent(sku)}`);
  const data = r.data;
  const row = Array.isArray(data) ? data[0] : data?.results?.[0];
  if (!row || typeof row.id !== "number") return null;
  return { id: row.id, sku: row.sku, name: row.name };
}

export async function resolveProduct(input: string): Promise<ProductMini> {
  const raw = (input || "").trim();
  if (!raw) throw new Error("Empty product");
  if (/^\d+$/.test(raw)) {
    const key = `ID:${raw}`;
    const c = cache.get(key);
    if (c) return c;
    const p = await fetchById(parseInt(raw, 10));
    if (!p) throw new Error(`Product ID ${raw} not found`);
    cache.set(key, p);
    if (p.sku) cache.set(`SKU:${p.sku.toUpperCase()}`, p);
    return p;
  }
  const key = `SKU:${raw.toUpperCase()}`;
  const c = cache.get(key);
  if (c) return c;
  const p = await fetchBySku(raw);
  if (!p) throw new Error(`SKU "${raw}" not found`);
  cache.set(key, p);
  cache.set(`ID:${String(p.id)}`, p);
  return p;
}
