// components/ProductMiniLabel.tsx
"use client";

import Barcode from "../ui/Barcode";

type MiniProduct = {
  id: number;
  name: string; // full title
  sku?: string; // item code you want on label
};

export default function ProductMiniLabel({
  product,
}: {
  product: MiniProduct;
}) {
  const code = (product.sku || String(product.id)).toUpperCase();

  // Shorten title for small labels (two lines max)
  const shortTitle =
    product.name.length > 36
      ? product.name.slice(0, 33).trim() + "…"
      : product.name;

  return (
    <div className="mini-label bg-white border border-neutral-300 rounded-[2px] p-1.5 leading-none">
      {/* TOP: Item code (bold) */}
      <div className="text-[9px] font-semibold tracking-wide">{code}</div>

      {/* Title (two small lines) */}
      <div className="mt-[1mm] text-[8px] leading-[10px] line-clamp-2">
        {shortTitle}
      </div>

      {/* Barcode */}
      <div className="mt-[1mm]">
        <Barcode
          value={code}
          height={22}
          maxWidthMm={35}
          quietMm={1.5}
          showText={false}
        />
      </div>
    </div>
  );
}
