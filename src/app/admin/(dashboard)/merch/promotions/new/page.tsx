import { createClient } from "@/lib/supabase/server";
import { MerchPromotionEditor } from "@/components/admin/MerchPromotionEditor";

export const dynamic = "force-dynamic";

export default async function NewPromotionPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tickets")
    .select("id, name_ru")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const tickets = (data ?? []).map((t) => ({ id: t.id as string, name: t.name_ru as string }));
  return <MerchPromotionEditor tickets={tickets} />;
}
