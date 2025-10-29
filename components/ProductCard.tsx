"use client";
import { useMemo } from "react";
import { Product } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { Crown } from "lucide-react"; // install lucide-react if not already
import { money } from "@/lib/utils";
import AddToRFQBtn from "./ui/AddToRfqBtn";
import { useRFQCart } from "@/context/RFQCartContext";

export default function ProductCard({ product }: { product: Product }) {
  const { rfq } = useRFQCart();

  // Find this product in the cart (adjust to your cart item shape if needed)
  const line = useMemo(
    () => rfq?.items?.find((it) => (it?.id ?? it.id) === product.id),
    [rfq, product.id]
  );
  const qty = line?.requested_qty ?? 0;
  const inCart = qty > 0;
  const isOutOfStock = product.stock < 1 ? true : false;

  return (
    <div className="group rounded-2xl p-2 transition-transform hover:-translate-y-0.5 ring-1 ring-neutral-200 dark:ring-neutral-800 bg-white/90 dark:bg-neutral-900/70">
      <div className="relative">
        <Link href={`products/${product.slug}`}>
          <Image
            src={product.image}
            alt={product.name}
            width={900}
            height={1000}
            sizes="(min-width: 1024px) 600px, 100vw"
            className={`aspect-[4/5] w-full rounded-xl object-cover ${
              isOutOfStock ? "opacity-40" : "opacity-100"
            }`}
          />

          {product.tag && (
            <span
              className={` flex items-center gap-1 absolute left-2 top-2 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full overflow-hidden
      ${
        product.tag === "premium"
          ? "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white shadow-md ring-1 ring-yellow-400"
          : "bg-[var(--chip-bg)] text-[var(--chip-fg)]"
      }`}
            >
              {product.tag === "premium" && (
                <Crown className="w-4 h-4 text-yellow-200 drop-shadow-sm" />
              )}
              {product.tag === "premium" ? "Premium" : product.tag}

              {/* Glossy highlight overlay */}
              {product.tag === "premium" && (
                <span className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent rounded-full" />
              )}
            </span>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white font-semibold text-sm z-10">
              Out of Stock
            </div>
          )}

          {/* In-cart badge */}
          {inCart && (
            <span className="absolute hidden md:block right-2 top-2 rounded-full bg-emerald-500/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
              In cart × {qty}
            </span>
          )}
        </Link>
      </div>

      <div className="p-2">
        <div className="flex-col items-center justify-between">
          <h3 className="text-sm font-medium text-nowrap overflow-hidden text-ellipsis">
            {product.name}
          </h3>
          {/* price if you have it */}

          <div className="mt-2 flex items-center justify-between">
            <div className="text-sm font-semibold">
              {(product as Product).compare_at_price ? (
                <>
                  <span>{money(product.price as number)}</span>
                </>
              ) : (
                <span>{money(product.price as number)}</span>
              )}
            </div>
          </div>
        </div>
        <AddToRFQBtn product={product} />
        {/* <AddToCartBtn product={product} outofStock={isOutOfStock} /> */}
      </div>
    </div>
  );
}
