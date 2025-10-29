"use client";

import React, { useMemo } from "react";
import { Product } from "@/types";
import { useRFQCart } from "@/context/RFQCartContext";

interface Props {
  product: Product;
  className?: string;
  outofStock?: boolean;
  /** default RFQ qty when first adding */
  defaultQty?: number; // default 10
  /** after first add, optionally navigate to RFQ cart page */
  goToRFQCartAfterAdd?: boolean;
}

const AddToRFQBtn = ({
  product,
  className,
  outofStock,
  defaultQty = 10,
  goToRFQCartAfterAdd = false,
}: Props) => {
  const { rfq, addToRFQ, updateQty, removeItem } = useRFQCart();

  // find this product in the RFQ cart
  const line = useMemo(
    () => rfq?.items?.find((it) => it.product === product.id),
    [rfq?.items, product.id]
  );

  const qty = line?.requested_qty ?? 0;
  const inRFQ = qty > 0;

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
    await addToRFQ(product.id, defaultQty, "", {
      name: product.name,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      image: (product as any).image_url ?? (product as any).image,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      slug: (product as any).slug,
    });
    if (goToRFQCartAfterAdd) {
      // adjust route if your RFQ cart page differs
      window.location.href = "/wholesale/rfq";
    }
  };

  return (
    <div>
      {!inRFQ ? (
        <button
          onClick={add}
          disabled={outofStock}
          className={`mt-3 w-full rounded-xl px-3 py-2 text-sm text-neutral-900 btn-gradient-accent ${
            className ?? ""
          } ${outofStock ? "opacity-30" : ""}`}
        >
          Request Wholesale Quote1
        </button>
      ) : (
        <div className="mt-3 grid grid-cols-[auto_1fr_auto] items-center gap-1">
          <button
            onClick={decrement}
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

export default AddToRFQBtn;
