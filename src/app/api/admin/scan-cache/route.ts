import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || "";

export async function GET() {
  try {
    const res = await fetch(`${API_URL}/api/scan/cache/status`, {
      headers: { "x-api-key": ADMIN_API_KEY },
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
  try {
    const res = await fetch(`${API_URL}/api/scan/cache/warmup`, {
      method: "POST",
      headers: { "x-api-key": ADMIN_API_KEY },
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
