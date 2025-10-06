import { OrderStatus } from "@/types";

function statusPillClass(status: OrderStatus) {
  switch (status) {
    case "new":
      return "bg-amber-500/15 text-amber-500 ring-1 ring-amber-500/30";
    case "confirmed":
      return "bg-indigo-500/15 text-indigo-400 ring-1 ring-indigo-500/30";
    case "shipped":
      return "bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-500/30";
    case "delivered":
      return "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30";
    case "cancelled":
      return "bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/30";
    default:
      return "text-zinc-300";
  }
}

export function StatusPill({ status }: { status: OrderStatus }) {
  const label = status[0].toUpperCase() + status.slice(1);
  return (
    <span
      className={`rounded-full border border-zinc-800 bg-zinc-900/70 px-2 py-0.5 text-xs ${statusPillClass(
        status
      )}`}
    >
      {label}
    </span>
  );
}
