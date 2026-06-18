import { v4 as uuidv4 } from "uuid";

const VISITOR_KEY = "elvarra_visitor_id";
const SESSION_KEY = "elvarra_session_id";
const SESSION_TS_KEY = "elvarra_session_started_at";

/**
 * Session rotates after 30 mins of inactivity (matches backend window).
 */
const SESSION_TTL_MS = 30 * 60 * 1000;

export function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = uuidv4();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

export function getSessionId(): string {
  if (typeof window === "undefined") return "";

  const now = Date.now();
  const lastStarted = Number(localStorage.getItem(SESSION_TS_KEY) || "0");
  let sessionId = localStorage.getItem(SESSION_KEY);

  // rotate session after ttl
  if (!sessionId || !lastStarted || now - lastStarted > SESSION_TTL_MS) {
    sessionId = uuidv4();
    localStorage.setItem(SESSION_KEY, sessionId);
    localStorage.setItem(SESSION_TS_KEY, String(now));
  }
  return sessionId;
}

export function touchSession() {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_TS_KEY, String(Date.now()));
}
