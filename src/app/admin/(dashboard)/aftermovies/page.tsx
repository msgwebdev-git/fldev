import { createClient } from "@/lib/supabase/server";
import { AftermoviesTable } from "./AftermoviesTable";
import { AddAftermovieButton } from "./AddAftermovieButton";

export default async function AftermoviesPage() {
  const supabase = await createClient();

  const { data: aftermovies } = await supabase
    .from("aftermovies")
    .select("*")
    .order("year", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Aftermovie</h1>
          <p className="text-gray-500 mt-1">Управление видео с фестивалей</p>
        </div>
        <AddAftermovieButton />
      </div>

      <AftermoviesTable aftermovies={aftermovies ?? []} />
    </div>
  );
}
