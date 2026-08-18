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

  if (import.meta.env.DEV) {
    console.info("[analytics]", event, payload);
  }
}