import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || "";

const ALLOWED_ACTIONS: Record<string, string> = {
  "generate-invoice": "POST",
  "mark-paid": "PATCH",
  "generate-tickets": "POST",
  "send-tickets": "POST",
  "cancel": "PATCH",
};

async function handleRequest(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; action: string }> }
) {
  const { id, action } = await params;

  const expectedMethod = ALLOWED_ACTIONS[action];
  if (!expectedMethod) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  if (request.method !== expectedMethod) {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let body: string | undefined;
    try {
      const json = await request.json();
      body = JSON.stringify(json);
    } catch {
      // No body is fine for some actions
    }

    const response = await fetch(`${API_URL}/api/b2b/orders/${id}/${action}`, {
      method: expectedMethod,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ADMIN_API_KEY,
      },
      ...(body ? { body } : {}),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ error: "Server unavailable" }, { status: 503 });
  }
}

export const POST = handleRequest;
export const PATCH = handleRequest;
