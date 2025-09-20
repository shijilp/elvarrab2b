// app/products/print/labels/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import ProductLabel from "@/components/admin/PrintProductLabel";

type Product = {
  id: number;
  name: string;
  sku?: string;
  price?: number | string;
  currency?: string;
  brand?: { name: string } | string | null;
};

export default function PrintProductLabelsPage() {
  const router = useRouter();
  const search = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
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
    return Number.isFinite(c) && c > 0 ? Math.min(c, 100) : 1; // cap for safety
  }, [search]);

  useEffect(() => {
    (async () => {
      const getProducts = async () => {
        if (ids.length) {
          // Add this endpoint (shown below) in your Django app: /products/bulk?ids=...
          const res = await api.get("/products/bulk", {
            params: { ids: ids.join(",") },
          });
          return res.data?.results ?? res.data ?? [];
        } else {
          // Fallback: print first 100 items (tweak as needed)
          const res = await api.get("/products/", { params: { limit: 100 } });
          return res.data?.results ?? res.data ?? [];
        }
      };
      const list = await getProducts();
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
        const done = () => {
          loaded += 1;
          if (loaded >= imgs.length) resolve();
        };
        imgs.forEach((img) => {
          const el = img as HTMLImageElement;
          if (el.complete) return done();
          el.addEventListener("load", done, { once: true });
          el.addEventListener("error", done, { once: true });
        });
      });

    const waitForFonts = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fontsReady = (document as any).fonts?.ready;
      if (fontsReady && typeof fontsReady.then === "function") {
        await fontsReady;
      }
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
        No products found to print.
      </div>
    );
  }

  // Expand into copies
  const labels: Product[] = products.flatMap((p) =>
    Array.from({ length: copies }, () => p)
  );

  return (
    <div className="p-0 m-0 print:p-0 print:m-0">
      <div className="p-3 text-center text-xs text-neutral-500 print:hidden">
        Preparing product labels… your print dialog will open automatically.
      </div>

      {/* Grid of small labels that tile across the page */}
      <div className="print-grid">
        {labels.map((p, i) => (
          <div key={`${p.id}-${i}`} className="label-wrapper">
            <ProductLabel product={p} />
          </div>
        ))}
      </div>
    </div>
  );
}
