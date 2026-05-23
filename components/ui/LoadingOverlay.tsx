import ElvarraSpinner from "../ElvarraSpinner";

export function LoadingOverlay({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <div className="absolute inset-0 z-10 grid place-items-center rounded-2xl bg-[#06111f]/70 backdrop-blur-md">
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-slate-950 via-[#071827] to-slate-950 px-5 py-4 shadow-[0_20px_70px_-35px_rgba(34,211,238,.8)]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent" />

        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl border border-cyan-500/30 bg-cyan-500/10">
            <ElvarraSpinner />
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-300">
              B2B Portal
            </div>
            <div className="text-sm font-semibold text-white">
              Loading trade data...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
