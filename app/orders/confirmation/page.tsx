import OrderConfirmationClient from "@/components/pages/OrderConfirmationClient";
import { Suspense } from "react";

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <OrderConfirmationClient />
    </Suspense>
  );
}
