import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { API_URL, getAdminApiKey } from "@/lib/env";

export async function GET() {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch(`${API_URL}/api/scan/cache/status`, {
      headers: { "x-api-key": getAdminApiKey() },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Server error" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Server unavailable" }, { status: 503 });
  }
}

export async function POST() {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch(`${API_URL}/api/scan/cache/warmup`, {
      method: "POST",
      headers: { "x-api-key": getAdminApiKey() },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Server error" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Server unavailable" }, { status: 503 });
  }
}
