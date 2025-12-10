import { createClient } from "@/lib/supabase/server";
import { ProgramEventsTable } from "./ProgramEventsTable";
import { AddEventButton } from "./AddEventButton";

export default async function ProgramAdminPage() {
  const supabase = await createClient();

  const { data: events } = await supabase
    .from("program_events")
    .select("*")
    .order("day", { ascending: true })
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Программа</h1>
          <p className="text-gray-500 mt-1">Управление программой фестиваля</p>
        </div>
        <AddEventButton />
      </div>

      <ProgramEventsTable events={events ?? []} />
    </div>
  );
}
