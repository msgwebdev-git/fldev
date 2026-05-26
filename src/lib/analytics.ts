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
}
