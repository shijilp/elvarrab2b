import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
};

const BACKEND =
  process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_BASE;

export async function GET() {
  if (!BACKEND) {
    return NextResponse.json(
      { detail: "Backend URL not configured" },
      { status: 500, headers: NO_CACHE_HEADERS },
    );
  }

  try {
    const response = await fetch(`${BACKEND.replace(/\/+$/, "")}/manager/settings/`, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
    });
    if (!response.ok) {
      return NextResponse.json(
        { detail: "Unable to retrieve current store settings" },
        { status: response.status, headers: NO_CACHE_HEADERS },
      );
    }
    const data = await response.json();
    return NextResponse.json(data, { headers: NO_CACHE_HEADERS });
  } catch {
    return NextResponse.json(
      { detail: "Unable to reach the settings service" },
      { status: 502, headers: NO_CACHE_HEADERS },
    );
  }
}
