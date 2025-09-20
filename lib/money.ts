// lib/money.ts
export function money(nLike: string | number | null | undefined, currency = "INR") {
  const n = typeof nLike === "string" ? Number(nLike) : Number(nLike ?? 0);
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(isFinite(n) ? n : 0);
  } catch {
    return `${currency} ${isFinite(n) ? n.toFixed(2) : "0.00"}`;
  }
}

export function isTruthyNumber(n: unknown): n is number {
  return typeof n === "number" && !Number.isNaN(n);
}
