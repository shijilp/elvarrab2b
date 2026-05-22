// app/api/dashboard/inventory/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_API_URL! ?? ""; // e.g. http://localhost:8000
const base = BACKEND.endsWith("/") ? BACKEND.slice(0, -1) : BACKEND;

function u(path: string) {
  // always ensure trailing slash for DRF list/detail endpoints
    if (!path || typeof path !== "string") {
    throw new Error("Invalid path passed to u()");
  }
  const hasSlash = path.endsWith("/");
  return new URL(`${base}${path}${hasSlash ? "" : "/"}`);
}

async function jsonFetch(url: URL, access?: string) {
  const headers = new Headers({ Accept: "application/json" });
  if (access) headers.set("Authorization", `Bearer ${access}`);
  const r = await fetch(url, { headers, redirect: "manual" });
  if (!r.ok) {
    const text = await r.text().catch(() => "");
    throw new Error(`${r.status} ${r.statusText}: ${text || url.pathname}`);
  }
  return r.json();
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const days = sp.get("days") ?? "30";
  const warehouse = sp.get("warehouse") ?? "";
  const minDays = sp.get("min_days") ?? "60";
  const threshold = sp.get("threshold") ?? "1";

  const access = (await cookies()).get("access")?.value;

  // Build upstream URLs and attach query params
  const totalsUrl = u("/stock-balances/totals");
  if (warehouse) totalsUrl.searchParams.set("warehouse", warehouse);

  const velocityUrl = u("/inventory/reports/velocity");
  velocityUrl.searchParams.set("days", days);
  if (warehouse) velocityUrl.searchParams.set("warehouse", warehouse);

  const agingUrl = u("/inventory/reports/aging");
  agingUrl.searchParams.set("min_days", minDays);
  if (warehouse) agingUrl.searchParams.set("warehouse", warehouse);

  const lowUrl = u("/stock-balances/low_stock");
  lowUrl.searchParams.set("threshold", threshold);
  if (warehouse) lowUrl.searchParams.set("warehouse", warehouse);

  try {
    const [totals, velocity, aging, low_stock] = await Promise.all([
      jsonFetch(totalsUrl, access),
      jsonFetch(velocityUrl, access),
      jsonFetch(agingUrl, access),
      jsonFetch(lowUrl, access),
    ]);

    return NextResponse.json({ totals, velocity, aging, low_stock });
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    return NextResponse.json(
      { detail: e?.message || "Failed to load dashboard data." },
      { status: 502 }
    );
  }
}
