// components/PackingList.tsx
"use client";

import React, { useMemo } from "react";

import Image from "next/image";
import type { Order } from "@/types"; // adjust if your Order type differs
import Barcode from "react-barcode";

interface PackingListProps {
  order: Order;
}

export default function PackingList({ order }: PackingListProps) {
  const barcodeValue = useMemo(() => String(order.id ?? order.id), [order]);
  return (
    <div className="w-full text-sm text-neutral-900 dark:text-neutral-900 bg-white border border-neutral-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Packing Slip</h2>
          <p className="text-xs text-neutral-500">Order #{order.id}</p>
        </div>
        <div className="text-right">
          <p className="text-xs">
            Date: {new Date(order.created_at ?? "").toLocaleDateString()}
          </p>
        </div>
      </div>
      {/* Barcode */}
      <div className="flex flex-col items-end gap-1">
        <Barcode
          value={barcodeValue}
          format="CODE128"
          width={2} // bar width (px)
          height={60} // bar height (px)
          displayValue // show human-readable text
          textMargin={4}
          margin={0}
          lineColor="#000"
          background="#ffffff"
        />
        <span className="text-[10px] text-neutral-500">Scan for Order</span>
      </div>

      {/* Customer Info */}
      <div className="p-4 grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-medium mb-1">Ship To:</h3>
          <p>{order.full_name}</p>
          <p>{order.email}</p>
          <p>
            {order.city}, {order.state} {order.pincode}
          </p>
          <p>{order.country}</p>
        </div>
        <div>
          <h3 className="font-medium mb-1">Contact:</h3>
          <p>{order.email}</p>
          <p>{order.phone}</p>
        </div>
      </div>

      {/* Items */}
      <div className="p-4">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50">
              <th className="text-left p-2">Item</th>
              <th className="text-left p-2">SKU</th>
              <th className="text-right p-2">Qty</th>
            </tr>
          </thead>
          <tbody>
            {order &&
              // eslint-disable-next-line @typescript-eslint/no-explicit-any -- API response is dynamic
              order.items?.map((item: any, i: number) => (
                <tr key={i} className="border-b border-neutral-100">
                  <td className="p-2 flex items-center gap-2">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={40}
                        height={40}
                        className="rounded"
                      />
                    )}
                    {item.name}
                  </td>
                  <td className="p-2">{item.sku || "-"}</td>
                  <td className="p-2 text-right">{item.quantity}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-neutral-200 text-xs text-neutral-500">
        <p>Thank you for your order!</p>
      </div>
    </div>
  );
}
