export function SkeletonCard() {
  return (
    <div className="rounded-2xl p-2 ring-1 ring-neutral-200 dark:ring-neutral-800 el-cardn animate-pulse-slow">
      <div className="aspect-[4/5] w-full rounded-xl bg-neutral-200/60 dark:bg-neutral-800" />
      <div className="mt-3 h-3 w-3/4 rounded bg-neutral-200/60 dark:bg-neutral-800" />
      <div className="mt-2 h-3 w-1/3 rounded bg-neutral-200/60 dark:bg-neutral-800" />
    </div>
  );
}
