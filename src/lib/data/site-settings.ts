import { unstable_cache, revalidateTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";

export const SITE_SETTINGS_CACHE_TAG = "site-settings";
const SITE_SETTINGS_REVALIDATE_PROFILE = { expire: 3600 } as const;

async function fetchSiteSettingBool(key: string): Promise<boolean> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", key)
    .single();
  return data?.value === "true";
}

// Cached per-key with 1h TTL; admin Save invalidates via revalidateSiteSettings().
export const getSiteSettingBool = unstable_cache(
  fetchSiteSettingBool,
  ["site-setting-bool-v1"],
  { revalidate: 3600, tags: [SITE_SETTINGS_CACHE_TAG] }
);

export function revalidateSiteSettings() {
  revalidateTag(SITE_SETTINGS_CACHE_TAG, SITE_SETTINGS_REVALIDATE_PROFILE);
}
