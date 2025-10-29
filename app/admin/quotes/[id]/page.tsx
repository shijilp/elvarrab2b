"use client";

import React from "react";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type QuoteLine = {
  id: number;
  product: number;
  name: string;
  qty: number;
  unit_price: string | number;
  tax_pct: string | number;
};

type Quote = {
  id: number;
  number: string;
  currency: string;
  subtotal: number;
  tax_total: number;
  shipping_total: number;
  grand_total: number;
  terms: string;
  valid_until?: string;
  items: QuoteLine[];
  status?: "draft" | "sent" | "accepted" | "expired" | "quoted"; // <-- add
  pdf_url?: string; // <-- add (if backend returns)
};

export default function QuoteEditor({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // ✅ unwrap the async params (this is what the warning is asking for)
  const { id } = React.use(params);

  const router = useRouter();
  const [q, setQ] = useState<Quote | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await api.get(`/b2b/quotes/${id}/`);
    setQ(data);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const updateLine = async (lineId: number, patch: Partial<QuoteLine>) => {
    setSaving(true);
    try {
      const { data } = await api.patch(
        `/b2b/quotes/${q?.id}/items/${lineId}/`,
        patch
      );
      setQ(data); // server returns recomputed quote
    } finally {
      setSaving(false);
    }
  };

  const updateTotals = async (patch: { shipping_total?: number }) => {
    setSaving(true);
    try {
      const { data } = await api.patch(
        `/b2b/quotes/${q?.id}/update-totals/`,
        patch
      );
      setQ(data);
    } finally {
      setSaving(false);
    }
  };

  const saveMeta = async (patch: Partial<Quote>) => {
    setSaving(true);
    try {
      const { data } = await api.patch(`/b2b/quotes/${q?.id}/`, patch);
      setQ(data);
    } finally {
      setSaving(false);
    }
  };
  const finalize = async () => {
    const { data } = await api.post(`/b2b/quotes/${q?.id}/finalize/`, {});
    setQ(data); // now has status='quoted' and pdf_url
  };
  const sendEmail = async () => {
    await api.post(`/b2b/quotes/${q?.id}/send/`, {});
    await load(); // refresh to get status='sent' and sent_at
  };
  const downloadPdf = async () => {
    if (!q?.id) return;
    try {
      // Try file endpoint first
      const res = await api.get(`/b2b/quotes/${q.id}/pdf/`, {
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${q.number || "quote"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      // fallback: if server exposes a direct pdf_url, use it
      if (q?.pdf_url) {
        window.open(q.pdf_url, "_blank");
        return;
      }
      alert("Unable to download the PDF. Please try again.");
    }
  };

  if (!q) return <div className="container py-10">Loading…</div>;

  return (
    <main className="container mx-auto py-8">
      <h1 className="text-2xl font-semibold">Quote {q.number}</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="space-y-3">
          {q.items.map((it) => (
            <div key={it.id} className="rounded-2xl border border-zinc-800 p-4">
              <div className="text-sm opacity-70">#{it.product}</div>
              <input
                className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
                value={it.name}
                onChange={(e) => updateLine(it.id, { name: e.target.value })}
              />
              <div className="mt-3 grid grid-cols-3 gap-2">
                <input
                  type="number"
                  className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
                  value={it.qty}
                  min={1}
                  onChange={(e) =>
                    updateLine(it.id, { qty: Number(e.target.value || 1) })
                  }
                />
                <input
                  type="number"
                  step="0.01"
                  className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
                  value={it.unit_price}
                  onChange={(e) =>
                    updateLine(it.id, { unit_price: e.target.value })
                  }
                />
                <input
                  type="number"
                  step="0.01"
                  className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
                  value={it.tax_pct}
                  onChange={(e) =>
                    updateLine(it.id, { tax_pct: e.target.value })
                  }
                />
              </div>
            </div>
          ))}
        </section>

        <aside className="space-y-3 rounded-2xl border border-zinc-800 p-4">
          <div className="text-sm">
            Subtotal: {q.subtotal} {q.currency}
          </div>
          <div className="text-sm">
            Tax: {q.tax_total} {q.currency}
          </div>
          <div className="text-sm">
            Shipping:
            <input
              type="number"
              step="0.01"
              className="ml-2 w-28 rounded-xl border border-zinc-800 bg-zinc-950 px-2 py-1 text-sm"
              value={q.shipping_total}
              onChange={(e) =>
                updateTotals({ shipping_total: Number(e.target.value || 0) })
              }
            />
          </div>
          <div className="font-semibold">
            Grand Total: {q.grand_total} {q.currency}
          </div>

          <textarea
            className="mt-3 h-24 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
            value={q.terms}
            onChange={(e) => saveMeta({ terms: e.target.value })}
          />
          <input
            type="date"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
            value={q.valid_until?.slice(0, 10) || ""}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange={(e) => saveMeta({ valid_until: e.target.value as any })}
          />

          {/* ---- Finalize / Send Quote ---- */}
          <button
            disabled={saving || q.status === "quoted" || q.status === "sent"}
            onClick={finalize}
            className="w-full rounded-2xl bg-amber-400 px-5 py-2 font-semibold text-black hover:brightness-110 disabled:opacity-60"
          >
            {q.status === "quoted" || q.status === "sent"
              ? "Finalized"
              : "Finalize (Generate PDF)"}
          </button>
          {q.pdf_url && (
            <a
              href={q.pdf_url}
              className="block w-full rounded-xl border border-zinc-700 px-5 py-2 text-center text-sm hover:bg-zinc-800"
              target="_blank"
              rel="noopener noreferrer"
            >
              Download PDF
            </a>
          )}
          <button
            disabled={!q.pdf_url || q.status === "sent"}
            onClick={sendEmail}
            className="w-full rounded-xl border border-zinc-700 px-5 py-2 text-sm hover:bg-zinc-800 disabled:opacity-60"
          >
            {q.status === "sent" ? "Sent" : "Send Email"}
          </button>
          {/* ---- Download / View PDF ---- */}
          <div className="grid grid-cols-1 gap-2">
            {(q.status === "sent" || q.pdf_url) && (
              <button
                onClick={downloadPdf}
                className="w-full rounded-xl border border-zinc-700 px-5 py-2 text-sm hover:bg-zinc-800"
              >
                Download PDF
              </button>
            )}
            {q.pdf_url && (
              <a
                href={q.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full rounded-xl border border-zinc-700 px-5 py-2 text-center text-sm hover:bg-zinc-800"
              >
                View PDF
              </a>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
