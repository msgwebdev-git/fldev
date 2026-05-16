"use server";

import { revalidateSiteSettings } from "@/lib/data/site-settings";

export async function revalidateSiteSettingsCache() {
  revalidateSiteSettings();
}
