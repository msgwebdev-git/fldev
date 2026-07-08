import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

const STATUS_LABELS: Record<string, string> = {
  pending: "Ожидает оплаты",
  paid: "Оплачен",
  failed: "Не оплачен",
  refunded: "Возврат",
  cancelled: "Отменён",
};

export default async function BusOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: order } = await supabase
    .from("bus_orders")
    .select("*, bus_tickets(*)")
    .eq("id", id)
    .maybeSingle();

  if (!order) notFound();

  const tickets = (order.bus_tickets ?? []) as Array<{
    id: string; travel_date: string; direction: "tur" | "retur";
    passenger_index: number; ticket_code: string; checked_in_at: string | null; checked_in_by: string | null;
  }>;
  tickets.sort((a, b) =>
    a.travel_date.localeCompare(b.travel_date) || a.passenger_index - b.passenger_index || a.direction.localeCompare(b.direction)
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <Link href="/admin/bus/orders" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" /> К заказам
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-mono">{order.order_number}</h1>
        <p className="text-gray-500 mt-1">
          {new Date(order.created_at).toLocaleString("ru-RU")} · {STATUS_LABELS[order.status] ?? order.status}
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-2">
        <h2 className="font-semibold text-gray-900">Клиент</h2>
        <p className="text-sm text-gray-700">{order.customer_name}</p>
        <p className="text-sm text-gray-500">{order.customer_email}</p>
        <p className="text-sm text-gray-500">{order.customer_phone}</p>
        <p className="text-sm text-gray-500">Пассажиров: {order.passengers}</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Дата</th>
              <th className="px-4 py-3 font-medium">Направление</th>
              <th className="px-4 py-3 font-medium">Пассажир</th>
              <th className="px-4 py-3 font-medium">Код</th>
              <th className="px-4 py-3 font-medium">Посадка</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tickets.map((tk) => (
              <tr key={tk.id}>
                <td className="px-4 py-3 text-gray-900">{new Date(tk.travel_date).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 text-gray-600">
                    {tk.direction === "tur" ? <ArrowRight className="h-3.5 w-3.5" /> : <ArrowLeft className="h-3.5 w-3.5" />}
                    {tk.direction === "tur" ? "Туда" : "Обратно"}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">#{tk.passenger_index}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{tk.ticket_code}</td>
                <td className="px-4 py-3">
                  {tk.checked_in_at ? (
                    <span className="inline-flex items-center gap-1 text-green-600">
                      <Check className="h-4 w-4" /> {new Date(tk.checked_in_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t border-gray-200 p-4 flex justify-between text-base font-semibold text-gray-900">
          <span>Итого</span><span>{order.total_amount} MDL</span>
        </div>
      </div>
    </div>
  );
}
