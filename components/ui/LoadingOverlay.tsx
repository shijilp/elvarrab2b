import { Spinner } from "../admin/Spinner";
import ElvarraSpinner from "../ElvarraSpinner";

export function LoadingOverlay({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="absolute inset-0 z-10 grid place-items-center bg-black/40 backdrop-blur-sm rounded-lg">
      <div className="flex items-center gap-3 rounded-xl bg-neutral-900 px-4 py-2 text-neutral-100 ring-1 ring-neutral-800">
        <ElvarraSpinner />
        {/* <span className="text-sm opacity-90">{label}</span> */}
      </div>
    </div>
  );
}
