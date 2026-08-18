/**
 * Lightweight, provider-agnostic event tracking for the 10-minute match widget.
 * Events are pushed to window.dataLayer (GA4/GTM picks them up automatically
 * once a measurement ID is configured) and mirrored to gtag when available.
 */

export type WidgetEvent =
  | "widget_start"
  | "widget_city_selected"
  | "widget_current_app_selected"
  | "widget_needs_captured"
  | "widget_trips_captured"
  | "widget_estimate_shown"
  | "widget_cta_clicked"
  | "widget_cart_confirmed"
  | "widget_restarted";

type Props = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const SESSION_KEY = "zepto_match_session";
const VISITOR_KEY = "zepto_match_returning";
const LOG_KEY = "zepto_match_events";
const LOG_LIMIT = 2000;

export type TrackedEvent = {
  event: WidgetEvent;
  visitor_type: "first_time" | "returning";
  session_id: string;
  ts: string;
  city?: string | null;
} & Props;

function id() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

/** Stable per-tab id so every step of one journey can be stitched together. */
function sessionId() {
  if (typeof window === "undefined") return "ssr";
  let value = window.sessionStorage.getItem(SESSION_KEY);
  if (!value) {
    value = id();
    window.sessionStorage.setItem(SESSION_KEY, value);
  }
  return value;
}

/** First-time vs returning visitor — the core segmentation for add-to-cart lift. */
export function isFirstTimeVisitor() {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(VISITOR_KEY) !== "1";
}

export function markVisited() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(VISITOR_KEY, "1");
}

export function track(event: WidgetEvent, props: Props = {}) {
  if (typeof window === "undefined") return;

  const payload = {
    event,
    ...props,
    visitor_type: isFirstTimeVisitor() ? "first_time" : "returning",
    session_id: sessionId(),
    widget: "zepto_10_min_match",
    ts: new Date().toISOString(),
  };

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
  window.gtag?.("event", event, payload);
  appendToLog(payload as TrackedEvent);

  if (import.meta.env.DEV) {
    console.info("[analytics]", event, payload);
  }
}

/** Local event log so the in-app dashboard can compute funnel rates. */
function appendToLog(payload: TrackedEvent) {
  try {
    const log = readEvents();
    log.push(payload);
    window.localStorage.setItem(LOG_KEY, JSON.stringify(log.slice(-LOG_LIMIT)));
  } catch {
    // storage full or unavailable — analytics must never break the widget
  }
}

export function readEvents(): TrackedEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOG_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as TrackedEvent[]) : [];
  } catch {
    return [];
  }
}

export function clearEvents() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(LOG_KEY);
}