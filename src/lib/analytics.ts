// Unified client-side tracking layer.
//
// Each funnel event is sent to three destinations at once:
//   - Facebook/Meta Pixel  (window.fbq)        — standard events
//   - Google Analytics 4   (window.gtag)        — recommended ecommerce events
//   - GTM dataLayer        (window.dataLayer)   — GA4 ecommerce schema
//
// All calls no-op safely on the server or before the respective tag has loaded,
// so tracking can never break a page. Base tags are loaded in MarketingScripts.tsx.

const CURRENCY = "MDL";

export interface AnalyticsItem {
  id: string;
  name: string;
  price: number;
  quantity?: number;
}

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: Record<string, unknown>[];
  }
}

// --- first-party sink (our own Supabase via /api/track) ---------------------
// Cookieless, anonymized. Runs alongside the third-party tags above so the
// admin dashboard has traffic/funnel data that survives ad blockers.

const SID_KEY = "fl_sid"; // per-session (sessionStorage)
const VID_KEY = "fl_vid"; // persistent visitor (localStorage)
const UTM_KEY = "fl_utm"; // first-touch UTM for the session

function anonIds(): { session_id: string | null; visitor_id: string | null } {
  if (typeof window === "undefined") return { session_id: null, visitor_id: null };
  try {
    let session_id = sessionStorage.getItem(SID_KEY);
    if (!session_id) {
      session_id = crypto.randomUUID();
      sessionStorage.setItem(SID_KEY, session_id);
    }
    let visitor_id = localStorage.getItem(VID_KEY);
    if (!visitor_id) {
      visitor_id = crypto.randomUUID();
      localStorage.setItem(VID_KEY, visitor_id);
    }
    return { session_id, visitor_id };
  } catch {
    return { session_id: null, visitor_id: null };
  }
}

// Capture UTM once (first touch) and reuse for the whole session so later
// events (add_to_cart, purchase) stay attributed to the campaign that landed.
function firstTouchUtm(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const stored = sessionStorage.getItem(UTM_KEY);
    if (stored) return JSON.parse(stored);
    const params = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};
    for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
      const v = params.get(key);
      if (v) utm[key] = v;
    }
    if (Object.keys(utm).length > 0) sessionStorage.setItem(UTM_KEY, JSON.stringify(utm));
    return utm;
  } catch {
    return {};
  }
}

function flTrack(eventType: string, payload: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  try {
    const body = JSON.stringify({
      event_type: eventType,
      ...anonIds(),
      path: window.location.pathname,
      referrer: document.referrer || null,
      locale: document.documentElement.lang || null,
      ...firstTouchUtm(),
      ...payload,
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
    } else {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      });
    }
  } catch {
    // tracking must never break the page
  }
}

/** Record a page view in our first-party analytics. */
export function trackPageView() {
  flTrack("page_view");
}

/** Record an arbitrary custom event (e.g. lineup artist clicks). */
export function trackEvent(eventType: string, payload?: Record<string, unknown>) {
  flTrack(eventType, payload);
}

// --- low-level senders ------------------------------------------------------

function fbTrack(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  window.fbq("track", event, params);
}

function gaEvent(name: string, params: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}

// GA4 ecommerce schema for GTM: clear the previous ecommerce object first,
// then push the new event so values don't bleed between pushes.
function dlPush(event: string, ecommerce: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push({ event, ecommerce: { currency: CURRENCY, ...ecommerce } });
}

// --- mappers ----------------------------------------------------------------

const qty = (item: AnalyticsItem) => item.quantity ?? 1;

function gaItems(items: AnalyticsItem[]) {
  return items.map((item) => ({
    item_id: item.id,
    item_name: item.name,
    price: item.price,
    quantity: qty(item),
  }));
}

function fbContents(items: AnalyticsItem[]) {
  return items.map((item) => ({ id: item.id, quantity: qty(item) }));
}

const sumValue = (items: AnalyticsItem[]) =>
  items.reduce((sum, item) => sum + item.price * qty(item), 0);

// --- public funnel events ---------------------------------------------------

export function trackViewContent(items: AnalyticsItem[]) {
  if (items.length === 0) return;
  const ids = items.map((item) => item.id);
  // Entry price = cheapest listed item, used as the FB value for a list view.
  const value = Math.min(...items.map((item) => item.price));

  fbTrack("ViewContent", {
    content_ids: ids,
    content_type: "product",
    value,
    currency: CURRENCY,
  });
  gaEvent("view_item_list", { items: gaItems(items) });
  dlPush("view_item_list", { items: gaItems(items) });
  flTrack("view_content", { value, metadata: { ids } });
}

export function trackAddToCart(item: AnalyticsItem) {
  const value = item.price * qty(item);

  fbTrack("AddToCart", {
    content_ids: [item.id],
    content_name: item.name,
    content_type: "product",
    contents: fbContents([item]),
    value,
    currency: CURRENCY,
  });
  gaEvent("add_to_cart", { value, currency: CURRENCY, items: gaItems([item]) });
  dlPush("add_to_cart", { value, items: gaItems([item]) });
  flTrack("add_to_cart", {
    ticket_id: item.id,
    ticket_name: item.name,
    quantity: qty(item),
    value,
  });
}

export function trackInitiateCheckout(items: AnalyticsItem[]) {
  if (items.length === 0) return;
  const value = sumValue(items);
  const numItems = items.reduce((sum, item) => sum + qty(item), 0);

  fbTrack("InitiateCheckout", {
    content_ids: items.map((item) => item.id),
    content_type: "product",
    contents: fbContents(items),
    num_items: numItems,
    value,
    currency: CURRENCY,
  });
  gaEvent("begin_checkout", { value, currency: CURRENCY, items: gaItems(items) });
  dlPush("begin_checkout", { value, items: gaItems(items) });
  flTrack("initiate_checkout", {
    value,
    quantity: numItems,
    metadata: { ids: items.map((item) => item.id) },
  });
}

export function trackPurchase(params: {
  orderNumber: string;
  value: number;
  items?: AnalyticsItem[];
}) {
  const items = params.items ?? [];

  fbTrack("Purchase", {
    content_ids: items.map((item) => item.id),
    content_type: "product",
    contents: fbContents(items),
    value: params.value,
    currency: CURRENCY,
    order_id: params.orderNumber,
  });
  gaEvent("purchase", {
    transaction_id: params.orderNumber,
    value: params.value,
    currency: CURRENCY,
    items: gaItems(items),
  });
  dlPush("purchase", {
    transaction_id: params.orderNumber,
    value: params.value,
    items: gaItems(items),
  });
  flTrack("purchase", {
    order_number: params.orderNumber,
    value: params.value,
    metadata: { ids: items.map((item) => item.id) },
  });
}
