import { createClient } from "@/lib/supabase/server";
import { TicketsTable } from "./TicketsTable";
import { AddTicketButton } from "./AddTicketButton";

export default async function TicketsAdminPage() {
  const supabase = await createClient();

  const { data: tickets } = await supabase
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
      is_active,
      sort_order,
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
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Билеты</h1>
          <p className="text-gray-500 mt-1">Управление билетами фестиваля</p>
        </div>
        <AddTicketButton />
      </div>

      <TicketsTable tickets={tickets ?? []} />
    </div>
  );
}
