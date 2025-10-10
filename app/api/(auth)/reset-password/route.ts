export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const backend = process.env.BACKEND_URL;
  if (!backend) {
    return NextResponse.json({ detail: "Server misconfigured" }, { status: 500 });
  }

  const { email } = await req.json();

  // Forward to Django
  const r = await fetch(`${backend}/auth/request-reset-password/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  // Normalize response
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    const detail =
      data?.detail ||
      data?.error ||
      (typeof data === "string" ? data : "Password reset request failed");
    return NextResponse.json({ detail }, { status: r.status });
  }

  return NextResponse.json({ ok: true });
}
