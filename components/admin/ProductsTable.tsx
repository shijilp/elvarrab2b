import { money } from "@/lib/utils";
import { Product } from "@/types";
import Link from "next/link";
import { LoadingOverlay } from "../ui/LoadingOverlay";

export function ProductsTable({
  rows,
  show,
}: {
  rows: Product[];
  show: boolean;
}) {
  return (
    <div className="relative rounded-2xl border border-neutral-200 bg-white/90 p-3 dark:border-neutral-800 dark:bg-neutral-900/70">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-neutral-500">
            <tr className="border-b border-neutral-200 dark:border-neutral-800">
              <th className="px-2 py-2">Product</th>
              <th className="px-2 py-2">SKU</th>
              <th className="px-2 py-2">Price</th>
              <th className="px-2 py-2">Inventory</th>
              <th className="px-2 py-2">Status</th>
              <th className="px-2 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr
                key={p.id}
                className="border-b border-neutral-100 last:border-none dark:border-neutral-800"
              >
                <td className="px-2 py-2 font-medium">{p.name}</td>
                <td className="px-2 py-2">{p.sku || "—"}</td>
                <td className="px-2 py-2">{money(p.price)}</td>
                <td className="px-2 py-2">{p.inventory ?? "—"}</td>
                <td className="px-2 py-2">
                  <span
                    className={clsx(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ring-1",
                      p.is_active
                        ? "text-emerald-500 ring-emerald-500/30 bg-emerald-500/10"
                        : "text-neutral-400 ring-neutral-400/30 bg-neutral-400/10"
                    )}
                  >
                    {p.is_active ? "Active" : "Disabled"}
                  </span>
                </td>
                <td className="px-2 py-2 text-right">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="rounded-lg px-2 py-1 text-xs ring-1 ring-neutral-200 dark:ring-neutral-800"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/product/${p.slug || p.id}`}
                      className="rounded-lg px-2 py-1 text-xs ring-1 ring-neutral-200 dark:ring-neutral-800"
                    >
                      View
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-2 py-6 text-center text-sm opacity-70"
                >
                  No products found.
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
