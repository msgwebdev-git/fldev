import { createClient } from "@/lib/supabase/server";
import { PartnersContent } from "./PartnersContent";

export default async function PartnersPage() {
  const supabase = await createClient();

  // Получаем всех партнеров без фильтрации по годам
  const { data: partners } = await supabase
    .from("partners")
    .select("*")
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true });

  return <PartnersContent partners={partners || []} />;
}
