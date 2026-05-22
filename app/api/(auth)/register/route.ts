export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

type RegisterBody = {
  username: string;
  password: string;
  email?: string;
  first_name?: string;
};

type TokenResp = { access: string; refresh?: string };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
function decodeJwtPayload(token: string): Record<string, any> {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
  } catch {
    return {};
  }
}

async function setAuthCookies(access: string, refresh?: string) {
  const payload = decodeJwtPayload(access);
  const now = Math.floor(Date.now() / 1000);
  const accessExp = typeof payload?.exp === "number" ? payload.exp : now + 15 * 60;
  const accessMaxAge = Math.max(accessExp - now, 60);
  const refreshMaxAge = 60 * 60 * 24 * 30; // adjust to match your backend

  const cookieStore = await cookies();
  cookieStore.set("access", access, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: accessMaxAge,
  });
  if (refresh) {
    cookieStore.set("refresh", refresh, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: refreshMaxAge,
    });
  }
}

export async function POST(req: Request) {
  const body = (await req.json()) as RegisterBody;
  const backend = process.env.BACKEND_URL;
  if (!backend) {
    return NextResponse.json({ detail: "Server misconfigured" }, { status: 500 });
  }

  // 1) Register user on Django
  const reg = await fetch(`${backend}/auth/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const regJson = await reg.json().catch(() => ({}));
  if (!reg.ok) {
    return NextResponse.json(
      { detail: regJson?.detail ?? regJson?.error ?? "Registration failed" },
      { status: reg.status }
    );
  }

  // 2) If backend already returned tokens, use them; else auto-login
  let access: string | undefined = regJson?.access;
  let refresh: string | undefined = regJson?.refresh;

  if (!access) {
    // Auto-login with same credentials
    const tok = await fetch(`${backend}/api/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: body.username, password: body.password }),
    });

    if (!tok.ok) {
      // Registration succeeded but login failed — return 200 without cookies
      // (Client can navigate to login page)
      return NextResponse.json(
        { user: { username: body.username, email: body.email ?? null, role: "user", isAdmin: false, first_name: body.first_name ?? null } },
        { status: 200 }
      );
    }

    const tjson = (await tok.json()) as TokenResp;
    access = tjson.access;
    refresh = tjson.refresh;
  }

  // 3) Set httpOnly cookies
  await setAuthCookies(access!, refresh);

  // 4) Build safe user object (hybrid: token → minimal, then merge /me if available)
  const payload = decodeJwtPayload(access!);
  let user = {
    username: regJson?.username ?? payload?.username ?? body.username ?? null,
    isAdmin: !!(payload?.is_staff ?? regJson?.is_staff ?? false),
    email: regJson?.email ?? payload?.email ?? body.email ?? null,
    role: regJson?.role ?? "user",
    first_name: regJson?.first_name ?? payload?.first_name ?? body.first_name ?? null,
  };

  try {
    const prof = await fetch(`${backend}/api/users/me/`, {
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
    // ignore profile fetch errors
  }

  return NextResponse.json({ user }, { status: 200 });
}
