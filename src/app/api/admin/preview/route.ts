import { NextRequest, NextResponse } from "next/server";
import { draftMode } from "next/headers";
import { requireAdmin } from "@/lib/auth/require-admin";

/**
 * Admin preview of pages hidden from the public (/bus, /shop while their
 * visibility toggle is off).
 *
 * Uses Next.js Draft Mode: the admin gets an httpOnly bypass cookie, so ISR
 * caching for regular visitors is untouched — only the cookie holder gets
 * per-request dynamic rendering where the visibility guard lets them through.
 *
 *   GET /api/admin/preview?path=/ro/bus   → enable + redirect
 *   GET /api/admin/preview?off=1&path=/ro → disable + redirect
 */
export async function GET(req: NextRequest) {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const path = req.nextUrl.searchParams.get("path") || "/";
  // Internal redirects only — no absolute URLs / protocol-relative tricks
  const safePath = path.startsWith("/") && !path.startsWith("//") ? path : "/";

  const draft = await draftMode();
  if (req.nextUrl.searchParams.get("off")) {
    draft.disable();
  } else {
    draft.enable();
  }

  return NextResponse.redirect(new URL(safePath, req.url));
}
