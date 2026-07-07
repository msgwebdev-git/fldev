import { createClient } from "@/lib/supabase/server";
import { StoriesManager, type AdminStory } from "./StoriesManager";

export const dynamic = "force-dynamic";

export default async function StoriesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("homepage_stories")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Сторис на главной</h1>
        <p className="text-gray-500 mt-1">Видео-кружки перед блоком билетов</p>
      </div>
      <StoriesManager stories={(data ?? []) as AdminStory[]} />
    </div>
  );
}
