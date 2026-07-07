import { unstable_cache, revalidateTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import type { StoryData } from "@/lib/stories-utils";

export type { StoryData } from "@/lib/stories-utils";

export const STORIES_CACHE_TAG = "stories";
const STORIES_REVALIDATE_PROFILE = { expire: 3600 } as const;

interface StoryRow {
  id: string;
  title_ro: string;
  title_ru: string;
  video_url: string | null;
  cover_url: string | null;
  cta_label_ro: string | null;
  cta_label_ru: string | null;
  cta_href: string | null;
}

async function fetchActiveStories(): Promise<StoryData[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("homepage_stories")
    .select("id, title_ro, title_ru, video_url, cover_url, cta_label_ro, cta_label_ru, cta_href")
    .eq("is_active", true)
    .not("video_url", "is", null)
    .order("sort_order", { ascending: true });

  return ((data as StoryRow[] | null) ?? [])
    .filter((r) => !!r.video_url)
    .map((r) => ({
      id: r.id,
      titleRo: r.title_ro,
      titleRu: r.title_ru,
      videoUrl: r.video_url as string,
      coverUrl: r.cover_url ?? undefined,
      ctaLabelRo: r.cta_label_ro ?? undefined,
      ctaLabelRu: r.cta_label_ru ?? undefined,
      ctaHref: r.cta_href ?? undefined,
    }));
}

export const getActiveStories = unstable_cache(fetchActiveStories, ["active-stories-v2"], {
  revalidate: 3600,
  tags: [STORIES_CACHE_TAG],
});

export function revalidateStories() {
  revalidateTag(STORIES_CACHE_TAG, STORIES_REVALIDATE_PROFILE);
}
