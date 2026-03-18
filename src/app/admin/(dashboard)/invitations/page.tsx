import { createClient } from "@/lib/supabase/server";
import { InvitationsTable } from "./InvitationsTable";
import { BatchSendButton } from "./BatchSendButton";
import { Ticket, Users, Gift, Plus, FileUp, Send } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getInvitationStats(supabase: any) {
  const { data: orders } = await supabase
    .from("orders")
    .select(`
      id,
      items:order_items (
        quantity,
        pdf_url,
        ticket:tickets ( name_ro, price ),
        option:ticket_options ( price_modifier )
      )
    `)
    .eq("is_invitation", true);

  if (!orders || orders.length === 0) {
    return { total: 0, totalTickets: 0, sent: 0, unsent: 0, estimatedValue: 0 };
  }

  let totalTickets = 0;
  let sent = 0;
  let unsent = 0;
  let estimatedValue = 0;

  for (const order of orders) {
    for (const item of order.items || []) {
      const qty = item.quantity || 1;
      const price = Number(item.ticket?.price || 0) + Number(item.option?.price_modifier || 0);
      totalTickets += qty;
      estimatedValue += price * qty;
      if (item.pdf_url) sent += qty;
      else unsent += qty;
    }
  }

  return { total: orders.length, totalTickets, sent, unsent, estimatedValue };
}

export default async function InvitationsPage() {
  const supabase = await createClient();

  // Get all invitations (no limit)
  const { data: invitations } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      customer_name,
      customer_email,
      customer_phone,
      promo_code,
      created_at,
      items:order_items (
        id,
        ticket_code,
        pdf_url,
        ticket:tickets ( name_ro, name_ru )
      )
    `)
    .eq("is_invitation", true)
    .order("created_at", { ascending: false });

  const stats = await getInvitationStats(supabase);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Приглашения</h1>
          <p className="text-gray-500 text-sm mt-1">
            Управление бесплатными пригласительными билетами
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/invitations/create"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Создать
          </Link>
          <Link
            href="/admin/invitations/import"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <FileUp className="h-4 w-4" />
            Импорт CSV
          </Link>
          <BatchSendButton unsentCount={stats.unsent} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-50">
              <Gift className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Всего</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50">
              <Ticket className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Билетов</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalTickets}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-50">
              <Send className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Отправлено</p>
              <p className="text-xl font-bold text-green-600">{stats.sent}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-50">
              <Users className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Ожидают</p>
              <p className="text-xl font-bold text-amber-600">{stats.unsent}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-50">
              <Ticket className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Сумма</p>
              <p className="text-xl font-bold text-gray-900">{stats.estimatedValue.toLocaleString("ru-RU")} MDL</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <InvitationsTable invitations={(invitations ?? []) as any} />
    </div>
  );
}
