import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  User,
  Mail,
  Phone,
  FileText,
  Calendar,
  CreditCard,
  Package,
  Download,
  Send,
  CheckCircle,
  Ticket,
  AlertCircle,
} from "lucide-react";
import { B2BOrderActions } from "@/components/admin/B2BOrderActions";

export const dynamic = "force-dynamic";

// Get B2B order by ID
async function getB2BOrder(id: string) {
  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from("b2b_orders")
    .select(`
      *,
      b2b_order_items (
        id,
        ticket_id,
        ticket_option_id,
        quantity,
        unit_price,
        discount_percent,
        total_price,
        tickets (
          id,
          name,
          name_ro,
          name_ru
        ),
        ticket_options (
          id,
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

// Get order history
async function getOrderHistory(orderId: string) {
  const supabase = await createClient();

  const { data: history } = await supabase
    .from("b2b_order_history")
    .select("*")
    .eq("b2b_order_id", orderId)
    .order("created_at", { ascending: false });

  return history || [];
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusBadge(status: string) {
  const config: Record<
    string,
    { label: string; className: string }
  > = {
    pending: {
      label: "Ожидает обработки",
      className: "bg-yellow-50 text-yellow-700 border-yellow-200",
    },
    invoice_sent: {
      label: "Счёт отправлен",
      className: "bg-blue-50 text-blue-700 border-blue-200",
    },
    paid: {
      label: "Оплачен",
      className: "bg-green-50 text-green-700 border-green-200",
    },
    tickets_generated: {
      label: "Билеты сгенерированы",
      className: "bg-indigo-50 text-indigo-700 border-indigo-200",
    },
    tickets_sent: {
      label: "Билеты отправлены",
      className: "bg-purple-50 text-purple-700 border-purple-200",
    },
    completed: {
      label: "Завершён",
      className: "bg-gray-50 text-gray-700 border-gray-200",
    },
    cancelled: {
      label: "Отменён",
      className: "bg-red-50 text-red-700 border-red-200",
    },
  };

  const statusConfig = config[status] || config.pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${statusConfig.className}`}
    >
      {statusConfig.label}
    </span>
  );
}

export default async function B2BOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getB2BOrder(id);
  const history = await getOrderHistory(id);

  if (!order) {
    notFound();
  }

  const totalTickets = order.b2b_order_items.reduce(
    (sum: number, item: any) => sum + item.quantity,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/b2b-orders"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Заказ #{order.order_number}
            </h1>
            <p className="text-gray-500 mt-1">
              Создан {formatDate(order.created_at)}
            </p>
          </div>
        </div>
        <div>{getStatusBadge(order.status)}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Состав заказа
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Билет
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Цена
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Кол-во
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Скидка
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Сумма
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.b2b_order_items.map((item: any) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {item.tickets.name_ru}
                          </div>
                          {item.ticket_options && (
                            <div className="text-gray-500 text-xs">
                              {item.ticket_options.name_ru}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {item.unit_price.toFixed(2)} MDL
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {item.discount_percent > 0 ? `${item.discount_percent}%` : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                        {Math.round(Number(item.total_price)).toLocaleString("ru-RU")} MDL
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-sm font-medium text-gray-900">
                      Промежуточный итог
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                      {Math.round(Number(order.total_amount)).toLocaleString("ru-RU")} MDL
                    </td>
                  </tr>
                  {Number(order.discount_amount) > 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-3 text-sm text-gray-600">
                        Скидка ({order.discount_percent}%)
                      </td>
                      <td className="px-6 py-3 text-sm text-green-600 text-right">
                        -{Math.round(Number(order.discount_amount)).toLocaleString("ru-RU")} MDL
                      </td>
                    </tr>
                  )}
                  <tr className="border-t-2">
                    <td colSpan={4} className="px-6 py-4 text-base font-bold text-gray-900">
                      Итого
                    </td>
                    <td className="px-6 py-4 text-base font-bold text-gray-900 text-right">
                      {Math.round(Number(order.final_amount)).toLocaleString("ru-RU")} MDL
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Order History */}
          {history.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                История заказа
              </h2>
              <div className="space-y-3">
                {history.map((entry: any, index: number) => (
                  <div
                    key={entry.id}
                    className={`flex gap-4 ${index !== history.length - 1 ? "pb-3 border-b border-gray-100" : ""}`}
                  >
                    <div className="text-sm text-gray-500 min-w-[140px]">
                      {formatDate(entry.created_at)}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {entry.status}
                      </div>
                      {entry.note && (
                        <div className="text-sm text-gray-500 mt-1">{entry.note}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Действия</h3>
            <B2BOrderActions order={order} />
          </div>

          {/* Company Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Компания
            </h3>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500">Название</div>
                <div className="text-sm font-medium text-gray-900 mt-1">
                  {order.company_name}
                </div>
              </div>
              {order.company_tax_id && (
                <div>
                  <div className="text-sm text-gray-500">IDNO</div>
                  <div className="text-sm font-medium text-gray-900 mt-1">
                    {order.company_tax_id}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Контактное лицо
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{order.contact_name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <a
                  href={`mailto:${order.contact_email}`}
                  className="hover:text-primary"
                >
                  {order.contact_email}
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <a href={`tel:${order.contact_phone}`} className="hover:text-primary">
                  {order.contact_phone}
                </a>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Информация о заказе
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Всего билетов</span>
                <span className="font-medium text-gray-900">{totalTickets}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Способ оплаты</span>
                <span className="font-medium text-gray-900">
                  {order.payment_method === "online" ? "Онлайн" : "По счёту"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Язык</span>
                <span className="font-medium text-gray-900">
                  {order.language === "ro" ? "Румынский" : "Русский"}
                </span>
              </div>
              {order.notes && (
                <div className="pt-3 border-t border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">Примечания</div>
                  <div className="text-sm text-gray-900">{order.notes}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
