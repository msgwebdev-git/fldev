import { createClient } from "@/lib/supabase/server";
import { ActivitiesTable } from "./ActivitiesTable";
import { AddActivityButton } from "./AddActivityButton";

export default async function ActivitiesAdminPage() {
  const supabase = await createClient();

  const { data: activities } = await supabase
    .from("activities")
    .select("*")
    .order("year", { ascending: false })
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true });

  // Получаем уникальные года
  const years = [...new Set(activities?.map((a) => a.year) || [])];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Активности</h1>
          <p className="text-gray-500 mt-1">Управление активностями фестиваля</p>
        </div>
        <AddActivityButton years={years} />
      </div>

      <ActivitiesTable activities={activities ?? []} years={years} />
    </div>
  );
}
