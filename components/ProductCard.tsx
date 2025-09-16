"use client";
import { useMemo } from "react";
import { useCart } from "@/context/CartContext";
import { Product } from "@/types";
import Image from "next/image";
import Link from "next/link";
import AddToCartBtn from "./ui/AddToCartBtn";
import { Crown } from "lucide-react"; // install lucide-react if not already

export default function ProductCard({ product }: { product: Product }) {
  const { cartItems } = useCart();

  // Find this product in the cart (adjust to your cart item shape if needed)
  const line = useMemo(
    () => cartItems?.find((it) => (it?.id ?? it.id) === product.id),
    [cartItems, product.id]
  );
  const qty = line?.quantity ?? 0;
  const inCart = qty > 0;
  const isOutOfStock = !product.in_stock;

  return (
    <div className="group rounded-2xl p-2 transition-transform hover:-translate-y-0.5 ring-1 ring-neutral-200 dark:ring-neutral-800 bg-white/90 dark:bg-neutral-900/70">
      <div className="relative">
        <Link href={`product/${product.slug}`}>
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
        product.tag === "premiume"
          ? "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white shadow-md ring-1 ring-yellow-400"
          : "bg-[var(--chip-bg)] text-[var(--chip-fg)]"
      }`}
            >
              {product.tag === "premiume" && (
                <Crown className="w-4 h-4 text-yellow-200 drop-shadow-sm" />
              )}
              {product.tag === "premiume" ? "Premium" : product.tag}

              {/* Glossy highlight overlay */}
              {product.tag === "premiume" && (
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
            <span className="absolute right-2 top-2 rounded-full bg-emerald-500/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
              In cart × {qty}
            </span>
          )}
        </Link>
      </div>

      <div className="p-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">{product.name}</h3>
          {/* price if you have it */}
          <span className="text-sm opacity-80">
            {(product as Product).price ?? ""}
          </span>
        </div>

        <AddToCartBtn product={product} outofStock={isOutOfStock} />
      </div>
    </div>
  );
}
