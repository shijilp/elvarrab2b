// app/admin/orders/BulkActions.tsx
"use client";
import { useState } from "react";
import { api } from "@/lib/api";

export default function BulkActions({
  selectedIds,
}: {
  selectedIds: number[];
}) {
  const [busy, setBusy] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any>(null);

  async function createShipments() {
    setBusy(true);
    try {
      const res = await api.post("/shipments/bulk-create/", {
        ids: selectedIds,
        package: {
          weight: 0.5,
          length: 18,
          breadth: 12,
          height: 6,
          pickup_location: "WH-1",
          seller_name: "Elvarra",
          seller_add: "Warehouse, City, State",
          seller_gst: "XXABCDE1234Z1Z1",
        },
      });
      setResult(res.data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setResult({ error: e?.response?.data || e?.message });
    } finally {
      setBusy(false);
    }
  }

  async function markShipped() {
    setBusy(true);
    try {
      const res = await api.post("/shipments/bulk-mark-shipped/", {
        ids: selectedIds,
      });
      setResult({ marked_shipped: res.data.updated });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setResult({ error: e?.response?.data || e?.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <button
          disabled={!selectedIds.length || busy}
          className="px-4 py-2 rounded-xl bg-black text-white disabled:opacity-50"
          onClick={createShipments}
        >
          Create Shipments ({selectedIds.length})
        </button>
        <button
          disabled={!selectedIds.length || busy}
          className="px-4 py-2 rounded-xl border"
          onClick={markShipped}
        >
          Mark Shipped
        </button>
      </div>

      {result && (
        <div className="text-sm rounded-xl border p-3">
          {"created" in result && (
            <>
              <div>
                <b>Created:</b> {result.created?.length ?? 0}
              </div>
              <div>
                <b>Failed:</b> {result.failed?.length ?? 0}
              </div>
              <div>
                <b>Skipped:</b> {result.skipped?.length ?? 0}
              </div>
            </>
          )}
          {"marked_shipped" in result && (
            <div>
              <b>Marked shipped:</b> {result.marked_shipped}
            </div>
          )}
          {"error" in result && (
            <div className="text-red-600">{String(result.error)}</div>
          )}
        </div>
      )}
    </div>
  );
}
