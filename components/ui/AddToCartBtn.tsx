"use client";

import React, { useMemo, useState } from "react";
import { useCart } from "@/context/CartContext";
import { Product, Variant } from "@/types";

import AlertModal from "../AlertModal";
import { trackEvent } from "@/lib/analytics";

interface Props {
  product: Product;
  className?: string;
  outofStock?: boolean;
  noPrice?: boolean;
  variant: Variant | null;
  quantity?: number;
}

const AddToCartBtn = ({
  product,
  className,
  outofStock,
  noPrice,
  variant,
  quantity = 1,
}: Props) => {
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();

  const [showAlert, setShowAlert] = useState(false);
  const [showVariantPopup, setShowVariantPopup] = useState(false);

  const variants = product.variants ?? [];

  const hasMultipleVariants = !variant && variants.length > 1;

  /**
   * Important:
   * Do NOT auto-select first variant when there are multiple variants.
   * Only use directVariant when:
   * 1. parent already passed selected variant
   * 2. product has only one variant
   * 3. product has no variant
   */
  const directVariant = useMemo<Variant | null>(() => {
    if (variant) return variant;

    if (variants.length === 1) {
      return variants[0];
    }

    return null;
  }, [variant, variants]);

  const totalProductQty = useMemo(() => {
    return (cartItems ?? [])
      .filter((it) => it.product?.id === product.id || it.id === product.id)
      .reduce((sum, it) => sum + Number(it.quantity ?? 0), 0);
  }, [cartItems, product.id]);

  const hasAnyQtyInCart = totalProductQty > 0;

  const line = useMemo(
    () =>
      cartItems?.find((it) => {
        const variantId = directVariant?.id ?? null;

        return (
          it.product?.id === product.id && (it.variant_id ?? null) === variantId
        );
      }),
    [cartItems, product.id, directVariant?.id],
  );

  const qty = line?.quantity ?? 0;
  const inCart = hasMultipleVariants ? hasAnyQtyInCart : qty > 0;

  const getVariantStock = (v: Variant) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Number((v as any).inventory ?? (v as any).stock ?? 0);
  };

  const stockAvailable = directVariant
    ? getVariantStock(directVariant)
    : Number(product.stock ?? 0);

  const getVariantLabel = (v: Variant) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const item = v as any;

    return (
      item.name ||
      item.variant_name ||
      item.title ||
      [item.size, item.color, item.material, item.coating]
        .filter(Boolean)
        .join(" / ") ||
      `Variant ${v.id}`
    );
  };

  const getVariantPrice = (v: Variant) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const item = v as any;
    return item.price ?? item.selling_price ?? item.unit_price ?? null;
  };

  const increment = () => {
    if (qty + 1 > stockAvailable) {
      setShowAlert(true);
      return;
    }

    updateQuantity(product.id, qty + 1, directVariant?.id ?? null);
  };

  const decrement = () => {
    const next = qty - 1;

    if (next <= 0) {
      removeFromCart?.(product.id, directVariant?.id ?? null);
    } else {
      updateQuantity(product.id, next, directVariant?.id ?? null);
    }
  };

  const handleAddToCart = async () => {
    if (outofStock || noPrice) return;

    if (hasMultipleVariants) {
      setShowVariantPopup(true);
      return;
    }

    if (stockAvailable > 0 && quantity > stockAvailable) {
      setShowAlert(true);
      return;
    }
    addToCart(product, directVariant?.id ?? null, quantity);
    trackEvent({
      event_type: "add_to_cart",
      product_id: product.id,
      product_slug: product.slug,
      category: product.category?.name || "",
      meta: {
        ga4: {
          currency: "INR",
          value: Number(product.wholesale_price?.[0]?.unit_price ?? 0) * quantity,
          items: [{
            item_id: String(product.id),
            item_name: product.name,
            quantity,
          }],
        },
      },
    });
  };

  const handleVariantAdd = (selectedVariant: Variant) => {
    const selectedStock = getVariantStock(selectedVariant);

    if (selectedStock <= 0) {
      setShowAlert(true);
      return;
    }

    addToCart(product, selectedVariant.id, quantity);
    trackEvent({
      event_type: "add_to_cart",
      product_id: product.id,
      product_slug: product.slug,
      category: product.category?.name || "",
      meta: {
        ga4: {
          currency: "INR",
          value: Number(product.wholesale_price?.[0]?.unit_price ?? 0) * quantity,
          items: [{
            item_id: String(product.id),
            item_name: product.name,
            item_variant: String(selectedVariant.id),
            quantity,
          }],
        },
      },
    });
    setShowVariantPopup(false);
  };

  return (
    <div>
      {!inCart || hasMultipleVariants ? (
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
          <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/70 to-transparent" />

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
                : hasMultipleVariants && totalProductQty > 0
                  ? `Added Qty: ${totalProductQty}`
                  : hasMultipleVariants
                    ? "Choose Variant"
                    : "Add to Wholesale Order"}

            {!outofStock && !noPrice && (
              <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] uppercase tracking-widest text-blue-300">
                Trade
              </span>
            )}
          </span>
        </button>
      ) : (
        <div className="mt-3 relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-[#07111f] p-1 shadow-[0_10px_40px_-20px_rgba(37,99,235,.45)]">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" />

          <div className="flex h-14 items-center gap-2">
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

            <div className="min-w-0 flex-1 text-center">
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

              <div className="sm:hidden">
                <span className="text-lg font-bold text-blue-300">{qty}</span>
              </div>
            </div>

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

      {/* VARIANT SELECTION POPUP */}
      {showVariantPopup && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/70 px-4 pb-4 backdrop-blur-sm sm:items-center sm:pb-0">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-blue-800/40 bg-gradient-to-b from-slate-950 via-slate-900 to-[#07111f] shadow-[0_30px_100px_-40px_rgba(59,130,246,.9)]">
            <div className="border-b border-slate-800 px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Choose Variant
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Select the option you want to add to wholesale order.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowVariantPopup(false)}
                  className="grid h-9 w-9 place-items-center rounded-full border border-slate-700 bg-slate-900 text-slate-300 hover:border-red-400 hover:text-red-300"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-4">
              <div className="space-y-3">
                {variants.map((v) => {
                  const vStock = getVariantStock(v);
                  const vPrice = getVariantPrice(v);
                  const disabled = vStock <= 0;

                  return (
                    <button
                      key={v.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => handleVariantAdd(v)}
                      className={[
                        "w-full rounded-2xl border p-4 text-left transition-all",
                        disabled
                          ? "cursor-not-allowed border-slate-800 bg-slate-900/50 opacity-50"
                          : "border-slate-700 bg-slate-900/80 hover:border-blue-400 hover:bg-blue-500/10 active:scale-[0.99]",
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-semibold text-white">
                            {getVariantLabel(v)}
                          </div>

                          <div className="mt-1 text-xs text-slate-400">
                            {disabled
                              ? "Out of stock"
                              : `${vStock} item(s) available`}
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          {vPrice !== null && (
                            <div className="text-sm font-bold text-blue-300">
                              ₹{vPrice}
                            </div>
                          )}

                          <div className="mt-1 rounded-full bg-blue-500/15 px-2 py-1 text-[10px] uppercase tracking-widest text-blue-300">
                            Add
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-slate-800 px-5 py-4">
              <button
                type="button"
                onClick={() => setShowVariantPopup(false)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-200 hover:border-slate-500"
              >
                Cancel
              </button>
            </div>
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
