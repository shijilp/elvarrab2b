import { money } from "@/lib/utils";
import { AssignedUser, Order } from "@/types";
import Link from "next/link";
import { LoadingOverlay } from "../ui/LoadingOverlay";
import { useState } from "react";
import { StatusPill } from "../ui/StatusPill";

// ---------- Tables ----------
export function OrdersTable({
  rows,
  onSelect,
  selected,
  onBulk,
  onBulkAssign,
  onPrint,
  show,
  admins,
}: {
  rows: Order[];
  onSelect: (id: number, checked: boolean) => void;
  onBulkAssign: (userId: number) => void;
  selected: Set<number>;
  onBulk: (
    action: "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
  ) => void;
  onPrint: () => void;
  show: boolean;
  admins: AssignedUser[];
}) {
  const allChecked = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const someChecked = selected.size > 0 && !allChecked;
  const [assignUserId, setAssignUserId] = useState<number | "">("");

  return (
    <div className="relative rounded-2xl border border-neutral-200 bg-white/90 p-3 dark:border-neutral-800 dark:bg-neutral-900/70">
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
            className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs text-white hover:brightness-110 disabled:opacity-30"
            disabled={selected.size === 0}
          >
            Mark Confirmed
          </button>
          <button
            onClick={() => onBulk("processing")}
            className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs text-white hover:brightness-110 disabled:opacity-30"
            disabled={selected.size === 0}
          >
            Mark Processing
          </button>
          <button
            onClick={() => onBulk("shipped")}
            className="rounded-xl bg-cyan-600 px-3 py-1.5 text-xs text-white hover:brightness-110 disabled:opacity-30"
            disabled={selected.size === 0}
          >
            Mark Shipped
          </button>
          <button
            onClick={() => onBulk("delivered")}
            className="rounded-xl bg-cyan-900 px-3 py-1.5 text-xs text-white hover:brightness-110 disabled:opacity-30"
            disabled={selected.size === 0}
          >
            Mark Delivered
          </button>

          {/* NEW: Bulk assign UI */}
          <div className="flex items-center gap-2">
            <select
              value={assignUserId}
              onChange={(e) => setAssignUserId(Number(e.target.value))}
              className="rounded-xl border px-3 py-1.5 bg-neutral-900 text-xs text-white outline-none dark:border-neutral-800 "
            >
              <option value="">Assign to…</option>
              {admins &&
                admins.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.first_name || u.email || `User ${u.id}`}
                  </option>
                ))}
            </select>
            <button
              onClick={() => {
                if (assignUserId !== "") onBulkAssign(assignUserId as number);
              }}
              className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs text-white hover:brightness-110 disabled:opacity-30 "
              disabled={selected.size === 0 || assignUserId === ""}
            >
              Assign
            </button>
          </div>
          <button
            onClick={onPrint}
            className="rounded-xl bg-neutral-900 px-3 py-1.5 text-xs text-white hover:brightness-110 dark:bg-amber-500 dark:text-neutral-900 disabled:opacity-30"
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
              <th className="px-2 py-2">Assigned</th>
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
                    <StatusPill status={o.status} />
                  </td>
                  <td className="px-2 py-2">
                    {money(o.total_amount, o.country || "INR")}
                  </td>
                  <td className="px-2 py-2 opacity-80">
                    {new Date(o.created_at).toLocaleString()}
                  </td>
                  <td className="px-2 py-2 opacity-80">
                    {o.assigned_to?.first_name || ""}
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
      <LoadingOverlay show={show} />
    </div>
  );
}

function clsx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}
