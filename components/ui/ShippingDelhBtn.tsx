"use client";
import { useState } from "react";
import { bulkCreateDelhivery, labelUrl } from "@/lib/shipping";

export default function BulkDelhiveryButton({
  selectedIds,
}: {
  selectedIds: number[];
}) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<null | {
    created: number;
    failed: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    results: any[];
  }>(null);

  const run = async () => {
    if (!selectedIds.length) return;
    setLoading(true);
    try {
      const res = await bulkCreateDelhivery(selectedIds);
      setSummary(res);
      // Open labels for the successes (optional)
      res.results
        .filter((r) => r.status === "ok" && r.waybill)
        .slice(0, 10) // avoid popping too many tabs; adjust as needed
        .forEach((r) => window.open(labelUrl(r.waybill!), "_blank"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={run}
        disabled={!selectedIds.length || loading}
        className="rounded-xl px-4 py-2 bg-black text-white disabled:opacity-50"
      >
        {loading ? "Processing…" : `Create ${selectedIds.length} Shipments`}
      </button>

      {summary && (
        <span className="text-sm text-neutral-500">
          Done: {summary.created} ✓ · Failed: {summary.failed}
        </span>
      )}
    </div>
  );
}
