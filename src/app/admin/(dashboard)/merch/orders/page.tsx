import Link from "next/link";
import { Package, Truck, Store } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface OrderRow {
  id: string;
  order_number: string;
  status: string;
  fulfillment_method: "pickup" | "delivery";
  fulfillment_status: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  created_at: string;
  merch_order_items: { quantity: number }[] | null;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Ожидает оплаты",
  paid: "Оплачен",
  failed: "Не оплачен",
  refunded: "Возврат",
  cancelled: "Отменён",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  paid: "bg-green-50 text-green-700",
  failed: "bg-red-50 text-red-600",
  refunded: "bg-gray-100 text-gray-600",
  cancelled: "bg-gray-100 text-gray-500",
};

const FULFILLMENT_LABELS: Record<string, string> = {
  processing: "В обработке",
  ready_for_pickup: "Готов к выдаче",
  shipped: "Отправлен",
  delivered: "Доставлен",
  picked_up: "Выдан",
};

export default async function MerchOrdersPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("merch_orders")
    .select("id, order_number, status, fulfillment_method, fulfillment_status, customer_name, customer_email, total_amount, created_at, merch_order_items(quantity)")
    .order("created_at", { ascending: false })
    .limit(200);

  const orders = (data ?? []) as OrderRow[];
  const paidCount = orders.filter((o) => o.status === "paid").length;
  const revenue = orders.filter((o) => o.status === "paid").reduce((s, o) => s + Number(o.total_amount), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Заказы мерча</h1>
        <p className="text-gray-500 mt-1">Оплаченные заказы и статусы выполнения</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Всего заказов</p>
          <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Оплачено</p>
          <p className="text-2xl font-bold text-green-600">{paidCount}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Выручка</p>
          <p className="text-2xl font-bold text-gray-900">{revenue.toLocaleString()} MDL</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Заказ</th>
              <th className="px-4 py-3 font-medium">Клиент</th>
              <th className="px-4 py-3 font-medium">Получение</th>
              <th className="px-4 py-3 font-medium">Статус</th>
              <th className="px-4 py-3 font-medium">Выполнение</th>
              <th className="px-4 py-3 font-medium text-right">Сумма</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center text-gray-400">
                  <Package className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                  Пока нет заказов
                </td>
              </tr>
            ) : (
              orders.map((o) => {
                const qty = (o.merch_order_items ?? []).reduce((s, i) => s + i.quantity, 0);
                return (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/merch/orders/${o.id}`} className="font-mono font-medium text-gray-900 hover:text-primary">
                        {o.order_number}
                      </Link>
                      <p className="text-xs text-gray-400">{qty} шт · {new Date(o.created_at).toLocaleDateString("ru-RU")}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-900">{o.customer_name}</p>
                      <p className="text-xs text-gray-400">{o.customer_email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-gray-600">
                        {o.fulfillment_method === "delivery" ? <Truck className="h-4 w-4" /> : <Store className="h-4 w-4" />}
                        {o.fulfillment_method === "delivery" ? "Доставка" : "Самовывоз"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[o.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {STATUS_LABELS[o.status] ?? o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {o.status === "paid" ? (FULFILLMENT_LABELS[o.fulfillment_status] ?? o.fulfillment_status) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">{o.total_amount} MDL</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
