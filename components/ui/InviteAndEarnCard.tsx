import { api } from "@/lib/api";
import { useEffect, useState } from "react";

type LinkKind = "REF" | "AFF";
export type ReferralLink = {
  id: number;
  code: string;
  kind: LinkKind; // "REF" | "AFF"
  percent: string; // kept as string to avoid float drift from API
  flat_amount: string;
  cookie_ttl_days: number;
  active: boolean;
  clicks: number;
  conversions: number;
  earnings: string; // stringified decimal
  created_at: string;
};

async function apiListReferralLinks(): Promise<ReferralLink[]> {
  try {
    const r = await api.get("/referrals/mine/", {
      withCredentials: true,
      headers: { Accept: "application/json" },
    });
    const data = r?.data;
    if (Array.isArray(data)) return data as ReferralLink[];
    // some backends wrap results {results:[...]}
    if (data?.results && Array.isArray(data.results))
      return data.results as ReferralLink[];
  } catch (e) {}
  return [];
}

// ---------------------------------
// Referral/Affiliate API
// ---------------------------------

async function apiCreateReferralLink(body: {
  kind: LinkKind;
  percent?: number;
  flat_amount?: number;
}) {
  // Prefer your axios api helper (handles JWT/session + baseURL)
  try {
    const r = await api.post("/referrals/create/", body, {
      withCredentials: true,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        // If you're using Django SessionAuth, ensure CSRF header is sent
        // (your axios instance may already do this). Leaving it here as a fallback.
        ...(typeof document !== "undefined" &&
        document.cookie.includes("csrftoken=")
          ? {
              "X-CSRFToken": document.cookie
                .split(";")
                .map((s) => s.trim())
                .find((s) => s.startsWith("csrftoken="))!
                .split("=")[1],
            }
          : {}),
      },
    });
    return r.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    // When backend returns HTML (e.g., CSRF fail or login page), show readable error
    const msg =
      err?.response?.data?.detail || err?.message || "Unable to create link";
    throw new Error(msg);
  }
}

export function InviteAndEarnCard() {
  const [links, setLinks] = useState<ReferralLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await apiListReferralLinks();
        setLinks(data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        setErr(e?.message || "Unable to load referral links");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";

  async function create(kind: LinkKind) {
    setErr(null);
    setCreating(true);
    try {
      const body =
        kind === "REF"
          ? { kind: "REF" as const, flat_amount: 50 }
          : { kind: "AFF" as const, percent: 10 };
      const created = await apiCreateReferralLink(body); // {id, code}
      // Try to refresh from server first
      let next = await apiListReferralLinks();
      // If API returns empty due to auth/caching, fall back to optimistic insert
      if (!next?.length && created?.code) {
        const optimistic: ReferralLink = {
          id: created.id ?? Date.now(),
          code: created.code,
          kind: kind,
          percent: kind === "AFF" ? String(body.percent ?? 0) : "0",
          flat_amount: kind === "REF" ? String(body.flat_amount ?? 0) : "0",
          cookie_ttl_days: 30,
          active: true,
          clicks: 0,
          conversions: 0,
          earnings: "0",
          created_at: new Date().toISOString(),
        };
        next = [optimistic];
      }
      setLinks(next);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setErr(e?.message || "Unable to create link");
    } finally {
      setCreating(false);
    }
  }
}
