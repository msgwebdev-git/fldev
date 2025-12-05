import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { reason } = await request.json();

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { error: "Refund reason is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if user is authenticated (admin)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Call the backend API to process refund
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

    const response = await fetch(`${apiUrl}/api/admin/orders/${id}/refund`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reason,
        adminEmail: user.email,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Failed to process refund" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in refund:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
