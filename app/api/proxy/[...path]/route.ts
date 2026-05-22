export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_URL!;

// Next 15 route context: params is a Promise
type Ctx = { params: Promise<{ path: string[] }> };

async function handle(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params; // ✅ await the promised params


  const cookieStore = await cookies();
  const access = cookieStore.get("access")?.value;
const joined = path.join("/");
const qs = req.nextUrl.search ?? "";
const needsSlash = joined.length > 0 && !joined.endsWith("/");
const targetUrl = `${BACKEND}/${joined}${needsSlash ? "/" : ""}${qs}`;

 // const targetUrl = `${BACKEND}/${path.join("/")}${req.nextUrl.search}${req.method==="GET" ? "":"/"}`;

  const headers = new Headers(req.headers);
  headers.set("host", new URL(BACKEND).host);
  headers.set("origin", new URL(BACKEND).origin);
  if (access) headers.set("Authorization", `Bearer ${access}`);
  headers.delete("cookie"); // never forward browser cookies

  const body =
    req.method === "GET" || req.method === "HEAD"
      ? undefined
      : await req.arrayBuffer();

  const r = await fetch(targetUrl, {
    method: req.method,
    headers,
    body,
     cache: "no-store",
  });
const outHeaders = new Headers(r.headers);
// Force clients/CDNs to NOT cache API responses
outHeaders.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
outHeaders.set("Pragma", "no-cache");
outHeaders.set("Expires", "0");
// Optional: remove validators that can encourage caching behavior
outHeaders.delete("etag");

  return new NextResponse(r.body, {
    status: r.status,
    headers: outHeaders,
  });
}

export async function GET(req: NextRequest, ctx: Ctx) {
  return handle(req, ctx);
}
export async function POST(req: NextRequest, ctx: Ctx) {
  return handle(req, ctx);
}
export async function PUT(req: NextRequest, ctx: Ctx) {
  return handle(req, ctx);
}
export async function PATCH(req: NextRequest, ctx: Ctx) {
  return handle(req, ctx);
}
export async function DELETE(req: NextRequest, ctx: Ctx) {
  return handle(req, ctx);
}
