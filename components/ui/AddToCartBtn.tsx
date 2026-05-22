"use client";

import React, { useMemo, useState } from "react";
import { useCart } from "@/context/CartContext";
import { Product, Variant } from "@/types";

import AlertModal from "../AlertModal";

interface Props {
  product: Product;
  className?: string;
  outofStock?: boolean;
  noPrice?: boolean;
  variant: Variant | null;
}

const AddToCartBtn = ({
  product,
  className,
  outofStock,
  noPrice,
  variant,
}: Props) => {
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();

  const [showAlert, setShowAlert] = useState(false);

  // const line = useMemo(
  //   () => cartItems?.find((it) => (it?.id ?? it.id) === product.id),
  //   [cartItems, product.id]

  // );

  const effectiveVariant = useMemo<Variant | null>(() => {
    if (variant) return variant;
    if (product.variants && product.variants.length > 0) {
      return product.variants[0];
    }
    return null;
  }, [variant, product]);
  const line = useMemo(
    () =>
      cartItems?.find((it) => {
        const variantId = effectiveVariant?.id ?? null;

        // assuming backend returns: { product: number, variant: number | null, ... }
        return (
          it.product === product.id && (it.variant_id ?? null) === variantId
        );
      }),
    [cartItems, product.id, effectiveVariant?.id],
  );

  const qty = line?.quantity ?? 0;
  const inCart = qty > 0;
  // const stockAvailable = product.stock ?? 0;
  const stockAvailable = variant
    ? (variant.inventory ?? 0)
    : (product.stock ?? 0);

  const increment = () => {
    if (qty + 1 > stockAvailable) {
      setShowAlert(true);
      return;
    }
    updateQuantity(product.id, qty + 1, variant?.id ?? null);
  };

  const decrement = () => {
    const next = qty - 1;
    if (next <= 0) {
      removeFromCart?.(product.id, variant?.id ?? null);
    } else {
      updateQuantity(product.id, next, variant?.id ?? null);
    }
  };

  const handleAddToCart = async () => {
    if (outofStock) return;
    // 1) normal cart logic
    addToCart(product, effectiveVariant?.id ?? null);

    // 2) build cart product ids (include this product)
    const cartProductIds = Array.from(
      new Set([...cartItems.map((it) => it.id as number), product.id]),
    );
  };

  return (
    <div>
      {!inCart ? (
        <button
          onClick={handleAddToCart}
          disabled={outofStock || noPrice}
          className={[
            "group mt-3 relative w-full overflow-hidden rounded-2xl",

            // sizing
            "px-5 py-3",

            // B2B Theme
            "bg-gradient-to-r from-slate-800 via-slate-900 to-[#07111f]",
            "border border-blue-800/40",

            // text
            "text-white font-semibold tracking-wide",

            // effects
            "shadow-[0_10px_40px_-20px_rgba(37,99,235,.6)]",
            "hover:shadow-[0_20px_60px_-20px_rgba(59,130,246,.8)]",
            "hover:border-blue-500/70",

            // interaction
            "hover:-translate-y-[1px]",
            "active:scale-[0.985]",
            "transition-all duration-300",

            // focus
            "focus:outline-none",
            "focus-visible:ring-2",
            "focus-visible:ring-blue-500/40",

            outofStock ? "opacity-40 grayscale cursor-not-allowed" : "",

            className ?? "",
          ].join(" ")}
        >
          {/* top highlight */}
          <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/70 to-transparent" />

          {/* animated trade glow */}
          {!outofStock && (
            <span className="absolute inset-0 overflow-hidden">
              <span className="absolute -left-[150%] top-0 h-full w-[120%] skew-x-[-18deg] bg-gradient-to-r from-transparent via-blue-400/20 to-transparent group-hover:left-[120%] transition-all duration-1000" />
            </span>
          )}

          <span className="relative z-10 flex items-center justify-center gap-2">
            <span className="text-lg">▣</span>

            {outofStock
              ? "Out of Stock"
              : noPrice
                ? "Request Quote"
                : "Add to Wholesale Order"}

            {!outofStock && (
              <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] uppercase tracking-widest text-blue-300">
                Trade
              </span>
            )}
          </span>
        </button>
      ) : (
        <div className="mt-3 relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-[#07111f] p-1 shadow-[0_10px_40px_-20px_rgba(37,99,235,.45)]">
          {/* subtle top line */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" />

          <div className="flex h-14 items-center gap-2">
            {/* DECREASE */}
            <button
              onClick={decrement}
              aria-label="Decrease quantity"
              className="
        h-11 w-11 shrink-0
        rounded-xl
        grid place-items-center
        border border-slate-700
        bg-slate-900
        text-slate-200
        hover:border-red-500/60
        hover:bg-red-500/10
        hover:text-red-300
        active:scale-95
        transition-all
      "
            >
              <span className="text-xl leading-none">−</span>
            </button>

            {/* CENTER */}
            <div className="min-w-0 flex-1 text-center">
              {/* Desktop */}
              <div className="hidden sm:block">
                <div className="text-[10px] uppercase tracking-[0.25em] text-blue-300">
                  Wholesale Qty
                </div>

                <div className="mt-1 flex items-center justify-center gap-2">
                  <span className="rounded-full bg-blue-500/15 px-2 py-1 text-[11px] text-blue-300">
                    TRADE
                  </span>

                  <span className="text-lg font-bold text-white">{qty}</span>

                  <span className="text-xs text-slate-400">units</span>
                </div>
              </div>

              {/* Mobile */}
              <div className="sm:hidden">
                <span className="text-lg font-bold text-blue-300">{qty}</span>
              </div>
            </div>

            {/* INCREASE */}
            <button
              onClick={increment}
              aria-label="Increase quantity"
              className="
        h-11 w-11 shrink-0
        rounded-xl
        grid place-items-center
        border border-blue-700/50
        bg-blue-950/40
        text-blue-200
        hover:border-blue-400
        hover:bg-blue-500/15
        hover:text-white
        active:scale-95
        transition-all
      "
            >
              <span className="text-xl leading-none">+</span>
            </button>
          </div>
        </div>
      )}

      <AlertModal
        show={showAlert}
        title="Stock Warning"
        message={
          stockAvailable > 0
            ? `Only ${stockAvailable} item(s) available in stock.`
            : "This item is currently out of stock."
        }
        type="warning"
        autoCloseMs={0}
        onClose={() => setShowAlert(false)}
      />
    </div>
  );
};

export default AddToCartBtn;
