"use server";

import { revalidateActiveTickets } from "@/lib/data/tickets";

export async function revalidateTicketsCache() {
  revalidateActiveTickets();
}
