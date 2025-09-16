// components/ApplyCoupon.tsx
"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";

export default function ApplyCoupon({ email }: { email?: string }) {
  const { validateAndSetCoupon, clearCoupon, coupon } = useCart() as {
    validateAndSetCoupon: (code: string, email?: string) => Promise<void>;
    clearCoupon: () => Promise<void> | void;
    coupon: { code: string; discount: number } | null;
  };
  const [code, setCode] = useState("");

  const onApply = async () => {
    try {
      await validateAndSetCoupon(code.trim(), email);
      setCode("");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      alert(e?.response?.data?.detail || "Failed to apply coupon");
    }
  };

  return (
    <>
      <div className="mt-4">
        <label className="mb-1 block text-xs uppercase tracking-wider opacity-80">
          Promo code
        </label>
        <div className="flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter coupon code"
            className={`w-full rounded-xl border border-neutral-200 dark:border-neutral-800  bg-transparent px-3 py-2 text-sm outline-none`}
          />

          <button
            className={`rounded-xl border  border-neutral-200 dark:border-neutral-800 px-4 py-2 text-sm`}
            onClick={onApply}
          >
            Apply
          </button>
          {coupon && (
            <button
              className={`rounded-xl border  border-neutral-200 dark:border-neutral-800 px-4 py-2 text-sm`}
              onClick={() => clearCoupon()}
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </>
  );
}
