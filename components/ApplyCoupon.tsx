// components/ApplyCoupon.tsx
"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toAlertFromApiError } from "@/lib/apiCouponError";
import AlertModal from "./AlertModal";

export default function ApplyCoupon({
  email,
  shippingcost,
}: {
  email?: string;
  shippingcost: number | 0;
}) {
  const { validateAndSetCoupon, clearCoupon, coupon } = useCart() as {
    validateAndSetCoupon: (
      code: string,
      email?: string,
      shippingcost?: number,
    ) => Promise<void>;

    clearCoupon: () => Promise<void> | void;
    coupon: { code: string; discount: number } | null;
  };
  const [alert, setAlert] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: "info" | "warning" | "error" | "success";
  }>({
    show: false,
    title: "Alert",
    message: "",
    type: "info",
  });
  const openAlert = (opts: Omit<typeof alert, "show">) =>
    setAlert({ show: true, ...opts });
  const closeAlert = () => setAlert((a) => ({ ...a, show: false }));

  const [applying, setApply] = useState(false);
  const { user } = useAuth();

  const [code, setCode] = useState("");

  const onApply = async () => {
    // if (!user) {
    //   setAlert({
    //     show: true,
    //     title: "Sign in Required!!!",
    //     message: "Please login to apply the code",
    //     type: "warning",
    //   });
    //   return;
    // }

    setApply(true);
    try {
      await validateAndSetCoupon(code.trim(), email, shippingcost);
      setCode("");
      setApply(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      openAlert(toAlertFromApiError(e));

      setApply(false);
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
            disabled={applying}
            className={`w-full rounded-xl border border-neutral-200 dark:border-neutral-800
    bg-transparent px-3 py-2 text-sm outline-none
    ${applying ? "animate-pulse bg-neutral-100 dark:bg-neutral-900" : ""}
  `}
          />

          <button
            disabled={applying}
            className={`rounded-xl border  border-neutral-200 dark:border-neutral-800 px-4 py-2 text-sm`}
            onClick={onApply}
          >
            {applying ? "Applying" : "Apply"}
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
      <AlertModal
        show={alert.show}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={closeAlert}
        autoCloseMs={alert.type === "success" ? 2000 : undefined}
      />
    </>
  );
}
