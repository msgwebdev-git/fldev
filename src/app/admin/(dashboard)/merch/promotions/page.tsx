import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { PromotionsTable, type AdminPromotion } from "./PromotionsTable";

export const dynamic = "force-dynamic";

export default async function MerchPromotionsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("merch_promotions")
    .select("id, name, is_active, min_order_amount, reward_quantity, max_redemptions, redemption_count, starts_at, ends_at, reward_ticket_id, tickets:reward_ticket_id(name_ru)")
    .order("created_at", { ascending: false });

  const promotions = (data ?? []) as unknown as AdminPromotion[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Акции магазина</h1>
          <p className="text-gray-500 mt-1">«Закажи мерч на N — билет в подарок»</p>
        </div>
        <Button asChild>
          <Link href="/admin/merch/promotions/new">
            <Plus className="mr-2 h-4 w-4" />
            Добавить акцию
          </Link>
        </Button>
      </div>

      <PromotionsTable promotions={promotions} />
    </div>
  );
}
