import { createClient } from "@/lib/supabase/server";
import { CreateInvitationForm } from "./CreateInvitationForm";
import { InvitationsTable } from "./InvitationsTable";
import { Ticket, Users, Gift } from "lucide-react";

export const dynamic = "force-dynamic";

async function getInvitationStats(supabase: any) {
  // Get all invitation orders with their items and ticket info
  const { data: orders } = await supabase
    .from("orders")
    .select(`
      id,
      created_at,
      items:order_items (
        quantity,
        ticket:tickets (
          name_ro,
          price
        ),
        option:ticket_options (
          name_ro,
          price_modifier
        )
      )
    `)
    .eq("is_invitation", true);

  if (!orders || orders.length === 0) {
    return { totalInvitations: 0, totalTickets: 0, estimatedValue: 0, byType: [] };
  }

  const typeMap = new Map<string, { count: number; unitPrice: number }>();
  let totalTickets = 0;
  let estimatedValue = 0;

  for (const order of orders) {
    for (const item of order.items || []) {
      const qty = item.quantity || 1;
      const name = item.ticket?.name_ro || "Unknown";
      const price = Number(item.ticket?.price || 0) + Number(item.option?.price_modifier || 0);

      totalTickets += qty;
      estimatedValue += price * qty;

      const existing = typeMap.get(name);
      if (existing) {
        existing.count += qty;
      } else {
        typeMap.set(name, { count: qty, unitPrice: price });
      }
    }
  }

  const byType = Array.from(typeMap.entries())
    .map(([name, { count, unitPrice }]) => ({ name, count, value: unitPrice * count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalInvitations: orders.length,
    totalTickets,
    estimatedValue,
    byType,
  };
}

export default async function InvitationsPage() {
  const supabase = await createClient();

  // Get tickets for the form
  const { data: tickets } = await supabase
    .from("tickets")
    .select(`
      id,
      name_ro,
      name_ru,
      price,
      is_active,
      has_options,
      ticket_options (
        id,
        name_ro,
        name_ru,
        price_modifier,
        is_default
      )
    `)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  // Get recent invitations
  const { data: invitations } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      customer_name,
      customer_email,
      promo_code,
      created_at,
      items:order_items (
        id,
        ticket_code,
        ticket:tickets (
          name_ro,
          name_ru
        )
      )
    `)
    .eq("is_invitation", true)
    .order("created_at", { ascending: false })
    .limit(50);

  const stats = await getInvitationStats(supabase);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Приглашения</h1>
        <p className="text-gray-500 mt-1">
          Создание бесплатных приглашений (не учитываются в продажах)
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Приглашений</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalInvitations}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Билетов выдано</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTickets}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Общая сумма</p>
              <p className="text-2xl font-bold text-gray-900">{stats.estimatedValue.toLocaleString("ru-RU")} MDL</p>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown by ticket type */}
      {stats.byType.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-medium text-gray-500 mb-3">По типам билетов</h3>
          <div className="space-y-2">
            {stats.byType.map((type) => (
              <div key={type.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-900">{type.name}</span>
                  <span className="text-xs text-gray-400">{type.count} шт.</span>
                </div>
                <span className="text-sm text-gray-500">{type.value.toLocaleString("ru-RU")} MDL</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Invitation Form */}
      <CreateInvitationForm tickets={tickets ?? []} />

      {/* Recent Invitations */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Последние приглашения
        </h2>
        <InvitationsTable invitations={(invitations ?? []) as any} />
      </div>
    </div>
  );
}
