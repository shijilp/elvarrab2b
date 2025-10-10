import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function POST() {
  const cookieStore = await cookies();
  const refresh = cookieStore.get("refresh_token")?.value;
  if (!refresh)
    return NextResponse.json({ detail: "No refresh token" }, { status: 401 });

  const backend = process.env.BACKEND_URL;
  if (!backend)
    return NextResponse.json({ detail: "Server misconfigured" }, { status: 500 });

  // Call Django refresh endpoint
  const r = await fetch(`${backend}/api/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!r.ok) return NextResponse.json({ detail: "Refresh failed" }, { status: 401 });

  const data = await r.json();

  // Save new access token in cookie
  const now = Math.floor(Date.now() / 1000);
  const base64 = data.access.split(".")[1];
  const exp = JSON.parse(Buffer.from(base64, "base64").toString("utf8"))?.exp;
  const maxAge = exp ? exp - now : 15 * 60;

  cookieStore.set("access_token", data.access, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge,
  });

  return NextResponse.json({ ok: true });
}
