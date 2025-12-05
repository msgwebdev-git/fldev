import { createClient } from "@/lib/supabase/server";
import { PromoCodesTable } from "./PromoCodesTable";
import { AddPromoCodeButton } from "./AddPromoCodeButton";

export default async function PromoCodesAdminPage() {
  const supabase = await createClient();

  const [{ data: promoCodes }, { data: tickets }] = await Promise.all([
    supabase
      .from("promo_codes")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("tickets")
      .select("id, name_ro, name_ru, is_active")
      .order("sort_order", { ascending: true }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Промо-коды</h1>
          <p className="text-gray-500 mt-1">Управление промо-кодами и скидками</p>
        </div>
        <AddPromoCodeButton tickets={tickets ?? []} />
      </div>

      <PromoCodesTable promoCodes={promoCodes ?? []} tickets={tickets ?? []} />
    </div>
  );
}
