import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { API_URL, getAdminApiKey } from "@/lib/env";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const res = await fetch(`${API_URL}/api/admin/orders/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": getAdminApiKey(),
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(55_000),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    const message = err instanceof Error && err.name === 'TimeoutError'
      ? "Сервер не успел обработать запрос."
      : "Server unavailable";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
