import { createClient } from "@/lib/supabase/server";
import { LineupContent } from "./LineupContent";

// Fallback данные на случай если база пустая
const fallbackArtists = [
  {
    id: 1,
    name: "Carla's Dreams",
    image_url: "https://picsum.photos/seed/carla/400/400",
    genre: "Pop / Hip-Hop",
    country: "Moldova",
    is_headliner: true,
    day: 1,
    stage: "Main Stage",
    year: "2025",
    sort_order: 0,
  },
  {
    id: 2,
    name: "The Motans",
    image_url: "https://picsum.photos/seed/motans/400/400",
    genre: "Pop / Rock",
    country: "Moldova",
    is_headliner: true,
    day: 2,
    stage: "Main Stage",
    year: "2025",
    sort_order: 0,
  },
  {
    id: 3,
    name: "Irina Rimes",
    image_url: "https://picsum.photos/seed/irina/400/400",
    genre: "Pop",
    country: "Moldova",
    is_headliner: true,
    day: 3,
    stage: "Main Stage",
    year: "2025",
    sort_order: 0,
  },
];

export default async function LineupPage() {
  const supabase = await createClient();

  const { data: artists } = await supabase
    .from("artists")
    .select("*")
    .order("year", { ascending: false })
    .order("is_headliner", { ascending: false })
    .order("day", { ascending: true })
    .order("sort_order", { ascending: true });

  // Используем данные из базы или fallback
  const artistsData = artists && artists.length > 0 ? artists : fallbackArtists;

  // Получаем уникальные года
  const years = [...new Set(artistsData.map((a) => a.year))].sort((a, b) => b.localeCompare(a));

  return <LineupContent artists={artistsData} years={years} />;
}
