import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MerchPromotionEditor } from "@/components/admin/MerchPromotionEditor";
import type { PromotionInput } from "@/app/admin/(dashboard)/merch/actions";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditPromotionPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: promo }, { data: ticketRows }] = await Promise.all([
    supabase.from("merch_promotions").select("*").eq("id", id).maybeSingle(),
    supabase.from("tickets").select("id, name_ru").eq("is_active", true).order("sort_order", { ascending: true }),
  ]);

  if (!promo) notFound();

  const tickets = (ticketRows ?? []).map((t) => ({ id: t.id as string, name: t.name_ru as string }));

  const initial: PromotionInput = {
    id: promo.id,
    name: promo.name,
    isActive: promo.is_active !== false,
    minOrderAmount: Number(promo.min_order_amount),
    amountBasis: (promo.amount_basis ?? "subtotal") as "subtotal" | "total",
    rewardTicketId: promo.reward_ticket_id,
    rewardOptionId: promo.reward_option_id ?? null,
    rewardQuantity: promo.reward_quantity ?? 1,
    maxRedemptions: promo.max_redemptions ?? null,
    startsAt: promo.starts_at ?? null,
    endsAt: promo.ends_at ?? null,
  };

  return <MerchPromotionEditor tickets={tickets} initial={initial} isEdit />;
}
