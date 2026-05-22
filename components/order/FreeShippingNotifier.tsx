"use client";

import React from "react";
import { useMemo } from "react";
interface Props {
  subtotal: number;
}

import { useCart } from "@/context/CartContext";
import { money } from "@/lib/money";
const FreeShippingNotifier = ({ subtotal }: Props) => {
  const { cartItems } = useCart();
  const hasFreeShippingItem = useMemo(
    () => cartItems.some((it) => it.is_free_shipping === true),
    [cartItems],
  );
  const FREE_SHIP_THRESHOLD = hasFreeShippingItem ? 0 : Number(2500);

  const freeShipDiff = useMemo(
    () => Math.max(0, FREE_SHIP_THRESHOLD - subtotal),
    [subtotal, FREE_SHIP_THRESHOLD],
  );
  const freeShipUnlocked = freeShipDiff === 0;

  const progressPct = useMemo(
    () => Math.min(100, Math.floor((subtotal / FREE_SHIP_THRESHOLD) * 100)),
    [subtotal, FREE_SHIP_THRESHOLD],
  );
  // const shipping = useMemo(
  //   () => (freeShipUnlocked ? 0 : SHIPPING_FEE),
  //   [freeShipUnlocked]
  // );

  return (
    <div>
      {/* ✅ Free shipping notifier */}
      {cartItems.length > 0 && (
        <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm">
              {freeShipUnlocked ? (
                <span className="text-emerald-400">
                  You’ve unlocked <strong>Free Shipping</strong>!
                </span>
              ) : (
                <>
                  Add{" "}
                  <strong className="text-amber-300">
                    {money(freeShipDiff)}
                  </strong>{" "}
                  more to get <strong>Free Shipping</strong>.
                </>
              )}
            </p>
            <span className="text-xs text-zinc-400">
              Target: {money(FREE_SHIP_THRESHOLD)}
            </span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-zinc-800">
            <div
              className={`h-2 rounded-full transition-all ${
                freeShipUnlocked ? "bg-emerald-400" : "bg-amber-300"
              }`}
              style={{ width: `${progressPct}%` }}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progressPct}
              role="progressbar"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FreeShippingNotifier;
