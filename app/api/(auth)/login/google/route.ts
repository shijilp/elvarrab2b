export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

type GoogleBody = { id_token?: string };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
function decodeJwtPayload(token: string): Record<string, any> {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
  } catch {
    return {};
  }
}

export async function POST(req: Request) {
  const { id_token } = (await req.json()) as GoogleBody;
  if (!id_token) {
    return NextResponse.json({ detail: "Missing id_token" }, { status: 400 });
  }

  const backend = process.env.BACKEND_URL;
  if (!backend) {
    return NextResponse.json({ detail: "Server misconfigured" }, { status: 500 });
  }

  // 1) Exchange Google id_token at Django
  const r = await fetch(`${backend}/auth/google/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_token }),
  });

  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    return NextResponse.json(
      { detail: data?.detail ?? "Google auth failed" },
      { status: 401 }
    );
  }

  // Expect backend to return { access, refresh, user? }
  const access: string = data.access;
  const refresh: string | undefined = data.refresh;

  // 2) Store tokens as httpOnly cookies
  const payload = decodeJwtPayload(access);
  const now = Math.floor(Date.now() / 1000);
  const accessExp = typeof payload?.exp === "number" ? payload.exp : now + 15 * 60;
  const accessMaxAge = Math.max(accessExp - now, 60);
  const refreshMaxAge = 60 * 60 * 24 * 30; // adjust to backend policy

  const cookieStore = await cookies();
  cookieStore.set("access", access, {
    httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: accessMaxAge,
  });
  if (refresh) {
    cookieStore.set("refresh", refresh, {
      httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: refreshMaxAge,
    });
  }

  // 3) Hybrid user object: token → minimal, then merge /me if available
  let user = {
    username: data?.user?.username ?? payload?.username ?? null,
    isAdmin: !!(payload?.is_staff ?? data?.user?.is_staff),
    email: data?.user?.email ?? payload?.email ?? null,
    role: data?.user?.role ?? "user",
    first_name: data?.user?.first_name ?? payload?.first_name ?? null,
  };

  try {
    const prof = await fetch(`${backend}/auth/users/me/`, {
      headers: { Authorization: `Bearer ${access}` },
    });
    if (prof.ok) {
      const p = await prof.json();
      user = {
        username: p.username ?? user.username,
        isAdmin: Boolean(p.is_staff ?? user.isAdmin),
        email: p.email ?? user.email,
        role: p.role ?? user.role,
        first_name: p.first_name ?? user.first_name,
      };
    }
  } catch {
    // ignore; keep token-derived/user-returned fields
  }

  // 4) Return only safe user info
  return NextResponse.json({ user }, { status: 200 });
}
