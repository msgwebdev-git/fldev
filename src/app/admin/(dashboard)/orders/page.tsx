import { createClient } from "@/lib/supabase/server";
import { OrdersTable } from "./OrdersTable";
import { OrderStats } from "./OrderStats";
import Link from "next/link";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export interface OrderData {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  discount_amount: number;
  promo_code: string | null;
  language: string;
  created_at: string;
  paid_at: string | null;
  failure_reason: string | null;
  is_invitation: boolean;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  ticket_id: string;
  ticket_option_id: string | null;
  quantity: number;
  unit_price: number;
  ticket_code: string;
  ticket: {
    name: string;
    name_ro: string;
    name_ru: string;
  };
  ticket_option?: {
    name: string;
    name_ro: string;
    name_ru: string;
  } | null;
}

async function getOrders(): Promise<OrderData[]> {
  const supabase = await createClient();

  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      *,
      items:order_items (
        id,
        ticket_id,
        ticket_option_id,
        quantity,
        unit_price,
        ticket_code,
        ticket:tickets (
          name,
          name_ro,
          name_ru
        ),
        ticket_option:ticket_options (
          name,
          name_ro,
          name_ru
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
    return [];
  }

  return orders || [];
}

async function getOrderStats() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("status, payment_status, total_amount, discount_amount, is_invitation");

  if (!orders) return { total: 0, paid: 0, pending: 0, failed: 0, revenue: 0, invitations: 0 };

  // Filter out invitations for sales stats
  const salesOrders = orders.filter((o) => !o.is_invitation);
  const invitationOrders = orders.filter((o) => o.is_invitation);

  const stats = {
    total: salesOrders.length,
    paid: salesOrders.filter((o) => o.status === "paid").length,
    pending: salesOrders.filter((o) => o.status === "pending").length,
    failed: salesOrders.filter((o) => o.status === "failed" || o.status === "expired" || o.status === "cancelled").length,
    revenue: salesOrders
      .filter((o) => o.status === "paid")
      .reduce((sum, o) => sum + (Number(o.total_amount) - Number(o.discount_amount || 0)), 0),
    invitations: invitationOrders.length,
  };

  return stats;
}

export default async function OrdersPage() {
  const [orders, stats] = await Promise.all([getOrders(), getOrderStats()]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Заказы</h1>
          <p className="text-gray-500 mt-1">Управление заказами и просмотр статистики продаж</p>
        </div>
        <Link
          href="/admin/orders/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Создать заказ
        </Link>
      </div>

      <OrderStats stats={stats} />

      <OrdersTable orders={orders} />
    </div>
  );
}
