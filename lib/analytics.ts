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

const GA4_ECOMMERCE_EVENTS: Record<string, string> = {
  product_view: "view_item",
  add_to_cart: "add_to_cart",
  remove_from_cart: "remove_from_cart",
  view_cart: "view_cart",
  begin_checkout: "begin_checkout",
  add_shipping_info: "add_shipping_info",
  add_payment_info: "add_payment_info",
  purchase: "purchase",
};

function trackGoogleEcommerce(payload: TrackEventPayload) {
  const eventName = GA4_ECOMMERCE_EVENTS[payload.event_type];
  if (!eventName) return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gtag = (window as any).gtag;
    if (typeof gtag === "function") {
      gtag("event", eventName, payload.meta?.ga4 ?? {});
    }
  } catch {
    // Analytics must never interrupt shopping.
  }
}

export async function trackEvent(payload: TrackEventPayload) {
  if (typeof window === "undefined") return;

  trackGoogleEcommerce(payload);

  const visitor_id = getVisitorId();
  const session_id = getSessionId();
  touchSession();

  const query = new URLSearchParams(window.location.search);
  const page = `${window.location.pathname}${window.location.search}`;

  // best-effort: never throw in UI
  try {
    await api_backend.post("/offers/track-event/", {
      visitor_id,
      session_id,
      page: payload.page ?? page,
      referrer: document.referrer || "",
      landing_page: page,
      site_domain: window.location.hostname.toLowerCase().replace(/^www\./, ""),
      utm_source: query.get("utm_source") || "",
      utm_medium: query.get("utm_medium") || "",
      utm_campaign: query.get("utm_campaign") || "",
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
