import { createClient } from "@/lib/supabase/server";
import { ArtistsTable } from "./ArtistsTable";
import { AddArtistButton } from "./AddArtistButton";

export default async function LineupPage() {
  const supabase = await createClient();

  const { data: artists } = await supabase
    .from("artists")
    .select("*")
    .order("year", { ascending: false })
    .order("is_headliner", { ascending: false })
    .order("day", { ascending: true })
    .order("sort_order", { ascending: true });

  // Получаем уникальные года
  const years = [...new Set(artists?.map((a) => a.year) || [])];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lineup</h1>
          <p className="text-gray-500 mt-1">Управление артистами фестиваля</p>
        </div>
        <AddArtistButton years={years} />
      </div>

      <ArtistsTable artists={artists ?? []} years={years} />
    </div>
  );
}
