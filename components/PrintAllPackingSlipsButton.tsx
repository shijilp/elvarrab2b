// components/PrintAllPackingSlipsButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useState } from "react";
import { Order } from "@/types";

export default function PrintAllPackingSlipsButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    try {
      setLoading(true);
      // TODO: adjust API path/params to match your backend
      const res = await api.get("/my-orders", {});
      // const newItems = res.data?.results.filter(
      //   (item: Order) => item.status === "new"
      // );
      const ids: number[] = (res.data?.results ?? res.data ?? [])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((o: any) => o.id)
        .filter(Boolean);

      if (!ids.length) {
        alert("No new orders to print.");
        return;
      }

      // Navigate to the print page with IDs
      router.push(`/admin/orders/print/packing-slips?ids=${ids.join(",")}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="rounded-xl px-5 py-3 text-sm font-medium bg-neutral-900 text-white dark:text-neutral-900 dark:bg-amber-400 disabled:opacity-50"
    >
      {loading ? "Preparing…" : "Print all NEW packing lists"}
    </button>
  );
}
