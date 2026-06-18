import { getSessionId, getVisitorId, touchSession } from "./visitors";
import { api_backend } from "./api_backend";

type TrackEventPayload = {
  event_type: string;
  page?: string;
  product_id?: number;
  product_slug?: string;
  category?: string;
  duration_ms?: number;
  scroll_pct?: number;
  landing_page?: string;
  referrer?: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
  meta?: Record<string, any>;
};

export async function trackEvent(payload: TrackEventPayload) {
  if (typeof window === "undefined") return;

  const visitor_id = getVisitorId();
  const session_id = getSessionId();
  touchSession();

  // best-effort: never throw in UI
  try {
    await api_backend.post("/offers/track-event/", {
      visitor_id,
      session_id,
      page: payload.page ?? window.location.pathname,
      referrer: document.referrer || "",
      landing_page: window.location.pathname,
      ...payload,
    });
  } catch {
    // swallow
  }
}

export async function decideOffer(page?: string) {
  if (typeof window === "undefined") return { show_popup: false as const };

  const visitor_id = getVisitorId();
  const session_id = getSessionId();

  try {
    const res = await api_backend.post("/offers/decide-offer/", {
      visitor_id,
      session_id,
      page: page ?? window.location.pathname,
    });
    return res.data as
      | { show_popup: false }
      | { show_popup: true; code: string; message: string };
  } catch {
    return { show_popup: false as const };
  }
}
