import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { API_URL, getAdminApiKey } from "@/lib/env";

export const maxDuration = 60; // Vercel serverless function timeout (seconds)

export async function POST(request: NextRequest) {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const res = await fetch(`${API_URL}/api/admin/invitations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": getAdminApiKey(),
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(55_000), // 55s — leave 5s margin before Vercel kills
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    const message = err instanceof Error && err.name === 'TimeoutError'
      ? "Сервер не успел обработать запрос. Билеты могли создаться — проверьте список."
      : "Server unavailable";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
