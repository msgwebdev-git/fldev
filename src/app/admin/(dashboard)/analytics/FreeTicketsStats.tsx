"use client";

import { Gift, Trophy, PenLine, ShoppingBag, Ticket } from "lucide-react";

interface FreeTicketData {
  type: "invitation" | "giveaway" | "manual" | "offline";
  label: string;
  orders: number;
  tickets: number;
}

interface FreeTicketsStatsProps {
  data: FreeTicketData[];
}

const TYPE_CONFIG: Record<string, { icon: typeof Gift; color: string; bg: string }> = {
  invitation: { icon: Gift, color: "text-amber-600", bg: "bg-amber-50" },
  giveaway: { icon: Trophy, color: "text-purple-600", bg: "bg-purple-50" },
  manual: { icon: PenLine, color: "text-blue-600", bg: "bg-blue-50" },
  offline: { icon: ShoppingBag, color: "text-green-600", bg: "bg-green-50" },
};

export function FreeTicketsStats({ data }: FreeTicketsStatsProps) {
  const totalOrders = data.reduce((s, d) => s + d.orders, 0);
  const totalTickets = data.reduce((s, d) => s + d.tickets, 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-[auto_1fr_1fr_1fr_1fr] gap-4 items-center">
      {/* Total */}
      <div className="col-span-2 md:col-span-1 p-4 rounded-lg bg-gray-50 text-center md:text-left">
        <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
          <Ticket className="w-4 h-4 text-gray-500" />
          <span className="text-xs text-gray-500">Всего</span>
        </div>
        <p className="text-2xl font-bold text-gray-900">{totalTickets}</p>
        <p className="text-xs text-gray-400">{totalOrders} заказов</p>
      </div>

      {/* Per type */}
      {data.map((item) => {
        const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.manual;
        const Icon = config.icon;

        return (
          <div key={item.type} className={`p-4 rounded-lg ${config.bg} text-center`}>
            <div className="flex items-center gap-2 justify-center mb-1">
              <Icon className={`w-4 h-4 ${config.color}`} />
              <span className="text-xs text-gray-500">{item.label}</span>
            </div>
            <p className={`text-2xl font-bold ${config.color}`}>{item.tickets}</p>
            <p className="text-xs text-gray-400">{item.orders} заказов</p>
          </div>
        );
      })}
    </div>
  );
}
