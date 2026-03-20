import { createClient } from "@/lib/supabase/server";
import { ProgramContent } from "./ProgramContent";
import { generatePageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  return generatePageMetadata({ params, page: "program" });
}

export default async function ProgramPage() {
  const supabase = await createClient();

  // Получаем все события из таблицы program_events
  const { data: events } = await supabase
    .from("program_events")
    .select("*")
    .order("day", { ascending: true })
    .order("sort_order", { ascending: true });

  return <ProgramContent events={events || []} />;
}
