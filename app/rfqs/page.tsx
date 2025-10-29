"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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

export default function RFQListPage() {
  const { user } = useAuth();
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false); // staff-only toggle

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      // Your RFQViewSet already filters by owner unless staff.
      // If you want a staff-all toggle, you can pass a query param and honor it server-side,
      // or just rely on server behavior. Here we just call the list.
      const { data } = await api.get(
        "/b2b/rfq/",
        showAll ? { params: { all: 1 } } : {}
      );
      setRfqs(Array.isArray(data) ? data : []);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      console.error(e);
      setError("Failed to load RFQs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAll]);

  const drafts = useMemo(
    () => rfqs.filter((r) => r.status === "draft"),
    [rfqs]
  );

  const submitDraft = async (rfq: RFQ) => {
    // Minimal submit (collect details inline if needed on RFQ Cart page)
    // Here we just hit submit without extra details.
    await api.post(`/wholesale/rfq/${rfq.id}/submit/`, {
      customer_name: rfq.customer_name || user?.first_name || "Customer",
      customer_email: rfq.customer_email || user?.email || "",
      customer_phone: rfq.customer_phone || "",
      notes: rfq.notes || "",
    });
    await load();
  };

  return (
    <main className="min-h-dvh bg-zinc-950 text-zinc-100">
      <section className="mx-auto max-w-7xl px-4 py-6 sm:py-10">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Your RFQs</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Track request status and access quotes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/wholesale/rfq"
              className="rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[var(--text-dark)]"
            >
              Open RFQ Cart
            </Link>

            {user?.isAdmin && (
              <label className="flex items-center gap-2 text-xs text-zinc-300">
                <input
                  type="checkbox"
                  checked={showAll}
                  onChange={(e) => setShowAll(e.target.checked)}
                />
                Show all RFQs (staff)
              </label>
            )}
          </div>
        </div>

        {/* States */}
        {loading && (
          <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center">
            <p className="text-zinc-300">Loading RFQs…</p>
          </div>
        )}
        {error && !loading && (
          <div className="mt-8 rounded-2xl border border-red-900/40 bg-red-950/30 p-4 text-sm text-red-200">
            {error}
          </div>
        )}
        {!loading && rfqs.length === 0 && (
          <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center">
            <p className="text-zinc-300">No RFQs yet.</p>
            <p className="mt-1 text-xs text-zinc-400">
              Add items from product pages using “Request Quote (RFQ)”.
            </p>
          </div>
        )}

        {/* List */}
        <div className="mt-6 grid gap-3">
          {rfqs.map((r) => {
            const created = new Date(r.created_at);
            const itemCount =
              r.items?.reduce(
                (s, it) => s + Number(it.requested_qty || 0),
                0
              ) || 0;

            return (
              <div
                key={r.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-zinc-400">RFQ</span>
                      <span className="font-semibold">#{r.id}</span>
                      <StatusBadge status={r.status} />
                    </div>
                    <div className="mt-1 text-xs text-zinc-400">
                      {created.toLocaleString()} · {r.items?.length || 0} lines
                      · {itemCount} pcs
                    </div>
                    {r.customer_name && (
                      <div className="mt-0.5 text-xs text-zinc-400">
                        {r.customer_name}{" "}
                        {r.customer_email ? `· ${r.customer_email}` : ""}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Draft: continue editing/submit */}
                    {r.status === "draft" && (
                      <>
                        <Link
                          href="/wholesale/rfq"
                          className="rounded-xl border border-zinc-700 px-3 py-1.5 text-sm hover:bg-zinc-800"
                        >
                          Edit RFQ
                        </Link>
                        <button
                          onClick={() => submitDraft(r)}
                          className="rounded-xl bg-amber-400 px-3 py-1.5 text-sm font-semibold text-black hover:brightness-110"
                        >
                          Submit
                        </button>
                      </>
                    )}

                    {/* Submitted / Under Review */}
                    {r.status === "submitted" && (
                      <span className="rounded-xl border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300">
                        Waiting for review
                      </span>
                    )}
                    {r.status === "under_review" && (
                      <span className="rounded-xl border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300">
                        Under review
                      </span>
                    )}

                    {/* Quoted: show quote link */}
                    {r.status === "quoted" && r.quote?.id && (
                      <Link
                        href={`/quotes/${r.quote.id}`} // create a public quote detail page (or PDF link)
                        className="rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 px-3 py-1.5 text-sm font-semibold text-neutral-900 hover:brightness-110"
                      >
                        View Quote {r.quote.number ? `· ${r.quote.number}` : ""}
                      </Link>
                    )}

                    {/* Staff quick action: build or edit quote */}
                    {user?.isAdmin && (
                      <>
                        <Link
                          href={`/rfqs/${r.id}`}
                          className="rounded-xl border border-zinc-700 px-3 py-1.5 text-xs hover:bg-zinc-800"
                        >
                          Admin RFQ
                        </Link>

                        <Link
                          href={`/admin/quotes/from-rfq/${r.id}`} // you can also wire a page that calls build-quote then redirects to /admin/quotes/[id]
                          className="rounded-xl border border-zinc-700 px-3 py-1.5 text-xs hover:bg-zinc-800"
                        >
                          Build Quote
                        </Link>
                        {r.quote?.id && (
                          <Link
                            href={`/admin/quotes/${r.quote.id}`}
                            className="rounded-xl border border-zinc-700 px-3 py-1.5 text-xs hover:bg-zinc-800"
                          >
                            Edit Quote
                          </Link>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Compact line preview */}
                {r.items?.length > 0 && (
                  <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {r.items.slice(0, 6).map((it) => {
                      const prod =
                        typeof it.product === "object" ? it.product : undefined;
                      return (
                        <div
                          key={it.id}
                          className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2"
                        >
                          <div className="min-w-0">
                            <div className="truncate text-sm">
                              {prod?.name
                                ? prod.name
                                : `#${prod?.id ?? it.product}`}
                            </div>
                            {prod?.slug && (
                              <div className="truncate text-xs text-zinc-400">
                                {prod.slug}
                              </div>
                            )}
                          </div>
                          <div className="text-sm text-zinc-300">
                            × {it.requested_qty}
                          </div>
                        </div>
                      );
                    })}
                    {r.items.length > 6 && (
                      <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-center text-xs text-zinc-400">
                        +{r.items.length - 6} more…
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function StatusBadge({ status }: { status: RFQ["status"] }) {
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
