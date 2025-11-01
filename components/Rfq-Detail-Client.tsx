"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type RFQItem = {
  id: number;
  product:
    | number
    | { id: number; name?: string; slug?: string; image_url?: string };
  requested_qty: number;
  remark?: string;
};

type RFQ = {
  id: number;
  status: "draft" | "submitted" | "under_review" | "quoted" | "closed";
  items: RFQItem[];
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  notes?: string;
  created_at: string;
  quote?: {
    id: number;
    number: string;
    grand_total?: number;
    currency?: string;
  };
};

export default function RFQDetailClient({ id }: { id: string }) {
  const { user } = useAuth();
  const [rfq, setRfq] = useState<RFQ | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/b2b/rfq/${id}/`); // or /wholesale/rfq/
      setRfq(data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setError("Failed to load RFQ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, [id]);

  const totalQty = useMemo(
    () =>
      (rfq?.items || []).reduce(
        (s, it) => s + Number(it.requested_qty || 0),
        0
      ),
    [rfq]
  );

  const submit = async () => {
    if (!rfq?.id) return;
    setBusy(true);
    try {
      await api.post(`/b2b/rfq/${rfq.id}/submit/`, {
        customer_name: rfq.customer_name || user?.first_name || "Customer",
        customer_email: rfq.customer_email || user?.email || "",
        customer_phone: rfq.customer_phone || "",
        notes: rfq.notes || "",
      });
      await load();
    } finally {
      setBusy(false);
    }
  };

  const buildQuote = async () => {
    if (!rfq?.id) return;
    setBusy(true);
    try {
      const { data } = await api.post(`/b2b/rfq/${rfq.id}/build-quote/`);
      window.location.href = `/admin/quotes/${data.id}`;
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-dvh bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
      </main>
    );
  }
  if (error || !rfq) {
    return (
      <main className="min-h-dvh bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="rounded-2xl border border-red-900/40 bg-red-950/30 px-5 py-4 text-sm text-red-200">
          {error || "RFQ not found."}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-zinc-950 text-zinc-100">
      <section className="mx-auto max-w-7xl px-4 py-6 sm:py-10">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">RFQ #{rfq.id}</h1>
            <div className="mt-1 text-sm text-zinc-400">
              {new Date(rfq.created_at).toLocaleString()} · {rfq.items.length}{" "}
              lines · {totalQty} pcs
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusPill status={rfq.status} />
              {rfq.quote?.id && (
                <Link
                  href={`/quotes/${rfq.quote.id}`}
                  className="rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-3 py-1 text-xs font-semibold text-neutral-900 hover:brightness-110"
                >
                  View Quote {rfq.quote.number ? `· ${rfq.quote.number}` : ""}
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/rfqs"
              className="rounded-xl border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-800"
            >
              Back to RFQs
            </Link>

            {/* Buyer actions */}
            {rfq.status === "draft" && (
              <>
                <Link
                  href="/wholesale/rfq"
                  className="rounded-xl border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-800"
                >
                  Edit RFQ
                </Link>
                <button
                  onClick={submit}
                  disabled={busy}
                  className="rounded-xl bg-amber-400 px-3 py-2 text-sm font-semibold text-black hover:brightness-110 disabled:opacity-60"
                >
                  {busy ? "Submitting…" : "Submit RFQ"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-6 flex flex-wrap items-center gap-2 text-xs">
          <Step label="Draft" active />
          <Step label="Submitted" active={rfq.status !== "draft"} />
          <Step
            label="Under Review"
            active={["under_review", "quoted"].includes(rfq.status)}
          />
          <Step label="Quoted" active={rfq.status === "quoted"} />
        </div>

        {/* Customer block (if present) */}
        {(rfq.customer_name ||
          rfq.customer_email ||
          rfq.customer_phone ||
          rfq.notes) && (
          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
            <h2 className="text-lg font-semibold">Buyer Details</h2>
            <div className="mt-2 grid gap-2 text-sm text-zinc-300 sm:grid-cols-2">
              {rfq.customer_name && (
                <div>
                  <span className="text-zinc-400">Name:</span>{" "}
                  {rfq.customer_name}
                </div>
              )}
              {rfq.customer_email && (
                <div>
                  <span className="text-zinc-400">Email:</span>{" "}
                  {rfq.customer_email}
                </div>
              )}
              {rfq.customer_phone && (
                <div>
                  <span className="text-zinc-400">Phone:</span>{" "}
                  {rfq.customer_phone}
                </div>
              )}
              {rfq.notes && (
                <div className="sm:col-span-2">
                  <span className="text-zinc-400">Notes:</span> {rfq.notes}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="mt-6 space-y-3">
          {(rfq.items || []).map((it) => {
            const prod =
              typeof it.product === "object" ? it.product : undefined;
            return (
              <div
                key={it.id}
                className="flex gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-3 sm:p-4"
              >
                <Image
                  src={prod?.image_url || "/placeholder.png"}
                  alt={prod?.name || `#${prod?.id ?? it.product}`}
                  width={96}
                  height={96}
                  className="h-24 w-24 flex-none rounded-xl object-cover ring-1 ring-zinc-800"
                />
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-1 font-medium text-zinc-100">
                    {prod?.name || `#${prod?.id ?? it.product}`}
                  </div>
                  {prod?.slug && (
                    <div className="mt-0.5 line-clamp-1 text-xs text-zinc-400">
                      {prod.slug}
                    </div>
                  )}
                  <div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-2 py-1 text-sm">
                    <span className="text-zinc-400">Requested</span>
                    <span className="font-medium">{it.requested_qty}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {it.remark && (
                    <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs text-zinc-300">
                      {it.remark}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer help text */}
        <p className="mt-6 text-sm text-zinc-400">
          Prices, taxes, shipping, and terms will be added by our team in your
          formal quote.
        </p>
      </section>
    </main>
  );
}

/* ---- UI bits ---- */
function StatusPill({ status }: { status: RFQ["status"] }) {
  const map: Record<string, string> = {
    draft: "bg-zinc-800 text-zinc-200",
    submitted: "bg-blue-900/40 text-blue-200 ring-1 ring-blue-600/30",
    under_review: "bg-amber-900/30 text-amber-200 ring-1 ring-amber-600/30",
    quoted: "bg-emerald-900/30 text-emerald-200 ring-1 ring-emerald-600/30",
    closed: "bg-zinc-800 text-zinc-300",
  };
  const label = {
    draft: "Draft",
    submitted: "Submitted",
    under_review: "Under Review",
    quoted: "Quoted",
    closed: "Closed",
  }[status];
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-[11px] ${
        map[status] || "bg-zinc-800"
      }`}
    >
      {label}
    </span>
  );
}

function Step({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 ${
        active ? "bg-zinc-800 text-zinc-100" : "bg-zinc-900 text-zinc-500"
      } text-[11px]`}
    >
      {label}
    </span>
  );
}
