// app/api/warehouses/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_API_URL!; // e.g. http://localhost:8000

export async function GET(req: NextRequest) {
  // Build backend URL: {BACKEND}/api/elvarra/warehouses/ + query (?mine=1, etc.)
  const base = BACKEND.endsWith("/") ? BACKEND.slice(0, -1) : BACKEND;
  const upstream = new URL(`${base}/warehouses/`); // note trailing slash for DRF list
  // Forward all search params (mine, search, page, etc.)
  req.nextUrl.searchParams.forEach((v, k) => upstream.searchParams.set(k, v));

  // Pull access token from httpOnly cookie if you use one
  const access = (await cookies()).get("access")?.value;

  const headers = new Headers({
    Accept: "application/json",
  });
  if (access) headers.set("Authorization", `Bearer ${access}`);

  // Don’t auto-follow redirects; though we already used trailing slash
  const r = await fetch(upstream, { method: "GET", headers, redirect: "manual" });

  // Stream back JSON and sanitize hop-by-hop headers
  const respHeaders = new Headers(r.headers);
  respHeaders.delete("content-encoding");
  respHeaders.delete("content-length");
  respHeaders.delete("transfer-encoding");

  return new NextResponse(r.body, { status: r.status, headers: respHeaders });
}
