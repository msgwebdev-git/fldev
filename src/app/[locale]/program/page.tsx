import { createClient } from "@/lib/supabase/server";
import { ProgramContent } from "./ProgramContent";

export default async function ProgramPage() {
  const supabase = await createClient();

  // Получаем все активные события из новой таблицы program
  const { data: events } = await supabase
    .from("program")
    .select("*")
    .eq("is_active", true)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true })
    .order("sort_order", { ascending: true });

  return <ProgramContent events={events || []} />;
}
