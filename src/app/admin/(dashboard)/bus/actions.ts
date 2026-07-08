"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/require-admin";
import { revalidateBus } from "@/lib/data/bus";

export interface BusDateInput {
  id?: string;
  travelDate: string; // YYYY-MM-DD
  price: number;
  capacity: number;
  departTimeTur?: string | null;
  departTimeRetur?: string | null;
  isActive: boolean;
  sortOrder: number;
}

type ActionResult = { ok: true; id: string } | { ok: false; error: string };

export async function saveBusDate(input: BusDateInput): Promise<ActionResult> {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) return { ok: false, error: "Unauthorized" };
  if (!input.travelDate) return { ok: false, error: "Укажите дату" };
  if (input.price <= 0) return { ok: false, error: "Укажите цену" };
  if (input.capacity < 0) return { ok: false, error: "Некорректная вместимость" };

  const supabase = createAdminClient();
  const row = {
    travel_date: input.travelDate,
    price: input.price,
    capacity: input.capacity,
    depart_time_tur: input.departTimeTur?.trim() || null,
    depart_time_retur: input.departTimeRetur?.trim() || null,
    is_active: input.isActive,
    sort_order: input.sortOrder,
  };

  let id = input.id;
  if (id) {
    const { error } = await supabase.from("bus_dates").update(row).eq("id", id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { data, error } = await supabase.from("bus_dates").insert(row).select("id").single();
    if (error || !data) return { ok: false, error: error?.message || "Insert failed" };
    id = data.id;
  }

  revalidateBus();
  return { ok: true, id: id! };
}

export async function toggleBusDate(id: string, isActive: boolean): Promise<ActionResult> {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) return { ok: false, error: "Unauthorized" };
  const supabase = createAdminClient();
  const { error } = await supabase.from("bus_dates").update({ is_active: isActive }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateBus();
  return { ok: true, id };
}

export async function setBusEnabled(enabled: boolean): Promise<ActionResult> {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) return { ok: false, error: "Unauthorized" };
  const supabase = createAdminClient();
  const { error } = await supabase.from("site_settings").upsert(
    {
      key: "bus_enabled",
      value: enabled ? "true" : "false",
      description: "Показывать страницу автобуса на сайте",
      category: "bus",
    },
    { onConflict: "key" }
  );
  if (error) return { ok: false, error: error.message };
  revalidateBus();
  return { ok: true, id: "bus_enabled" };
}

export async function deleteBusDate(id: string): Promise<ActionResult> {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) return { ok: false, error: "Unauthorized" };
  const supabase = createAdminClient();
  const { error } = await supabase.from("bus_dates").delete().eq("id", id);
  if (error) {
    return { ok: false, error: "Дата уже используется в заказах — отключите её вместо удаления." };
  }
  revalidateBus();
  return { ok: true, id };
}
