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

const str = (v: unknown, max = 512): string | null =>
  typeof v === "string" && v.length > 0 ? v.slice(0, max) : null;

export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    if (!b || typeof b.event_type !== "string") {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const ua = req.headers.get("user-agent") || "";
    // Vercel injects geo headers at the edge.
    const country =
      req.headers.get("x-vercel-ip-country") ||
      req.headers.get("cf-ipcountry") ||
      null;

    const row = {
      event_type: b.event_type.slice(0, 64),
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
