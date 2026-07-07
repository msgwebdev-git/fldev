"use server";

import { revalidatePath } from "next/cache";

// Bust the ISR cache of the public partners page (all locales) after an admin
// add / edit / delete. Without this, changes only appear on prod after the
// 1-hour revalidate window.
export async function revalidatePartners() {
  revalidatePath("/[locale]/partners", "page");
}
