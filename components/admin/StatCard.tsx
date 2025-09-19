function StatCard({
  title,
  value,
  sub,
}: {
  title: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white/90 p-5 dark:border-neutral-800 dark:bg-neutral-900/70">
      <div className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        {title}
      </div>
      <div className="mt-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
        {value}
      </div>
      {sub ? (
        <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          {sub}
        </div>
      ) : null}
    </div>
  );
}
