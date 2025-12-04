import { createClient } from "@/lib/supabase/server";
import { ProgramEventsTable } from "./ProgramEventsTable";
import { AddEventButton } from "./AddEventButton";

export default async function ProgramAdminPage() {
  const supabase = await createClient();

  const { data: events } = await supabase
    .from("program_events")
    .select("*")
    .order("year", { ascending: false })
    .order("day", { ascending: true })
    .order("sort_order", { ascending: true });

  // Получаем уникальные года
  const years = [...new Set(events?.map((e) => e.year) || [])];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Программа</h1>
          <p className="text-gray-500 mt-1">Управление программой фестиваля</p>
        </div>
        <AddEventButton years={years} />
      </div>

      <ProgramEventsTable events={events ?? []} years={years} />
    </div>
  );
}
