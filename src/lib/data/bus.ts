import { unstable_cache, revalidateTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";

export interface BusDate {
  id: string;
  travelDate: string; // ISO date (YYYY-MM-DD)
  price: number;
  currency: string;
  capacity: number;
  seatsTaken: number;
  seatsLeft: number;
  departTimeTur?: string;
  departTimeRetur?: string;
}

export const BUS_CACHE_TAG = "bus";
const BUS_REVALIDATE_PROFILE = { expire: 3600 } as const;

interface BusDateRow {
  id: string;
  travel_date: string;
  price: number;
  currency: string | null;
  capacity: number | null;
  seats_taken: number | null;
  depart_time_tur: string | null;
  depart_time_retur: string | null;
}

async function fetchActiveBusDates(): Promise<BusDate[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("bus_dates")
    .select("id, travel_date, price, currency, capacity, seats_taken, depart_time_tur, depart_time_retur")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return ((data as BusDateRow[] | null) ?? []).map((r) => {
    const capacity = r.capacity ?? 0;
    const seatsTaken = r.seats_taken ?? 0;
    return {
      id: r.id,
      travelDate: r.travel_date,
      price: Number(r.price),
      currency: r.currency ?? "MDL",
      capacity,
      seatsTaken,
      seatsLeft: Math.max(0, capacity - seatsTaken),
      departTimeTur: r.depart_time_tur ?? undefined,
      departTimeRetur: r.depart_time_retur ?? undefined,
    };
  });
}

// Cached; short revalidate so the "seats left" counter stays reasonably fresh,
// and busted by admin edits / order flow via revalidateBus().
export const getActiveBusDates = unstable_cache(fetchActiveBusDates, ["active-bus-dates-v1"], {
  revalidate: 120,
  tags: [BUS_CACHE_TAG],
});

export function revalidateBus() {
  revalidateTag(BUS_CACHE_TAG, BUS_REVALIDATE_PROFILE);
}

// -----------------------------------------------------------------------------
// Page visibility toggle (admin) — hides /bus and the navbar link when off.
// Default (missing setting) = VISIBLE; only an explicit "false" hides the page,
// so the feature is never accidentally hidden before the admin opts to hide it.
// -----------------------------------------------------------------------------

async function fetchBusEnabled(): Promise<boolean> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "bus_enabled")
    .maybeSingle();
  return data?.value !== "false";
}

export const getBusEnabled = unstable_cache(fetchBusEnabled, ["bus-enabled-v1"], {
  revalidate: 300,
  tags: [BUS_CACHE_TAG],
});

// -----------------------------------------------------------------------------
// Departure location (admin-editable) — shown on the bus page so passengers know
// where the shuttle leaves Chișinău from. Single location for all trips.
// -----------------------------------------------------------------------------

async function fetchBusDepartureAddress(): Promise<string> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "bus_departure_address")
    .maybeSingle();
  return data?.value ?? "";
}

export const getBusDepartureAddress = unstable_cache(fetchBusDepartureAddress, ["bus-departure-address-v1"], {
  revalidate: 300,
  tags: [BUS_CACHE_TAG],
});
