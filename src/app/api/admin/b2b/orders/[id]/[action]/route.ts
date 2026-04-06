import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { API_URL, getAdminApiKey } from "@/lib/env";

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

  const { isAdmin } = await requireAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let body: string | undefined;
    if (request.method !== "GET") {
      try {
        const json = await request.json();
        body = JSON.stringify(json);
      } catch {
        // No body is fine for some actions
      }
    }

    const response = await fetch(`${API_URL}/api/b2b/orders/${id}/${action}`, {
      method: expectedMethod,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": getAdminApiKey(),
      },
      ...(body ? { body } : {}),
    });

    // Binary responses (PDF downloads) — stream through
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/pdf") || contentType.includes("application/zip")) {
      const blob = await response.blob();
      return new NextResponse(blob, {
        status: response.status,
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": response.headers.get("content-disposition") || "attachment",
          "Cache-Control": "private, max-age=3600",
        },
      });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ error: "Server unavailable" }, { status: 503 });
  }
}

export const GET = handleRequest;
export const POST = handleRequest;
export const PATCH = handleRequest;
