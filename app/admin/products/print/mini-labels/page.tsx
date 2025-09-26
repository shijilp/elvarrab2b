// app/products/print/mini-labels/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import ProductMiniLabel from "@/components/print/ProductMiniLabel";

type P = { id: number; name: string; sku?: string };

export default function PrintMiniLabelsPage() {
  const router = useRouter();
  const search = useSearchParams();
  const [products, setProducts] = useState<P[]>([]);
  const [ready, setReady] = useState(false);
  const printed = useRef(false);

  const ids = useMemo(() => {
    const q = search.get("ids");
    return q ? q.split(",").map(Number).filter(Boolean) : [];
  }, [search]);

  const copies = useMemo(() => {
    const c = Number(search.get("copies") ?? "1");
    return Number.isFinite(c) && c > 0 ? Math.min(c, 200) : 1;
  }, [search]);

  useEffect(() => {
    (async () => {
      const res = await api.get("/bulk/products", {
        params: { ids: ids.join(",") },
      });

      const list = res.data?.results ?? res.data ?? [];
      // Map to minimal shape if your API fields differ
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapped: P[] = list.map((p: any) => ({
        id: p.id,
        name: p.name || p.title,
        sku: p.sku || p.code || undefined,
      }));
      setProducts(mapped);
    })();
  }, [ids]);

  useEffect(() => {
    if (!products.length) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const waitFonts = (document as any).fonts?.ready;
    Promise.resolve(waitFonts).finally(() => setReady(true));
  }, [products]);

  useEffect(() => {
    if (!ready || printed.current) return;
    printed.current = true;
    setTimeout(() => window.print(), 50);
    const back = () => router.back();
    window.addEventListener("afterprint", back, { once: true });
    return () => window.removeEventListener("afterprint", back);
  }, [ready, router]);

  if (!products.length)
    return <div className="p-4 text-sm">No products found.</div>;

  const labels = products.flatMap((p) =>
    Array.from({ length: copies }, () => p)
  );

  return (
    <div className="p-0 m-0">
      <div className="print-hint print:hidden p-2 text-center text-xs text-neutral-500">
        Preparing mini labels…
      </div>
      <div className="mini-label-grid">
        {labels.map((p, i) => (
          <div className="mini-label-wrap" key={`${p.id}-${i}`}>
            <ProductMiniLabel product={p} />
          </div>
        ))}
      </div>
    </div>
  );
}
