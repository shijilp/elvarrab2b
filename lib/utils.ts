import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// Reusable helper (ok to export from a non-page file)
export function extractIdFromPath(path: string): string | undefined {
  const m = /\/account\/orders\/([^\/?#]+)(?:[\/?#]|$)/.exec(path);
  return m?.[1] ? decodeURIComponent(m[1]) : undefined;
}


export function money(n: number, currency = "INR") {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(n ?? 0);
  } catch {
    return `$${Number(n ?? 0).toFixed(2)}`;
  }
}