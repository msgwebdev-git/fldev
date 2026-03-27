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
      // Change order type: online, manual, offline, giveaway, invitation
      const type = body.orderType;
      if (type === "giveaway" || type === "invitation") {
        update.is_invitation = true;
      } else {
        update.is_invitation = false;
      }

      // Update order_number prefix to match type
      const currentOrder = await supabase.from("orders").select("order_number, created_at").eq("id", id).single();
      if (currentOrder.data) {
        const oldNum = currentOrder.data.order_number;
        const datePart = oldNum.replace(/^(FL|INV|MAN|OFF|GW|WP)-?/, "");
        const prefixMap: Record<string, string> = {
          online: "FL",
          manual: "MAN",
          offline: "OFF",
          giveaway: "GW",
          invitation: "INV",
        };
        const newPrefix = prefixMap[type] || "FL";
        // Keep the unique part, just change prefix
        const uniquePart = oldNum.includes("-") ? oldNum.split("-").slice(1).join("-") : datePart;
        update.order_number = `${newPrefix}-${uniquePart}`;
      }
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
