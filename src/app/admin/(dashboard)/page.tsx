import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  ShoppingCart,
  DollarSign,
  Ticket,
  TrendingUp,
  Music,
  Calendar,
  Sparkles,
  Newspaper,
  Handshake,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

// Получение статистики продаж
async function getSalesStats() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("status, total_amount, discount_amount, is_invitation");

  if (!orders) {
    return { totalOrders: 0, revenue: 0, pending: 0, paid: 0, failed: 0 };
  }

  const salesOrders = orders.filter((o) => !o.is_invitation);

  return {
    totalOrders: salesOrders.length,
    revenue: salesOrders
      .filter((o) => o.status === "paid")
      .reduce((sum, o) => sum + (Number(o.total_amount) - Number(o.discount_amount || 0)), 0),
    pending: salesOrders.filter((o) => o.status === "pending").length,
    paid: salesOrders.filter((o) => o.status === "paid").length,
    failed: salesOrders.filter((o) => ["failed", "expired", "cancelled"].includes(o.status)).length,
  };
}

// Получение количества проданных билетов
async function getTicketsSold() {
  const supabase = await createClient();

  // Получаем ID оплаченных заказов (не приглашений)
  const { data: paidOrders } = await supabase
    .from("orders")
    .select("id")
    .eq("status", "paid")
    .eq("is_invitation", false);

  if (!paidOrders?.length) return 0;

  const { data: items } = await supabase
    .from("order_items")
    .select("quantity")
    .in("order_id", paidOrders.map((o) => o.id))
    .eq("is_invitation", false);

  return items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
}

// Получение статистики контента
async function getContentStats() {
  const supabase = await createClient();
  const currentYear = new Date().getFullYear();

  const [artists, events, activities, news, partners] = await Promise.all([
    supabase.from("artists").select("id", { count: "exact" }).eq("year", currentYear),
    supabase.from("program_events").select("id", { count: "exact" }).eq("year", currentYear),
    supabase.from("activities").select("id", { count: "exact" }).eq("year", currentYear),
    supabase.from("news").select("id, is_published", { count: "exact" }),
    supabase.from("partners").select("id", { count: "exact" }).eq("year", currentYear),
  ]);

  const publishedNews = news.data?.filter((n) => n.is_published).length || 0;
  const draftNews = news.data?.filter((n) => !n.is_published).length || 0;

  return {
    artists: artists.count || 0,
    events: events.count || 0,
    activities: activities.count || 0,
    news: { published: publishedNews, drafts: draftNews },
    partners: partners.count || 0,
  };
}

// Получение последних заказов
async function getRecentOrders() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      status,
      customer_email,
      total_amount,
      discount_amount,
      created_at,
      is_invitation
    `)
    .order("created_at", { ascending: false })
    .limit(7);

  return orders || [];
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusBadge(status: string, isInvitation: boolean) {
  if (isInvitation) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
        Приглашение
      </span>
    );
  }

  const styles: Record<string, string> = {
    paid: "bg-green-50 text-green-700",
    pending: "bg-yellow-50 text-yellow-700",
    failed: "bg-red-50 text-red-700",
    expired: "bg-gray-50 text-gray-600",
    cancelled: "bg-gray-50 text-gray-600",
  };

  const labels: Record<string, string> = {
    paid: "Оплачен",
    pending: "Ожидает",
    failed: "Ошибка",
    expired: "Истёк",
    cancelled: "Отменён",
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
      {labels[status] || status}
    </span>
  );
}

export default async function AdminDashboardPage() {
  const [salesStats, ticketsSold, contentStats, recentOrders] = await Promise.all([
    getSalesStats(),
    getTicketsSold(),
    getContentStats(),
    getRecentOrders(),
  ]);

  const avgOrderValue = salesStats.paid > 0 ? salesStats.revenue / salesStats.paid : 0;

  const salesCards = [
    {
      title: "Выручка",
      value: `${salesStats.revenue.toLocaleString("ru-RU")} MDL`,
      icon: DollarSign,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Заказов оплачено",
      value: salesStats.paid.toLocaleString("ru-RU"),
      icon: CheckCircle,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Билетов продано",
      value: ticketsSold.toLocaleString("ru-RU"),
      icon: Ticket,
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Средний чек",
      value: `${Math.round(avgOrderValue).toLocaleString("ru-RU")} MDL`,
      icon: TrendingUp,
      color: "bg-amber-50 text-amber-600",
    },
  ];

  const pendingCard = salesStats.pending > 0 ? {
    title: "Ожидают оплаты",
    value: salesStats.pending,
    icon: Clock,
    color: "bg-yellow-50 text-yellow-600",
  } : null;

  const contentCards = [
    {
      title: "Артистов",
      value: contentStats.artists,
      icon: Music,
      href: "/admin/lineup",
      color: "text-pink-600",
    },
    {
      title: "Событий",
      value: contentStats.events,
      icon: Calendar,
      href: "/admin/program",
      color: "text-blue-600",
    },
    {
      title: "Активностей",
      value: contentStats.activities,
      icon: Sparkles,
      href: "/admin/activities",
      color: "text-purple-600",
    },
    {
      title: "Новостей",
      value: contentStats.news.published,
      subtitle: contentStats.news.drafts > 0 ? `+${contentStats.news.drafts} черновик${contentStats.news.drafts > 1 ? "а" : ""}` : undefined,
      icon: Newspaper,
      href: "/admin/news",
      color: "text-orange-600",
    },
    {
      title: "Партнёров",
      value: contentStats.partners,
      icon: Handshake,
      href: "/admin/partners",
      color: "text-teal-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Добро пожаловать!</h1>
        <p className="text-gray-500 mt-1">Обзор фестиваля Festivalul Lupilor</p>
      </div>

      {/* Sales Stats */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Продажи</h2>
          <Link
            href="/admin/analytics"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            Подробнее <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {salesCards.map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${card.color}`}>
                  <card.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pending orders alert */}
        {pendingCard && (
          <Link
            href="/admin/orders?status=pending"
            className="mt-4 flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl hover:bg-yellow-100 transition-colors"
          >
            <Clock className="w-5 h-5 text-yellow-600" />
            <span className="text-yellow-800 font-medium">
              {pendingCard.value} заказ{pendingCard.value === 1 ? "" : pendingCard.value < 5 ? "а" : "ов"} ожида{pendingCard.value === 1 ? "ет" : "ют"} оплаты
            </span>
            <ArrowRight className="w-4 h-4 text-yellow-600 ml-auto" />
          </Link>
        )}
      </section>

      {/* Content Stats */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Контент {new Date().getFullYear()}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {contentCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-gray-300 transition-all group"
            >
              <div className="flex items-center gap-3">
                <card.icon className={`w-5 h-5 ${card.color}`} />
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  {card.title}
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">{card.value}</span>
                {card.subtitle && (
                  <span className="text-sm text-gray-400">{card.subtitle}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Orders */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Последние заказы</h2>
          <Link
            href="/admin/orders"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            Все заказы <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Заказ
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Покупатель
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Сумма
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Дата
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    Заказов пока нет
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        #{order.order_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-sm text-gray-600 truncate max-w-[200px] block">
                        {order.customer_email}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-900">
                        {(Number(order.total_amount) - Number(order.discount_amount || 0)).toLocaleString("ru-RU")} MDL
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(order.status, order.is_invitation)}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm text-gray-500">
                        {formatDate(order.created_at)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
