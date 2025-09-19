export function LoadingHint({ text = "Loading…" }: { text?: string }) {
  return (
    <div className="p-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
      {text}
    </div>
  );
}
