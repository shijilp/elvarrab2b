// components/FloatingCheckoutButton.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, ArrowRight, PackageCheck } from "lucide-react";

export default function FloatingCheckoutButtonOne() {
  const { cartItems } = useCart();
  const pathname = usePathname();

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

  const { count, subtotal, skuCount, qtyPerSku, eligible } = useMemo(() => {
    const count =
      cartItems?.reduce(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (n: number, it: any) => n + Number(it.quantity ?? 1),
        0,
      ) ?? 0;

    const skuCount = cartItems?.length ?? 0;
    const qtyPerSku = skuCount > 0 ? count / skuCount : 0;

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
        return sum + toPrice(priceRaw) * Number(it.quantity ?? 1);
      }, 0) ?? 0;

    const eligible = subtotal >= 2000 && qtyPerSku >= 1.4;

    return { count, subtotal, skuCount, qtyPerSku, eligible };
  }, [cartItems]);

  if (shouldHide) return null;

  return (
    <div
      className="
        fixed bottom-5 right-5 z-[60]
        hidden md:block
        pb-[env(safe-area-inset-bottom)]
      "
      aria-live="polite"
    >
      <Link
        href="/orders/cart"
        className={[
          "group relative flex min-w-[310px] max-w-[340px] items-center gap-4 overflow-hidden rounded-2xl border p-3",
          "bg-gradient-to-r from-[#06111f] via-slate-950 to-[#071827]",
          "shadow-[0_20px_70px_-25px_rgba(37,99,235,.65)] backdrop-blur-xl",
          "transition-all duration-300 hover:-translate-y-1 active:scale-[0.985]",
          eligible
            ? "border-cyan-400/40 hover:border-cyan-300/70"
            : "border-amber-400/40 hover:border-amber-300/70",
        ].join(" ")}
      >
        <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />

        <span className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-500/10 blur-2xl" />

        <div
          className={[
            "relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl border",
            eligible
              ? "border-cyan-400/40 bg-cyan-500/10 text-cyan-300"
              : "border-amber-400/40 bg-amber-500/10 text-amber-300",
          ].join(" ")}
        >
          {eligible ? (
            <PackageCheck className="h-5 w-5" />
          ) : (
            <ShoppingCart className="h-5 w-5" />
          )}

          <span
            className="
              absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center
              rounded-full bg-white px-1.5 text-[10px] font-bold text-slate-950
            "
            aria-label={`${count} items in cart`}
          >
            {count}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-bold text-white">
              Wholesale Cart
            </span>

            <span
              className={[
                "rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em]",
                eligible
                  ? "bg-cyan-500/15 text-cyan-300"
                  : "bg-amber-500/15 text-amber-300",
              ].join(" ")}
            >
              {eligible ? "Eligible" : "Pending"}
            </span>
          </div>

          <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-400">
            <span>{skuCount} SKU</span>
            <span>Qty/SKU {qtyPerSku.toFixed(2)}</span>
          </div>

          <div className="mt-1 text-sm font-semibold tabular-nums text-cyan-100">
            {subtotal.toLocaleString(undefined, {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 2,
            })}
          </div>
        </div>

        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-slate-700 bg-slate-900 text-slate-200 transition group-hover:border-cyan-400/50 group-hover:text-cyan-300">
          <ArrowRight className="h-4 w-4" />
        </div>
      </Link>
    </div>
  );
}
