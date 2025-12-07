import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Briefcase,
  Search,
  Filter,
  Download,
  Eye,
  FileText,
  Send,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

// Get B2B orders with items
async function getB2BOrders() {
  const supabase = await createClient();

  const { data: orders, error } = await supabase
    .from("b2b_orders")
    .select(`
      *,
      b2b_order_items (
        id,
        ticket_id,
        quantity,
        unit_price,
        total_price,
        tickets (
          name,
          name_ro,
          name_ru
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching B2B orders:", error);
    return [];
  }

  return orders || [];
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusBadge(status: string) {
  const config: Record<
    string,
    { label: string; className: string; icon: typeof Clock }
  > = {
    pending: {
      label: "Ожидает",
      className: "bg-yellow-50 text-yellow-700 border-yellow-200",
      icon: Clock,
    },
    invoice_sent: {
      label: "Счёт отправлен",
      className: "bg-blue-50 text-blue-700 border-blue-200",
      icon: FileText,
    },
    paid: {
      label: "Оплачен",
      className: "bg-green-50 text-green-700 border-green-200",
      icon: CheckCircle,
    },
    tickets_generated: {
      label: "Билеты готовы",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: CheckCircle,
    },
    tickets_sent: {
      label: "Билеты отправлены",
      className: "bg-purple-50 text-purple-700 border-purple-200",
      icon: Send,
    },
    completed: {
      label: "Завершён",
      className: "bg-gray-50 text-gray-700 border-gray-200",
      icon: CheckCircle,
    },
    cancelled: {
      label: "Отменён",
      className: "bg-red-50 text-red-700 border-red-200",
      icon: XCircle,
    },
  };

  const statusConfig = config[status] || config.pending;
  const Icon = statusConfig.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig.className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {statusConfig.label}
    </span>
  );
}

function getPaymentMethodLabel(method: string) {
  const labels: Record<string, string> = {
    online: "Онлайн",
    invoice: "По счёту",
  };
  return labels[method] || method;
}

export default async function B2BOrdersPage() {
  const orders = await getB2BOrders();

  // Calculate stats
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    paid: orders.filter((o) => o.status === "paid").length,
    revenue: orders
      .filter((o) => o.status === "paid" || o.status === "completed")
      .reduce((sum, o) => sum + Number(o.final_amount), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Briefcase className="w-6 h-6" />
            B2B Заказы
          </h1>
          <p className="text-gray-500 mt-1">Корпоративные заказы билетов</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Всего заказов</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-yellow-50 text-yellow-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Ожидают</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-50 text-green-600">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Оплачено</p>
              <p className="text-2xl font-bold text-gray-900">{stats.paid}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Выручка</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(stats.revenue).toLocaleString("ru-RU")} MDL
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Все заказы</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Заказ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Компания
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Контакт
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Билетов
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Сумма
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Оплата
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <Briefcase className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">B2B заказов пока нет</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Корпоративные заказы появятся здесь
                    </p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const totalTickets = order.b2b_order_items.reduce(
                    (sum: number, item: any) => sum + item.quantity,
                    0
                  );

                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/b2b-orders/${order.id}`}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          #{order.order_number}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {order.company_name}
                          </div>
                          {order.company_tax_id && (
                            <div className="text-gray-500 text-xs">
                              IDNO: {order.company_tax_id}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="text-gray-900">{order.contact_name}</div>
                          <div className="text-gray-500 text-xs">
                            {order.contact_email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">
                          {totalTickets}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {Math.round(Number(order.final_amount)).toLocaleString("ru-RU")} MDL
                          </div>
                          {Number(order.discount_amount) > 0 && (
                            <div className="text-xs text-green-600">
                              -{order.discount_percent}% скидка
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {getPaymentMethodLabel(order.payment_method)}
                        </span>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500">
                          {formatDate(order.created_at)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/b2b-orders/${order.id}`}
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          <Eye className="w-4 h-4" />
                          Открыть
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
