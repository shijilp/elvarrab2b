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
  const hiddenRoutes = [
    "/cart",
    "/checkout",
    "/orders",
    "/order-confirmation",
    "/orders/cart",
  ];
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
        const priceRaw = it.price ?? it.product?.price ?? 0;
        return sum + toPrice(priceRaw) * (it.quantity ?? 1);
      }, 0) ?? 0;

    return { count, subtotal };
  }, [cartItems]);

  if (shouldHide) return null;

  return (
    <div
      className="
        fixed bottom-4 right-4 z-[60]
        pb-[env(safe-area-inset-bottom)]
        md:bottom-6 md:right-6 hidden md:block
      "
      aria-live="polite"
    >
      <Link
        href="/orders/cart"
        className="
          group flex items-center justify-between gap-2
          rounded-xl px-3 py-2 text-[13px] font-semibold
          text-neutral-900 dark:text-neutral-900
          shadow-lg shadow-black/10 ring-1 ring-neutral-200 dark:ring-neutral-800
          backdrop-blur-sm
          btn-gradient-accent
          transition-transform active:scale-[0.99] hover:translate-y-0.5
          md:min-w-[220px] md:max-w-[260px] whitespace-nowrap
        "
      >
        <div className="flex items-center gap-2">
          {/* Cart bubble */}
          <span
            className="
              inline-flex h-5 min-w-5 items-center justify-center rounded-full
              bg-white/85 px-1.5 text-[10px] font-bold leading-none
              text-neutral-900
            "
            aria-label={`${count} items in cart`}
          >
            {count}
          </span>
          <span className="tracking-tight">Checkout</span>
        </div>

        <div className="text-right tabular-nums">
          <span className="block -mb-0.5 text-[10px] opacity-70">Subtotal</span>
          <span className="text-sm">
            {subtotal.toLocaleString(undefined, {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
      </Link>
    </div>
  );
}
