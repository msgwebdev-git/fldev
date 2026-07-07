import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Truck, Store, Gift } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { FulfillmentControls } from "./FulfillmentControls";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

const STATUS_LABELS: Record<string, string> = {
  pending: "Ожидает оплаты",
  paid: "Оплачен",
  failed: "Не оплачен",
  refunded: "Возврат",
  cancelled: "Отменён",
};

export default async function MerchOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("merch_orders")
    .select("*, merch_order_items(*)")
    .eq("id", id)
    .maybeSingle();

  if (!order) notFound();

  // Gift ticket order issued from a promotion, if any
  let giftNumber: string | null = null;
  if (order.gift_order_id) {
    const { data: gift } = await supabase
      .from("orders")
      .select("order_number")
      .eq("id", order.gift_order_id)
      .maybeSingle();
    giftNumber = gift?.order_number ?? null;
  }

  const items = (order.merch_order_items ?? []) as Array<{
    id: string;
    product_name: string;
    size: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;

  const isDelivery = order.fulfillment_method === "delivery";

  return (
    <div className="space-y-6 max-w-4xl">
      <Link href="/admin/merch/orders" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" /> К заказам
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-mono">{order.order_number}</h1>
          <p className="text-gray-500 mt-1">
            {new Date(order.created_at).toLocaleString("ru-RU")} · {STATUS_LABELS[order.status] ?? order.status}
          </p>
        </div>
        {giftNumber && (
          <Link
            href="/admin/invitations"
            className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary"
          >
            <Gift className="h-4 w-4" />
            Подарок выдан: {giftNumber}
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-2">
          <h2 className="font-semibold text-gray-900">Клиент</h2>
          <p className="text-sm text-gray-700">{order.customer_name}</p>
          <p className="text-sm text-gray-500">{order.customer_email}</p>
          <p className="text-sm text-gray-500">{order.customer_phone}</p>
        </div>

        {/* Fulfillment */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-2">
          <h2 className="flex items-center gap-2 font-semibold text-gray-900">
            {isDelivery ? <Truck className="h-4 w-4" /> : <Store className="h-4 w-4" />}
            {isDelivery ? "Доставка" : "Самовывоз на фестивале"}
          </h2>
          {isDelivery ? (
            <div className="text-sm text-gray-600">
              <p>{order.shipping_address}</p>
              <p>
                {[order.shipping_city, order.shipping_region, order.shipping_postal_code].filter(Boolean).join(", ")}
              </p>
              {order.shipping_notes && <p className="text-gray-400 mt-1">{order.shipping_notes}</p>}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Клиент заберёт заказ на территории фестиваля.</p>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Товар</th>
              <th className="px-4 py-3 font-medium">Размер</th>
              <th className="px-4 py-3 font-medium">Кол-во</th>
              <th className="px-4 py-3 font-medium text-right">Сумма</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((it) => (
              <tr key={it.id}>
                <td className="px-4 py-3 text-gray-900">{it.product_name}</td>
                <td className="px-4 py-3 text-gray-600">{it.size}</td>
                <td className="px-4 py-3 text-gray-600">{it.quantity}</td>
                <td className="px-4 py-3 text-right text-gray-900">{it.total_price} MDL</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t border-gray-200 p-4 space-y-1 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Товары</span><span>{order.subtotal_amount} MDL</span>
          </div>
          {order.discount_amount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Скидка {order.promo_code ? `(${order.promo_code})` : ""}</span><span>-{order.discount_amount} MDL</span>
            </div>
          )}
          <div className="flex justify-between text-gray-500">
            <span>Доставка</span><span>{order.shipping_amount > 0 ? `${order.shipping_amount} MDL` : "Бесплатно"}</span>
          </div>
          <div className="flex justify-between pt-1 text-base font-semibold text-gray-900">
            <span>Итого</span><span>{order.total_amount} MDL</span>
          </div>
        </div>
      </div>

      {/* Fulfillment status controls (only meaningful for paid orders) */}
      {order.status === "paid" && (
        <FulfillmentControls
          orderId={order.id}
          method={order.fulfillment_method}
          initialStatus={order.fulfillment_status}
          initialTracking={order.tracking_number ?? ""}
        />
      )}
    </div>
  );
}
