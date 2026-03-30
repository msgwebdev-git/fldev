import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Build update object from provided fields
    const update: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.email !== undefined) {
      if (!body.email || !body.email.includes("@")) {
        return NextResponse.json({ error: "Invalid email" }, { status: 400 });
      }
      update.customer_email = body.email;
    }

    if (body.name !== undefined) {
      if (!body.name || body.name.trim().length === 0) {
        return NextResponse.json({ error: "Name is required" }, { status: 400 });
      }
      update.customer_name = body.name.trim();
    }

    if (body.phone !== undefined) {
      update.customer_phone = body.phone.trim();
    }

    if (body.language !== undefined) {
      if (!["ro", "ru"].includes(body.language)) {
        return NextResponse.json({ error: "Language must be ro or ru" }, { status: 400 });
      }
      update.language = body.language;
    }

    if (body.orderType !== undefined) {
      const type = body.orderType;
      if (!["online", "manual", "offline", "giveaway", "invitation"].includes(type)) {
        return NextResponse.json({ error: "Invalid order type" }, { status: 400 });
      }
      update.source = type;
      update.is_invitation = type === "invitation";
    }

    const { data, error } = await supabase
      .from("orders")
      .update(update)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating order:", error);
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error in update-order:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
