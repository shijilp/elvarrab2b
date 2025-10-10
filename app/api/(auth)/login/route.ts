export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

type TokenResp = {
  access: string;
  refresh?: string;
  // django may also include some user fields in token response, but we won't rely on it
};

type UserOut = {
  username: string | null;
  isAdmin: boolean;
  email?: string | null;
  role?: string | null;
  first_name?: string | null;
};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
function decodeJwtPayload(token: string): Record<string, any> {
  try {
    const payload = token.split(".")[1];
    const json = Buffer.from(payload, "base64").toString("utf8");
    return JSON.parse(json);
  } catch {
    return {};
  }
}

export async function POST(req: Request) {
  const { username, password } = await req.json();
  if (!username || !password) {
    return NextResponse.json({ detail: "Missing credentials" }, { status: 400 });
  }

  const backend = process.env.BACKEND_URL;
  if (!backend) {
    return NextResponse.json({ detail: "Server misconfigured" }, { status: 500 });
  }

  // 1) Exchange credentials for tokens at Django
  const r = await fetch(`${backend}/api/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    return NextResponse.json(
      { detail: err?.detail ?? "Invalid credentials" },
      { status: 401 }
    );
  }

  const data = (await r.json()) as TokenResp;

  // 2) Decode minimal info from access token (no verification, just parsing)
  const payload = decodeJwtPayload(data.access);
  const now = Math.floor(Date.now() / 1000);
  const accessExp = typeof payload?.exp === "number" ? payload.exp : now + 15 * 60;
  const accessMaxAge = Math.max(accessExp - now, 60); // fallback min 60s
  const refreshMaxAge = 60 * 60 * 24 * 30; // adjust to your backend

  // 3) Set tokens in httpOnly cookies (hidden from JS)
  const cookieStore = await cookies();
  cookieStore.set("access_token", data.access, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: accessMaxAge,
  });
  if (data.refresh) {
    cookieStore.set("refresh_token", data.refresh, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: refreshMaxAge,
    });
  }

  // 4) Start with minimal user object from token
  let user: UserOut = {
    username: payload.username ?? payload.user?.username ?? username ?? null,
    isAdmin: !!(payload.is_staff ?? payload.isAdmin ?? false),
    email: payload.email ?? null,
    role: null,
    first_name: payload.first_name ?? null,
  };

  // 5) (Hybrid) Try to fetch full profile from Django and merge
  try {
    const prof = await fetch(`${backend}/auth/users/me/`, {
      headers: { Authorization: `Bearer ${data.access}` },
      // Node fetch only; no browser cookies involved
    });

    if (prof.ok) {
      const pjson = await prof.json();
      user = {
        username: pjson.username ?? user.username,
        isAdmin: Boolean(pjson.is_staff ?? pjson.isAdmin ?? user.isAdmin),
        email: pjson.email ?? user.email ?? null,
        role: pjson.role ?? user.role ?? "user",
        first_name: pjson.first_name ?? user.first_name ?? null,
      };
    }
    // If /me fails, we just keep token-derived fields
  } catch {
    // ignore profile errors; token-derived info is used
  }

  // 6) Return ONLY safe, non-sensitive user info
  return NextResponse.json({ user });
}
