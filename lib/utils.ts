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
