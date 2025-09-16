"use client";

import React from "react";
import { useMemo } from "react";
import { useCart } from "@/context/CartContext";
import { Product } from "@/types";
interface Props {
  product: Product;
  className?: string;
  outofStock?: boolean;
}

const AddToCartBtn = ({ product, className, outofStock }: Props) => {
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();
  // Find this product in the cart (adjust to your cart item shape if needed)
  const line = useMemo(
    () => cartItems?.find((it) => (it?.id ?? it.id) === product.id),
    [cartItems, product.id]
  );
  const qty = line?.quantity ?? 0;
  const inCart = qty > 0;

  const increment = () => updateQuantity(product.id, qty + 1);
  const decrement = () => {
    const next = qty - 1;
    if (next <= 0) {
      removeFromCart?.(product.id); // safe optional
    } else {
      updateQuantity(product.id, next);
    }
  };
  return (
    <div>
      {/* CTA */}
      {!inCart ? (
        <button
          onClick={() => addToCart(product)}
          disabled={outofStock}
          className={`mt-3 w-full rounded-xl px-3 py-2 text-sm text-neutral-900 dark:text-neutral-900 gradient-accent ${className} ${
            outofStock ? "opacity-30" : ""
          } `}
        >
          Add to Cart
        </button>
      ) : (
        <div className="mt-3 grid grid-cols-[auto_1fr_auto] items-center gap-1">
          <button
            onClick={decrement}
            aria-label="Decrease quantity"
            className="rounded-xl px-3 py-2 ring-1 ring-neutral-300 dark:ring-neutral-700  hover:bg-amber-50 hover:text-black"
          >
            −
          </button>
          <div className="text-center text-sm">
            Qty: <span className="font-medium">{qty}</span>
          </div>
          <button
            onClick={increment}
            aria-label="Increase quantity"
            className="rounded-xl px-3 py-2 ring-1 hover:bg-amber-50 hover:text-black ring-neutral-300 dark:ring-neutral-700"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
};

export default AddToCartBtn;
