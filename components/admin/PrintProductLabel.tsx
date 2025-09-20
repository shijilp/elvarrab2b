// components/ProductLabel.tsx
"use client";

import React from "react";

type Product = {
  id: number;
  name: string;
  sku?: string;
  price?: number | string;
  currency?: string; // e.g. "SAR"
  brand?: { name: string } | string | null;
};

type Props = {
  product: Product;
};

function money(n: number | string | undefined, currency = "SAR") {
  const x = typeof n === "string" ? Number(n) : n ?? 0;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(x ?? 0);
  } catch {
    const v = Number(x ?? 0);
    return `SAR ${v.toFixed(2)}`;
  }
}

export default function ProductLabel({ product }: Props) {
  const brandName =
    typeof product.brand === "string"
      ? product.brand
      : // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (product.brand as any)?.name ?? "";

  return (
    <div className="label border border-neutral-300 rounded-md p-2 leading-tight">
      {/* Top row: brand + price */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium truncate max-w-[60%]">
          {brandName || "ELVARRA"}
        </span>
        <span className="text-[11px] font-semibold">
          {money(product?.price, (product as Product)?.currency || "SAR")}
        </span>
      </div>

      {/* Name */}
      <div className="mt-0.5 text-[11px] font-medium line-clamp-2">
        {product.name}
      </div>

      {/* SKU */}
      <div className="mt-0.5 text-[9px] text-neutral-600">
        SKU: {product.sku || "—"}
      </div>

      {/* Optional: tiny brand tagline / site */}
      <div className="mt-1 text-[8px] tracking-wide text-neutral-500">
        elvarra.com
      </div>
    </div>
  );
}
