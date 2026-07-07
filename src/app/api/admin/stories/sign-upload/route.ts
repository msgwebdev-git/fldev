import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/auth/require-admin";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET = "stories"; // dedicated public bucket for story videos + covers

const SAFE_EXT = /^[a-z0-9]{1,5}$/i;

// Returns a short-lived signed URL so the browser uploads the file directly to
// Supabase Storage (bypasses the serverless request-body size limit).
export async function POST(request: NextRequest) {
  try {
    const { isAdmin } = await requireAdmin();
    if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { ext } = (await request.json()) as { ext?: string };
    const cleanExt = ext && SAFE_EXT.test(ext) ? ext.toLowerCase() : "bin";
    const path = `${randomUUID()}.${cleanExt}`;

    const supabase = createAdminClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path);
    if (error || !data) {
      return NextResponse.json({ error: error?.message || "Failed to sign upload" }, { status: 500 });
    }

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);

    return NextResponse.json({
      bucket: BUCKET,
      path: data.path,
      token: data.token,
      publicUrl: pub.publicUrl,
    });
  } catch (error) {
    console.error("stories sign-upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
