import { unstable_cache, revalidateTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import type { TicketData, TicketOption } from "@/components/TicketCard";

export const TICKETS_CACHE_TAG = "tickets";
const TICKETS_REVALIDATE_PROFILE = { expire: 3600 } as const;

async function fetchActiveTickets(): Promise<TicketData[]> {
  const supabase = createPublicClient();

  const { data: ticketsData } = await supabase
    .from("tickets")
    .select(`
      id,
      name,
      name_ro,
      name_ru,
      description_ro,
      description_ru,
      features_ro,
      features_ru,
      price,
      original_price,
      currency,
      max_per_order,
      has_options,
      ticket_options (
        id,
        name,
        name_ro,
        name_ru,
        description_ro,
        description_ru,
        price_modifier,
        is_default,
        sort_order
      )
    `)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return (ticketsData ?? []).map((t) => ({
    id: t.id,
    name: t.name,
    nameRo: t.name_ro,
    nameRu: t.name_ru,
    descriptionRo: t.description_ro ?? undefined,
    descriptionRu: t.description_ru ?? undefined,
    featuresRo: t.features_ro ?? [],
    featuresRu: t.features_ru ?? [],
    price: Number(t.price),
    originalPrice: t.original_price ? Number(t.original_price) : undefined,
    currency: t.currency ?? "MDL",
    maxPerOrder: t.max_per_order ?? 50,
    hasOptions: t.has_options ?? false,
    options: (t.ticket_options ?? [])
      .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
      .map((o: {
        id: string;
        name: string;
        name_ro: string;
        name_ru: string;
        description_ro: string | null;
        description_ru: string | null;
        price_modifier: number | null;
        is_default: boolean;
      }): TicketOption => ({
        id: o.id,
        name: o.name,
        nameRo: o.name_ro,
        nameRu: o.name_ru,
        descriptionRo: o.description_ro ?? undefined,
        descriptionRu: o.description_ru ?? undefined,
        priceModifier: o.price_modifier ? Number(o.price_modifier) : 0,
        isDefault: o.is_default,
      })),
  }));
}

// Cached across the whole deployment, invalidated by admin mutations via
// revalidateActiveTickets(). 1h TTL is a safety net in case a revalidate call
// is missed; tickets change infrequently.
export const getActiveTickets = unstable_cache(
  fetchActiveTickets,
  ["active-tickets-v1"],
  { revalidate: 3600, tags: [TICKETS_CACHE_TAG] }
);

export function revalidateActiveTickets() {
  revalidateTag(TICKETS_CACHE_TAG, TICKETS_REVALIDATE_PROFILE);
}
