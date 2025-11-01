"use client";

import React, { useMemo } from "react";
import { Product } from "@/types";
import { useRFQCart } from "@/context/RFQCartContext";

interface Props {
  product: Product;
  className?: string;
  outofStock?: boolean;

  /** Qty to add (e.g., from the product page input). If missing, falls back to defaultQty. */
  quantity?: number;

  /** Default RFQ qty when adding the first time (used only if quantity is undefined). */
  defaultQty?: number; // default 10

  /** Optionally enforce a minimum (e.g., first tier min_qty). */
  minQty?: number;

  /** After first add, optionally navigate to RFQ cart page */
  goToRFQCartAfterAdd?: boolean;
}

const AddToRFQBtn2 = ({
  product,
  className,
  outofStock,
  quantity,
  defaultQty = 10,
  minQty,
  goToRFQCartAfterAdd = false,
}: Props) => {
  const { rfq, addToRFQ, updateQty, removeItem } = useRFQCart();

  const line = useMemo(
    () => rfq?.items?.find((it) => it.product === product.id),
    [rfq?.items, product.id]
  );

  const qty = line?.requested_qty ?? 0;
  const inRFQ = qty > 0;

  const effectiveMin = Math.max(1, minQty ?? 1);
  const initialQty = Math.max(
    Number.isFinite(quantity as number) ? (quantity as number) : defaultQty,
    effectiveMin
  );

  const increment = async () => {
    const next = qty + 1;
    await updateQty(product.id, next);
  };

  const decrement = async () => {
    const next = qty - 1;
    if (next <= 0) {
      await removeItem(product.id);
    } else {
      await updateQty(product.id, next);
    }
  };

  const add = async () => {
    // guard minimum
    const addQty = initialQty;
    await addToRFQ(product.id, addQty, "", {
      name: product.name,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      image: (product as any).image_url ?? (product as any).image,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      slug: (product as any).slug,
    });
    if (goToRFQCartAfterAdd) {
      window.location.href = "/wholesale/rfq";
    }
  };

  const belowMOQ = qty < Math.max(1, effectiveMin + 1);
  const disabled = !!outofStock || belowMOQ;
  // Optional helper text when blocked by MOQ
  const showMOQWarning =
    !inRFQ &&
    Number.isFinite(quantity as number) &&
    (quantity as number) < effectiveMin;

  return (
    <div>
      {!inRFQ ? (
        <>
          <button
            onClick={add}
            disabled={disabled}
            className={`mt-3 w-full rounded-xl px-3 py-2 text-sm text-neutral-900 btn-gradient-accent ${
              className ?? ""
            } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
          >
            Request Quote{effectiveMin > 1 ? ` (MOQ ${effectiveMin})` : ""}
          </button>
          {showMOQWarning && (
            <div className="mt-1 text-xs text-amber-300/90">
              Minimum order is {effectiveMin} pcs.
            </div>
          )}
        </>
      ) : (
        <div className="mt-3 grid grid-cols-[auto_1fr_auto] items-center gap-1">
          <button
            onClick={decrement}
            disabled={disabled}
            aria-label="Decrease RFQ quantity"
            className="rounded-xl px-3 py-2 ring-1 ring-neutral-300 dark:ring-neutral-700 hover:bg-amber-50 hover:text-black"
          >
            −
          </button>
          <div className="text-center text-sm">
            RFQ Qty: <span className="font-medium">{qty}</span>
          </div>
          <button
            onClick={increment}
            aria-label="Increase RFQ quantity"
            className="rounded-xl px-3 py-2 ring-1 ring-neutral-300 dark:ring-neutral-700 hover:bg-amber-50 hover:text-black"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
};

export default AddToRFQBtn2;
