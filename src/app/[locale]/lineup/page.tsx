import { createClient } from "@/lib/supabase/server";
import { LineupContent } from "./LineupContent";
import { generatePageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  return generatePageMetadata({ params, page: "lineup" });
}

export default async function LineupPage() {
  const supabase = await createClient();

  const { data: artists } = await supabase
    .from("artists")
    .select("*")
    .order("year", { ascending: false })
    .order("is_headliner", { ascending: false })
    .order("day", { ascending: true })
    .order("sort_order", { ascending: true });

  const artistsData = artists ?? [];
  const years = [...new Set(artistsData.map((a) => a.year))].sort((a, b) => b.localeCompare(a));

  return <LineupContent artists={artistsData} years={years} />;
}
