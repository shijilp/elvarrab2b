// components/StockLabel.tsx
"use client";

type Brand = { name: string } | string | null;

export type ProductWithStock = {
  id: number;
  name: string;
  sku?: string;
  brand?: Brand;
  variant?: string | null; // e.g., "18K Gold / 6"
  stock_qty?: number; // on-hand qty
  bin_location?: string | null; // e.g., "A1-03" or "R2-B"
};

export default function StockLabel({ product }: { product: ProductWithStock }) {
  const brandName =
    typeof product.brand === "string"
      ? product.brand
      : // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (product.brand as any)?.name ?? "ELVARRA";

  return (
    <div className="stock-label border border-neutral-300 rounded-md p-2">
      {/* Top: Brand + BIN */}
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-medium truncate max-w-[60%]">
          {brandName}
        </div>
        <div className="text-[11px] font-bold">
          {product.bin_location || "BIN–"}
        </div>
      </div>

      {/* Name */}
      <div className="mt-0.5 text-[11px] font-semibold line-clamp-2">
        {product.name}
      </div>

      {/* Variant + SKU */}
      <div className="mt-0.5 text-[9px] text-neutral-700">
        {product.variant ? `${product.variant} · ` : ""}
        SKU: {product.sku || "—"}
      </div>

      {/* Qty big & clear */}
      <div className="mt-1 text-[12px] font-extrabold tracking-wide">
        QTY: {product.stock_qty ?? 0}
      </div>

      {/* Optional micro footer (site / dept) */}
      <div className="mt-1 text-[8px] tracking-wide text-neutral-500">
        inventory.elvarra
      </div>
    </div>
  );
}
