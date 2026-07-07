import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/auth/require-admin";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

// Upload a single product image to the `merch` Storage bucket, return public URL.
export async function POST(request: NextRequest) {
  try {
    const { isAdmin } = await requireAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const productId = (formData.get("productId") as string) || "new";

    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File too large (max 8MB)" }, { status: 400 });
    }

    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : file.type === "image/avif" ? "avif" : "jpg";
    const path = `products/${productId}/${randomUUID()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const supabase = createAdminClient(supabaseUrl, supabaseServiceKey);
    const { error: uploadError } = await supabase.storage
      .from("merch")
      .upload(path, buffer, { contentType: file.type, upsert: true });

    if (uploadError) {
      console.error("Merch image upload error:", uploadError);
      return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
    }

    const { data } = supabase.storage.from("merch").getPublicUrl(path);
    return NextResponse.json({ success: true, url: data.publicUrl, path });
  } catch (error) {
    console.error("Merch upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
