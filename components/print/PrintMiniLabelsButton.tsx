// components/PrintMiniLabelsButton.tsx
"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PrintMiniLabelsButton({
  ids,
  copies = 1,
}: {
  ids: number[];
  copies?: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const go = () => {
    if (!ids?.length) return alert("Select products to print.");
    setLoading(true);
    const q = new URLSearchParams({
      ids: ids.join(","),
      copies: String(copies),
    });
    router.push(`/admin/products/print/mini-labels?${q.toString()}`);
  };
  return (
    <button
      onClick={go}
      disabled={loading}
      className="rounded-md px-4 py-2 bg-neutral-900 text-white disabled:opacity-50"
    >
      {loading ? "Preparing…" : "Print mini labels"}
    </button>
  );
}
