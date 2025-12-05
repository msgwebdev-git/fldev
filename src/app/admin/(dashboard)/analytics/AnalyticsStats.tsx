"use client";

import { ShoppingCart, DollarSign, Ticket, TrendingUp } from "lucide-react";

interface AnalyticsStatsProps {
  totals: {
    totalOrders: number;
    totalRevenue: number;
    totalTickets: number;
    avgOrderValue: number;
  };
}

export function AnalyticsStats({ totals }: AnalyticsStatsProps) {
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

  return (
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
  );
}
