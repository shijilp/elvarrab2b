"use client";
import { useMemo } from "react";
import { Product } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { Crown } from "lucide-react";
import { money } from "@/lib/utils";
import AddToRFQBtn from "./ui/AddToRfqBtn";
import { useRFQCart } from "@/context/RFQCartContext";
import AddToRFQBtn2 from "./ui/AddToRfqBtn2";

type Tier = { min_qty: number; unit_price: number | string };

export default function ProductCardNew({ product }: { product: Product }) {
  const { rfq } = useRFQCart();
  //te
  // ✅ RFQ line lookup (items have `product` id, not `id`)
  const line = useMemo(
    () => rfq?.items?.find((it) => it.product === product.id),
    [rfq?.items, product.id],
  );
  const qty = line?.requested_qty ?? 0;
  const inCart = qty > 0;
  const isOutOfStock = product.stock < 1;

  // ✅ Tiers (null-safe + sorted)
  const tiers: Tier[] = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const arr = (product as any)?.wholesale_price ?? [];
    return Array.isArray(arr)
      ? [...arr].sort((a: Tier, b: Tier) => a.min_qty - b.min_qty)
      : [];
  }, [product]);
  const tierMin = tiers[0]?.min_qty ?? 1;
  const available = product.stock ?? 0;
  const moq = available > 0 ? Math.min(available, tierMin) : tierMin;

  //const moq = tiers[0]?.min_qty ?? 1;
  const fromPrice = tiers[0]?.unit_price ?? product.price;

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
              className={`flex items-center gap-1 absolute left-2 top-2 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full overflow-hidden
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

          {inCart && (
            <span className="absolute hidden md:block right-2 top-2 rounded-full bg-emerald-500/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
              In RFQ × {qty}
            </span>
          )}
        </Link>
      </div>

      <div className="p-2">
        <div className="flex-col items-center justify-between">
          <h3 className="text-sm font-medium text-nowrap overflow-hidden text-ellipsis">
            {product.name}
          </h3>

          {/* ✅ Wholesale pricing area */}
          {tiers.length > 0 ? (
            <div className="mt-2 space-y-1">
              {/* From price */}
              <div className="text-sm font-semibold">
                From {money(Number(fromPrice), product.currency)}
              </div>

              {/* Tier chips */}
              <div className="flex flex-wrap gap-1 mt-1">
                {tiers.map((t) => (
                  <span
                    key={t.min_qty}
                    className="px-2 py-0.5 rounded-full text-[10px] bg-zinc-800 text-zinc-200"
                    title={`${t.min_qty}+ pcs @ ${money(
                      Number(t.unit_price),
                      product.currency,
                    )}`}
                  >
                    {t.min_qty}+ pcs —{" "}
                    {money(Number(t.unit_price), product.currency)}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            // Fallback to retail price if no tiers
            <div className="mt-2 flex items-center justify-between">
              <div className="text-sm font-semibold">
                <span className=" text-zinc-500"> Contact for price</span>
              </div>
            </div>
          )}
        </div>

        {/* ✅ Enforce MOQ at add-time via minQty; defaults to moq */}
        <AddToRFQBtn2 product={product} defaultQty={moq} minQty={moq} />
      </div>
    </div>
  );
}
