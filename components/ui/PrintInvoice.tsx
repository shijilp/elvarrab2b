// components/pdf/Invoice.tsx
"use client";
import React from "react";
import { pdf } from "@react-pdf/renderer";
import { InvoiceDocument, OrderForPdf } from "../InvoicePDF";

export function InvoiceDownloadButton({
  order,
  className = "rounded-xl border px-4 py-2 text-sm",
}: {
  order: OrderForPdf;
  className?: string;
}) {
  const [busy, setBusy] = React.useState(false);

  const handleDownload = async () => {
    try {
      setBusy(true);
      const blob = await pdf(<InvoiceDocument order={order} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${order.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={busy}
      className={className}
      style={{ cursor: busy ? "progress" : "pointer" }}
    >
      {busy ? "Preparing…" : "Download Invoice (PDF)"}
    </button>
  );
}
