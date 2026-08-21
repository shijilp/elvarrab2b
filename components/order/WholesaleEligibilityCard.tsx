import type { WholesaleEligibility } from "@/lib/wholesaleRules";

type Props = {
  eligibility: WholesaleEligibility;
  className?: string;
};
function formatMoney(n: number) {
  return Number(n || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
}
export default function WholesaleEligibilityCard({
  eligibility,
  className = "",
}: Props) {
  if (eligibility.isWholesaleEligible) {
    return (
      <div
        className={`rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-4 text-sm text-emerald-100 ${className}`}
      >
        <h3 className="mb-1 font-semibold text-emerald-200">
          Wholesale order eligible
        </h3>

        <p>Your order meets the wholesale value and quantity requirements.</p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-3xl border p-4 ${
        eligibility.isWholesaleEligible
          ? "border-emerald-500/40 bg-emerald-500/10"
          : "border-amber-500/40 bg-amber-500/10"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-white">Wholesale Eligibility</h3>

        <span
          className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest ${
            eligibility.isWholesaleEligible
              ? "bg-emerald-500 text-white"
              : "bg-amber-400 text-slate-950"
          }`}
        >
          {eligibility.isWholesaleEligible ? "Approved" : "Pending"}
        </span>
      </div>

      <div className="mt-4 space-y-3 text-sm">
        <div className="flex justify-between gap-3">
          <span className="text-slate-300">Minimum order value</span>
          <span
            className={
              eligibility.isValueEligible
                ? "text-emerald-300"
                : "text-amber-300"
            }
          >
            {formatMoney(eligibility.wholesaleOrderValue)} /{" "}
            {eligibility.minWholesaleValue}
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full rounded-full ${
              eligibility.isValueEligible ? "bg-emerald-400" : "bg-amber-400"
            }`}
            style={{
              width: `${Math.min(
                100,
                (eligibility.wholesaleOrderValue /
                  eligibility.minWholesaleValue) *
                  100,
              )}%`,
            }}
          />
        </div>

        <div className="flex justify-between gap-3">
          <span className="text-slate-300">Qty / SKU ratio</span>
          <span
            className={
              eligibility.isQtyEligible ? "text-emerald-300" : "text-amber-300"
            }
          >
            {eligibility.qtyPerSku.toFixed(2)} / {eligibility.minQtyPerSku}
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full rounded-full ${
              eligibility.isQtyEligible ? "bg-emerald-400" : "bg-amber-400"
            }`}
            style={{
              width: `${Math.min(100, (eligibility.qtyPerSku / eligibility.minQtyPerSku) * 100)}%`,
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
            <p className="text-[11px] text-slate-400">Total Qty</p>
            <p className="text-lg font-bold text-white">
              {eligibility.totalQty}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
            <p className="text-[11px] text-slate-400">No. of SKU</p>
            <p className="text-lg font-bold text-white">
              {eligibility.totalSku}
            </p>
          </div>
        </div>
      </div>

      {!eligibility.isWholesaleEligible && (
        <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-3 text-xs leading-5 text-slate-300">
          {!eligibility.isValueEligible && (
            <p>
              Add{" "}
              <span className="font-semibold text-amber-300">
                {formatMoney(eligibility.valueRequired)}
              </span>{" "}
              more to reach minimum wholesale value.
            </p>
          )}

          {!eligibility.isQtyEligible && (
            <p className="mt-1">
              Add at least{" "}
              <span className="font-semibold text-amber-300">
                {eligibility.qtyNeededForRatio}
              </span>{" "}
              more unit(s) to meet the Qty/SKU ratio.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
