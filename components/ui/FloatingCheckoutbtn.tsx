// components/FloatingCheckoutButton.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useCart } from "@/context/CartContext";

export default function FloatingCheckoutButton() {
  const { cartItems } = useCart();
  const pathname = usePathname();

  // Hide on cart/checkout/thank-you style pages
  const hiddenRoutes = ["/cart", "/checkout", "/orders", "/order-confirmation"];
  const shouldHide =
    hiddenRoutes.some((r) => pathname?.startsWith(r)) ||
    !cartItems ||
    cartItems.length === 0;

  // Derive totals defensively (adjust to your item shape)
  const { count, subtotal } = useMemo(() => {
    const count =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cartItems?.reduce((n: number, it: any) => n + (it.quantity ?? 1), 0) ?? 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const toPrice = (p: any) => {
      if (typeof p === "number") return p;
      if (typeof p === "string")
        return parseFloat(p.replace(/[^\d.]/g, "")) || 0;
      return 0;
    };

    const subtotal =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cartItems?.reduce((sum: number, it: any) => {
        // supports either it.price or it.product.price
        const priceRaw = it.price ?? it.product?.price ?? 0;
        return sum + toPrice(priceRaw) * (it.quantity ?? 1);
      }, 0) ?? 0;

    return { count, subtotal };
  }, [cartItems]);

  if (shouldHide) return null;

  return (
    <div
      className="
        fixed inset-x-4 bottom-4 z-[60]
        pb-[env(safe-area-inset-bottom)]
        md:inset-x-auto md:right-6 md:bottom-6
      "
      aria-live="polite"
    >
      <Link
        href="orders/cart"
        className="
          group flex w-full items-center justify-between gap-3
          rounded-2xl px-4 py-3 text-sm font-semibold
          text-neutral-900 dark:text-neutral-900
          shadow-lg shadow-black/10 ring-1 ring-neutral-200 dark:ring-neutral-800
          backdrop-blur
          gradient-accent
          transition-transform active:scale-[0.99]
          md:min-w-[320px]
        "
      >
        <div className="flex items-center gap-2">
          {/* Cart bubble */}
          <span
            className="
              inline-flex h-6 min-w-6 items-center justify-center rounded-full
              bg-white/80 px-2 text-xs font-bold text-neutral-900
            "
            aria-label={`${count} items in cart`}
          >
            {count}
          </span>
          <span>Checkout</span>
        </div>

        <div className="text-right tabular-nums">
          <span className="text-xs opacity-80 block -mb-0.5">Subtotal</span>
          <span className="text-base">
            {subtotal.toLocaleString(undefined, {
              style: "currency",
              currency: "INR", // ← change if needed
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
      </Link>
    </div>
  );
}
