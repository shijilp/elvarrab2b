"use client";

import Link from "next/link";
import React from "react";
import { useCart } from "@/context/CartContext";
import { useMemo } from "react";

const CartBtnonHeader = () => {
  const { cartItems } = useCart();

  const { count } = useMemo(() => {
    const count =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cartItems?.reduce((n: number, it: any) => n + (it.quantity ?? 1), 0) ?? 0;
    // const toPrice = (p: any) => {
    //   if (typeof p === "number") return p;
    //   if (typeof p === "string")
    //     return parseFloat(p.replace(/[^\d.]/g, "")) || 0;
    //   return 0;
    // };

    return { count };
  }, [cartItems]);

  return (
    <div>
      {" "}
      <Link href={"orders/cart"}>
        <button
          className={`rounded-2xl px-3 py-1.5 text-xs   text-neutral-900 dark:text-neutral-900 gradient-accent cursor-pointer  `}
        >
          Cart ({count})
        </button>
      </Link>
    </div>
  );
};

export default CartBtnonHeader;
