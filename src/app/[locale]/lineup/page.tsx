import { Suspense } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { LineupContent } from "./LineupContent";
import { generatePageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export const revalidate = 600;

export async function generateMetadata({ params }: Props) {
  return generatePageMetadata({ params, page: "lineup" });
}

export default async function LineupPage() {
  const supabase = createPublicClient();

  const { data: artists } = await supabase
    .from("artists_base")
    .select("*")
    .order("year", { ascending: false })
    .order("is_headliner", { ascending: false })
    .order("day", { ascending: true })
    .order("sort_order", { ascending: true });

  const artistsData = artists ?? [];
  const years = [...new Set(artistsData.map((a) => a.year))].sort((a, b) => b.localeCompare(a));

  // LineupContent reads useSearchParams() (?year=…), which forces a client
  // bail-out during prerender — it must sit behind a Suspense boundary or the
  // static export fails. See nextjs.org/docs/messages/missing-suspense-with-csr-bailout
  return (
    <Suspense fallback={null}>
      <LineupContent artists={artistsData} years={years} />
    </Suspense>
  );
}
