"use client";

import { ShoppingCart, DollarSign, Ticket, TrendingUp, Globe, Smartphone } from "lucide-react";

interface SourceData {
  orders: number;
  revenue: number;
  tickets: number;
}

interface AnalyticsStatsProps {
  totals: {
    totalOrders: number;
    totalRevenue: number;
    totalTickets: number;
    avgOrderValue: number;
  };
  sourceStats: {
    web: SourceData;
    app: SourceData;
  };
}

export function AnalyticsStats({ totals, sourceStats }: AnalyticsStatsProps) {
  const cards = [
    {
      title: "Всего заказов",
      value: totals.totalOrders.toLocaleString("ru-RU"),
      icon: ShoppingCart,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Выручка",
      value: `${totals.totalRevenue.toLocaleString("ru-RU")} MDL`,
      icon: DollarSign,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Билетов продано",
      value: totals.totalTickets.toLocaleString("ru-RU"),
      icon: Ticket,
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Средний чек",
      value: `${Math.round(totals.avgOrderValue).toLocaleString("ru-RU")} MDL`,
      icon: TrendingUp,
      color: "bg-amber-50 text-amber-600",
    },
  ];

  const hasAppOrders = sourceStats.app.orders > 0;
  const appPct = totals.totalOrders > 0 ? Math.round((sourceStats.app.orders / totals.totalOrders) * 100) : 0;
  const webPct = 100 - appPct;

  return (
    <div className="space-y-4">
      {/* Main stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
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

      {/* Source breakdown: Site vs App */}
      {hasAppOrders && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-gray-900">Сайт</span>
              <span className="ml-auto text-sm text-gray-400">{webPct}%</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">{sourceStats.web.orders}</p>
                <p className="text-xs text-gray-500">заказов</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{sourceStats.web.tickets}</p>
                <p className="text-xs text-gray-500">билетов</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{sourceStats.web.revenue.toLocaleString("ru-RU")}</p>
                <p className="text-xs text-gray-500">MDL</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-indigo-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <Smartphone className="w-5 h-5 text-indigo-600" />
              <span className="font-semibold text-gray-900">Приложение</span>
              <span className="ml-auto text-sm text-indigo-500">{appPct}%</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">{sourceStats.app.orders}</p>
                <p className="text-xs text-gray-500">заказов</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{sourceStats.app.tickets}</p>
                <p className="text-xs text-gray-500">билетов</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{sourceStats.app.revenue.toLocaleString("ru-RU")}</p>
                <p className="text-xs text-gray-500">MDL</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
