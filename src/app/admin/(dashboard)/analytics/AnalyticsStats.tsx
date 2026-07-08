"use client";

import { ShoppingCart, DollarSign, Ticket, TrendingUp, Globe, Smartphone, PenLine, type LucideIcon } from "lucide-react";

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
    manual: SourceData;
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

  const pct = (n: number) =>
    totals.totalOrders > 0 ? Math.round((n / totals.totalOrders) * 100) : 0;

  const sources: Array<{ key: string; title: string; icon: LucideIcon; iconCls: string; borderCls: string; data: SourceData }> = [
    { key: "web", title: "Сайт", icon: Globe, iconCls: "text-blue-600", borderCls: "border-gray-200", data: sourceStats.web },
    { key: "app", title: "Приложение", icon: Smartphone, iconCls: "text-indigo-600", borderCls: "border-indigo-200", data: sourceStats.app },
    { key: "manual", title: "Вручную", icon: PenLine, iconCls: "text-amber-600", borderCls: "border-gray-200", data: sourceStats.manual },
  ].filter((s) => s.data.orders > 0);

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

      {/* Source breakdown — non-overlapping: Сайт + Приложение + Вручную = totals */}
      {sources.length > 1 && (
        <div className={`grid grid-cols-1 gap-4 ${sources.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
          {sources.map((s) => (
            <div key={s.key} className={`bg-white rounded-xl border ${s.borderCls} p-5`}>
              <div className="flex items-center gap-3 mb-4">
                <s.icon className={`w-5 h-5 ${s.iconCls}`} />
                <span className="font-semibold text-gray-900">{s.title}</span>
                <span className="ml-auto text-sm text-gray-400">{pct(s.data.orders)}%</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{s.data.orders}</p>
                  <p className="text-xs text-gray-500">заказов</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{s.data.tickets}</p>
                  <p className="text-xs text-gray-500">билетов</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{s.data.revenue.toLocaleString("ru-RU")}</p>
                  <p className="text-xs text-gray-500">MDL</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
