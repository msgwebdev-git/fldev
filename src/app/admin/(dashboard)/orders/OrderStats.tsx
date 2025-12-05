"use client";

import { ShoppingCart, CheckCircle, Clock, XCircle, DollarSign, Gift } from "lucide-react";

interface OrderStatsProps {
  stats: {
    total: number;
    paid: number;
    pending: number;
    failed: number;
    revenue: number;
    invitations: number;
  };
}

export function OrderStats({ stats }: OrderStatsProps) {
  const cards = [
    {
      title: "Всего заказов",
      value: stats.total,
      icon: ShoppingCart,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Оплачено",
      value: stats.paid,
      icon: CheckCircle,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Ожидают оплаты",
      value: stats.pending,
      icon: Clock,
      color: "bg-yellow-50 text-yellow-600",
    },
    {
      title: "Отменено / Ошибки",
      value: stats.failed,
      icon: XCircle,
      color: "bg-red-50 text-red-600",
    },
    {
      title: "Выручка",
      value: `${stats.revenue.toLocaleString("ru-RU")} MDL`,
      icon: DollarSign,
      color: "bg-purple-50 text-purple-600",
      isRevenue: true,
    },
    {
      title: "Приглашения",
      value: stats.invitations,
      icon: Gift,
      color: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${card.color}`}>
              <card.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">{card.title}</p>
              <p className={`font-semibold ${card.isRevenue ? "text-lg" : "text-2xl"} text-gray-900`}>
                {card.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
