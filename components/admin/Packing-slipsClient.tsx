"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import PackingList from "@/components/PackingList";
import { Order } from "@/types";

export default function PrintAllPackingSlipsClient() {
  const router = useRouter();
  const search = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
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

  useEffect(() => {
    (async () => {
      const getOrders = async () => {
        if (ids.length) {
          const data = await api.get("orders/bulk", {
            params: { ids: ids.join(",") },
          });
          return data.data?.results ?? data.data ?? [];
        } else {
          const data = await api.get("/orders", {
            params: { status: "new", limit: 200 },
          });
          return data.data?.results ?? data.data ?? [];
        }
      };
      const list = await getOrders();
      setOrders(list);
    })();
  }, [ids]);

  useEffect(() => {
    if (!orders.length) return;

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
      const fontsReady = document.fonts?.ready;
      if (fontsReady && typeof fontsReady.then === "function") {
        await fontsReady;
      }
    };

    const go = async () => {
      await Promise.all([waitForImages(), waitForFonts()]);
      setReady(true);
    };

    go();
  }, [orders]);

  useEffect(() => {
    if (!ready || hasPrinted.current) return;
    hasPrinted.current = true;

    setTimeout(() => {
      window.print();
    }, 50);

    const onAfterPrint = () => {
      router.back();
    };
    window.addEventListener("afterprint", onAfterPrint, { once: true });
    return () => window.removeEventListener("afterprint", onAfterPrint);
  }, [ready, router]);

  if (!orders.length) {
    return (
      <div className="p-6 text-sm text-neutral-600 dark:text-neutral-300">
        No orders found to print.
      </div>
    );
  }

  return (
    <div className="p-0 m-0 print:p-0 print:m-0">
      <div className="p-3 text-center text-xs text-neutral-500 print:hidden">
        Preparing packing slips… your print dialog will open automatically.
      </div>

      <div className="space-y-8 print:space-y-0">
        {orders.map((order) => (
          <section
            key={order.id}
            className="break-after-page print:break-after-page p-6 print:p-0"
          >
            <PackingList order={order} />
          </section>
        ))}
      </div>
    </div>
  );
}
