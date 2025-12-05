import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { OrderPageClient } from "./OrderPageClient";

export const dynamic = "force-dynamic";

interface OrderItem {
  id: string;
  ticket_id: string;
  ticket_option_id: string | null;
  quantity: number;
  unit_price: number;
  ticket_code: string;
  status: "valid" | "used" | "refunded";
  scanned_at: string | null;
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
  client_ip: string | null;
  maib_transaction_id: string | null;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
  failure_reason: string | null;
  reminder_count: number;
  reminder_sent_at: string | null;
  refund_reason: string | null;
  refunded_at: string | null;
  refunded_by: string | null;
  items: OrderItem[];
}

export interface CustomerOrderHistory {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  discount_amount: number;
  created_at: string;
  items_count: number;
}

async function getOrder(id: string): Promise<OrderData | null> {
  const supabase = await createClient();

  const { data: order, error } = await supabase
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
        status,
        scanned_at,
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
    .eq("id", id)
    .single();

  if (error || !order) {
    return null;
  }

  return order;
}

async function getCustomerOrderHistory(email: string, currentOrderId: string): Promise<CustomerOrderHistory[]> {
  const supabase = await createClient();

  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      status,
      total_amount,
      discount_amount,
      created_at,
      items:order_items (quantity)
    `)
    .eq("customer_email", email)
    .neq("id", currentOrderId)
    .order("created_at", { ascending: false });

  if (error || !orders) {
    return [];
  }

  return orders.map((order) => ({
    ...order,
    items_count: order.items?.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0) || 0,
  }));
}

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) {
    notFound();
  }

  const customerHistory = await getCustomerOrderHistory(order.customer_email, order.id);

  return <OrderPageClient order={order} customerHistory={customerHistory} />;
}
