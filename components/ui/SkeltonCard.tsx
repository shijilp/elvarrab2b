export function SkeletonCard() {
  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-3 shadow-[0_0_0_1px_rgba(30,41,59,0.5)] animate-pulse">
      {/* Image */}
      <div className="aspect-[4/5] w-full rounded-xl bg-gradient-to-br from-slate-800 via-slate-850 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent animate-[shimmer_2s_linear_infinite]" />
      </div>

      {/* SKU */}
      <div className="mt-4 h-2 w-20 rounded-full bg-slate-700" />

      {/* Product title */}
      <div className="mt-3 h-4 w-4/5 rounded bg-slate-600" />

      {/* Trade price */}
      <div className="mt-4 flex items-center gap-2">
        <div className="h-7 w-28 rounded-lg bg-blue-900/60" />
        <div className="h-4 w-14 rounded bg-slate-700" />
      </div>

      {/* MOQ */}
      <div className="mt-4 flex justify-between">
        <div className="h-3 w-16 rounded bg-slate-700" />
        <div className="h-3 w-20 rounded bg-emerald-900/50" />
      </div>
    </div>
  );
}
