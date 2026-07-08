import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// First-party analytics sink. Receives navigator.sendBeacon() / fetch payloads
// from src/lib/analytics.ts and stores anonymized events in Supabase.
// Must never throw back to the client — tracking can't break the site.

export const runtime = "nodejs";

function deviceFromUA(ua: string): string {
  if (/iPad|Tablet|PlayBook/i.test(ua)) return "tablet";
  if (/Mobi|Android|iPhone|iPod|Windows Phone/i.test(ua)) return "mobile";
  return "desktop";
}

// Known crawlers/headless agents — their "visits" only pollute the dashboard.
// Not a security boundary (UA is spoofable), just data hygiene.
const BOT_UA =
  /bot|crawler|spider|crawling|headless|phantom|puppeteer|playwright|selenium|lighthouse|pagespeed|pingdom|uptime|monitor|scrapy|python-requests|curl|wget|go-http|axios|facebookexternalhit|whatsapp|telegrambot|slackbot|discordbot|twitterbot|linkedinbot|embedly|preview/i;

// Only event types our tracker actually emits — direct POSTs with arbitrary
// types are dropped instead of stored.
const ALLOWED_EVENTS = new Set([
  "page_view",
  "view_content",
  "add_to_cart",
  "initiate_checkout",
  "purchase",
  "lineup_artist_click",
]);

// Best-effort in-memory rate limit per IP (sliding minute window).
// Serverless caveat: state is per-instance, so the real ceiling is
// limit × concurrent instances — still stops naive floods and runaway loops.
const RATE_LIMIT = 120; // events/min/IP — generous for a human clicking around
const rateWindow = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateWindow.get(ip);
  if (!entry || now >= entry.resetAt) {
    // Opportunistic cleanup keeps the map from growing unbounded
    if (rateWindow.size > 10_000) rateWindow.clear();
    rateWindow.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT;
}

const str = (v: unknown, max = 512): string | null =>
  typeof v === "string" && v.length > 0 ? v.slice(0, max) : null;

export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    if (!b || typeof b.event_type !== "string") {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const ua = req.headers.get("user-agent") || "";

    // Silently accept-and-drop bot traffic and junk — the sender must never
    // see a difference (tracking can't break or fingerprint the page).
    const eventType = b.event_type.slice(0, 64);
    if (!ALLOWED_EVENTS.has(eventType) || !ua || BOT_UA.test(ua)) {
      return NextResponse.json({ ok: true });
    }
    const ip =
      req.headers.get("x-real-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    if (rateLimited(ip)) {
      return NextResponse.json({ ok: true });
    }
    // Vercel injects geo headers at the edge.
    const country =
      req.headers.get("x-vercel-ip-country") ||
      req.headers.get("cf-ipcountry") ||
      null;

    const row = {
      event_type: eventType,
      session_id: str(b.session_id, 64),
      visitor_id: str(b.visitor_id, 64),
      path: str(b.path, 1024),
      referrer: str(b.referrer, 1024),
      utm_source: str(b.utm_source, 128),
      utm_medium: str(b.utm_medium, 128),
      utm_campaign: str(b.utm_campaign, 128),
      utm_content: str(b.utm_content, 128),
      utm_term: str(b.utm_term, 128),
      ticket_id: str(b.ticket_id, 64),
      ticket_name: str(b.ticket_name, 256),
      quantity: typeof b.quantity === "number" ? Math.trunc(b.quantity) : null,
      value: typeof b.value === "number" && isFinite(b.value) ? b.value : null,
      order_number: str(b.order_number, 64),
      locale: str(b.locale, 16),
      device: deviceFromUA(ua),
      country,
      metadata:
        b.metadata && typeof b.metadata === "object" ? b.metadata : {},
    };

    const supabase = createAdminClient();
    await supabase.from("analytics_events").insert(row);

    return NextResponse.json({ ok: true });
  } catch {
    // Swallow errors: never surface tracking failures to the page.
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
