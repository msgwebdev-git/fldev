import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || "";

// POST /api/admin/notifications — send push notification
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const response = await fetch(`${API_URL}/api/admin/notifications/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ADMIN_API_KEY,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30_000),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Send notification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/admin/notifications — get stats and history
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await fetch(`${API_URL}/api/admin/notifications/stats`, {
      headers: {
        "x-api-key": ADMIN_API_KEY,
      },
      signal: AbortSignal.timeout(15_000),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Get notification stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
