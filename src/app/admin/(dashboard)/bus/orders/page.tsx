import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface OrderRow {
  id: string;
  order_number: string;
  status: string;
  passengers: number;
  total_amount: number;
  customer_name: string;
  customer_email: string;
  created_at: string;
  bus_tickets: { checked_in_at: string | null }[] | null;
}

const STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: "Ожидает оплаты", cls: "bg-amber-50 text-amber-700" },
  paid: { label: "Оплачен", cls: "bg-green-50 text-green-700" },
  failed: { label: "Не оплачен", cls: "bg-red-50 text-red-600" },
  refunded: { label: "Возврат", cls: "bg-gray-100 text-gray-600" },
  cancelled: { label: "Отменён", cls: "bg-gray-100 text-gray-500" },
};

export default async function BusOrdersPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bus_orders")
    .select("id, order_number, status, passengers, total_amount, customer_name, customer_email, created_at, bus_tickets(checked_in_at)")
    .order("created_at", { ascending: false })
    .limit(200);

  const orders = (data ?? []) as OrderRow[];
  const paid = orders.filter((o) => o.status === "paid");
  const revenue = paid.reduce((s, o) => s + Number(o.total_amount), 0);

  return (
    <div className="space-y-6">
      <Link href="/admin/bus" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" /> К датам
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Заказы автобуса</h1>
        <p className="text-gray-500 mt-1">Оплаченные заказы и посадка</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4"><p className="text-sm text-gray-500">Всего</p><p className="text-2xl font-bold text-gray-900">{orders.length}</p></div>
        <div className="rounded-xl border border-gray-200 bg-white p-4"><p className="text-sm text-gray-500">Оплачено</p><p className="text-2xl font-bold text-green-600">{paid.length}</p></div>
        <div className="rounded-xl border border-gray-200 bg-white p-4"><p className="text-sm text-gray-500">Выручка</p><p className="text-2xl font-bold text-gray-900">{revenue.toLocaleString()} MDL</p></div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Заказ</th>
              <th className="px-4 py-3 font-medium">Клиент</th>
              <th className="px-4 py-3 font-medium">Пассажиры</th>
              <th className="px-4 py-3 font-medium">Посадка</th>
              <th className="px-4 py-3 font-medium">Статус</th>
              <th className="px-4 py-3 font-medium text-right">Сумма</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-16 text-center text-gray-400"><Package className="mx-auto mb-2 h-8 w-8 text-gray-300" />Пока нет заказов</td></tr>
            ) : (
              orders.map((o) => {
                const tickets = o.bus_tickets ?? [];
                const boarded = tickets.filter((t) => t.checked_in_at).length;
                const st = STATUS[o.status] ?? { label: o.status, cls: "bg-gray-100 text-gray-600" };
                return (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/bus/orders/${o.id}`} className="font-mono font-medium text-gray-900 hover:text-primary">{o.order_number}</Link>
                      <p className="text-xs text-gray-400">{new Date(o.created_at).toLocaleDateString("ru-RU")}</p>
                    </td>
                    <td className="px-4 py-3"><p className="text-gray-900">{o.customer_name}</p><p className="text-xs text-gray-400">{o.customer_email}</p></td>
                    <td className="px-4 py-3 text-gray-700">{o.passengers}</td>
                    <td className="px-4 py-3 text-gray-600">{o.status === "paid" ? `${boarded} / ${tickets.length}` : "—"}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${st.cls}`}>{st.label}</span></td>
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
