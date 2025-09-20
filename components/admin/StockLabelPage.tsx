// app/inventory/print/stock-labels/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import StockLabel, { ProductWithStock } from "@/components/admin/StockLabel";

export default function PrintStockLabelsPage() {
  const router = useRouter();
  const search = useSearchParams();
  const [products, setProducts] = useState<ProductWithStock[]>([]);
  const [ready, setReady] = useState(false);
  const hasPrinted = useRef(false);

  const ids = useMemo(() => {
    const q = search.get("ids");
    return q
      ? q
          .split(",")
          .map((s) => Number(s))
          .filter(Boolean)
      : [];
  }, [search]);

  const copies = useMemo(() => {
    const c = Number(search.get("copies") ?? "1");
    return Number.isFinite(c) && c > 0 ? Math.min(c, 200) : 1;
  }, [search]);

  const perUnit = useMemo(() => search.get("perUnit") === "true", [search]);

  useEffect(() => {
    (async () => {
      const getData = async () => {
        if (ids.length) {
          // Backend endpoint below: returns stock fields too
          const res = await api.get("/products/bulk-with-stock", {
            params: { ids: ids.join(",") },
          });
          return res.data?.results ?? res.data ?? [];
        } else {
          // Fallback: first 100 with stock (adapt to your list API)
          const res = await api.get("/products/", { params: { limit: 100 } });
          return res.data?.results ?? res.data ?? [];
        }
      };
      const list = await getData();
      setProducts(list);
    })();
  }, [ids]);

  useEffect(() => {
    if (!products.length) return;

    const waitForImages = () =>
      new Promise<void>((resolve) => {
        const imgs = Array.from(document.querySelectorAll("img"));
        if (!imgs.length) return resolve();
        let loaded = 0;
        const done = () => ++loaded >= imgs.length && resolve();
        imgs.forEach((img) => {
          const el = img as HTMLImageElement;
          if (el.complete) return done();
          el.addEventListener("load", done, { once: true });
          el.addEventListener("error", done, { once: true });
        });
      });

    const waitForFonts = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ready = (document as any).fonts?.ready;
      if (ready && typeof ready.then === "function") await ready;
    };

    (async () => {
      await Promise.all([waitForImages(), waitForFonts()]);
      setReady(true);
    })();
  }, [products]);

  useEffect(() => {
    if (!ready || hasPrinted.current) return;
    hasPrinted.current = true;
    setTimeout(() => window.print(), 50);
    const onAfterPrint = () => router.back();
    window.addEventListener("afterprint", onAfterPrint, { once: true });
    return () => window.removeEventListener("afterprint", onAfterPrint);
  }, [ready, router]);

  if (!products.length) {
    return (
      <div className="p-6 text-sm text-neutral-600 dark:text-neutral-300">
        No products found.
      </div>
    );
  }

  // Expand to copies (either fixed copies or per-unit by stock_qty)
  const labels: ProductWithStock[] = products.flatMap((p) => {
    const n = perUnit ? Math.min(Number(p.stock_qty ?? 0), 500) : copies; // cap for safety
    return Array.from({ length: Math.max(n, 1) }, () => p);
  });

  return (
    <div className="p-0 m-0 print:p-0 print:m-0">
      <div className="p-3 text-center text-xs text-neutral-500 print:hidden">
        Preparing stock labels… your print dialog will open automatically.
      </div>

      <div className="stock-print-grid">
        {labels.map((p, i) => (
          <div key={`${p.id}-${i}`} className="stock-label-wrap">
            <StockLabel product={p} />
          </div>
        ))}
      </div>
    </div>
  );
}
