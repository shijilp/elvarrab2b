import { money } from "@/lib/utils";
import { Order } from "@/types";
import Link from "next/link";

// ---------- Tables ----------
export function OrdersTable({
  rows,
  onSelect,
  selected,
  onBulk,
  onPrint,
}: {
  rows: Order[];
  onSelect: (id: number, checked: boolean) => void;
  selected: Set<number>;
  onBulk: (
    action: "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
  ) => void;
  onPrint: () => void;
}) {
  const allChecked = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const someChecked = selected.size > 0 && !allChecked;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white/90 p-3 dark:border-neutral-800 dark:bg-neutral-900/70">
      <div className="mb-2 flex items-center gap-2">
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={allChecked}
            ref={(el) => {
              if (el) el.indeterminate = someChecked;
            }}
            onChange={(e) =>
              rows.forEach((r) => onSelect(r.id, e.target.checked))
            }
          />
          <span>Select all</span>
        </label>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => onBulk("confirmed")}
            className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs text-white hover:brightness-110"
            disabled={selected.size === 0}
          >
            Mark Confirmed
          </button>
          <button
            onClick={() => onBulk("processing")}
            className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs text-white hover:brightness-110"
            disabled={selected.size === 0}
          >
            Mark Processing
          </button>
          <button
            onClick={() => onBulk("shipped")}
            className="rounded-xl bg-cyan-600 px-3 py-1.5 text-xs text-white hover:brightness-110"
            disabled={selected.size === 0}
          >
            Mark Shipped
          </button>
          <button
            onClick={() => onBulk("delivered")}
            className="rounded-xl bg-cyan-900 px-3 py-1.5 text-xs text-white hover:brightness-110"
            disabled={selected.size === 0}
          >
            Mark Delivered
          </button>
          <button
            onClick={onPrint}
            className="rounded-xl bg-neutral-900 px-3 py-1.5 text-xs text-white hover:brightness-110 dark:bg-amber-500 dark:text-neutral-900"
            disabled={selected.size === 0}
          >
            Print Packing Lists
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-neutral-500">
            <tr className="border-b border-neutral-200 dark:border-neutral-800">
              <th className="px-2 py-2"></th>
              <th className="px-2 py-2">Order</th>
              <th className="px-2 py-2">Customer</th>
              <th className="px-2 py-2">Status</th>
              <th className="px-2 py-2">Total</th>
              <th className="px-2 py-2">Date</th>
              <th className="px-2 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows &&
              rows.map((o) => (
                <tr
                  key={o.id}
                  className="border-b border-neutral-100 last:border-none dark:border-neutral-800"
                >
                  <td className="px-2 py-2">
                    <input
                      type="checkbox"
                      checked={selected.has(o.id)}
                      onChange={(e) => onSelect(o.id, e.target.checked)}
                    />
                  </td>
                  <td className="px-2 py-2 font-medium">
                    {o.id || `#${o.id}`}
                  </td>
                  <td className="px-2 py-2">{o.full_name || o.email || "-"}</td>
                  <td className="px-2 py-2">
                    <span
                      className={clsx(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs",
                        statusChipColors[o.status]
                      )}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="px-2 py-2">
                    {money(o.total_amount, o.country || "USD")}
                  </td>
                  <td className="px-2 py-2 opacity-80">
                    {new Date(o.created_at).toLocaleString()}
                  </td>
                  <td className="px-2 py-2 text-right">
                    <Link
                      href={`/orders/${o.id}`}
                      className="rounded-lg px-2 py-1 text-xs ring-1 ring-neutral-200 dark:ring-neutral-800"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-2 py-6 text-center text-sm opacity-70"
                >
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function clsx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

const statusChipColors: Record<Order["status"], string> = {
  new: "bg-amber-500/15 text-amber-500 ring-1 ring-amber-500/30",
  processing: "bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/30",
  confirmed: "bg-indigo-500/15 text-indigo-400 ring-1 ring-indigo-500/30",
  shipped: "bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-500/30",
  delivered: "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30",
  cancelled: "bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/30",
};
