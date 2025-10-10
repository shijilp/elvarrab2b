export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const backend = process.env.BACKEND_URL;
  if (!backend) {
    return NextResponse.json({ detail: "Server misconfigured" }, { status: 500 });
  }

  const { uid, token, new_password } = await req.json();

  // forward to Django
  const r = await fetch(`${backend}/auth/reset-password/confirm/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid, token, new_password }),
  });

  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    // normalize common error shapes
    const detail =
      data?.detail ||
      data?.error ||
      (typeof data === "string" ? data : "Password reset failed");
    return NextResponse.json({ detail }, { status: r.status });
  }

  return NextResponse.json({ ok: true });
}
