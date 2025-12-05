"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface TicketStats {
  ticketId: string;
  ticketName: string;
  count: number;
  revenue: number;
}

interface PopularTicketsChartProps {
  data: TicketStats[];
}

const COLORS = [
  "#DC5722", // Primary orange
  "#3b82f6", // Blue
  "#22c55e", // Green
  "#a855f7", // Purple
  "#f59e0b", // Amber
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#84cc16", // Lime
];

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="font-medium text-gray-900 mb-2">{data.ticketName}</p>
        <div className="space-y-1 text-sm">
          <p className="text-gray-600">
            Продано: <strong>{data.count} шт.</strong>
          </p>
          <p className="text-green-600">
            Выручка: <strong>{data.revenue.toLocaleString("ru-RU")} MDL</strong>
          </p>
        </div>
      </div>
    );
  }
  return null;
}

function shortenName(name: string, maxLength: number = 15): string {
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength) + "...";
}

type ChartType = "bar" | "pie";
type ViewMode = "count" | "revenue";

export function PopularTicketsChart({ data }: PopularTicketsChartProps) {
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [viewMode, setViewMode] = useState<ViewMode>("count");

  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-gray-500">
        <p>Нет данных о продажах билетов</p>
      </div>
    );
  }

  // Sort by selected metric
  const sortedData = [...data].sort((a, b) =>
    viewMode === "count" ? b.count - a.count : b.revenue - a.revenue
  );

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        {/* View Mode */}
        <div className="flex gap-1">
          <Button
            variant={viewMode === "count" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("count")}
          >
            По количеству
          </Button>
          <Button
            variant={viewMode === "revenue" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("revenue")}
          >
            По выручке
          </Button>
        </div>

        {/* Chart Type */}
        <div className="flex gap-1">
          <Button
            variant={chartType === "bar" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setChartType("bar")}
          >
            Столбцы
          </Button>
          <Button
            variant={chartType === "pie" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setChartType("pie")}
          >
            Круговая
          </Button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "bar" ? (
            <BarChart
              data={sortedData}
              layout="vertical"
              margin={{ left: 20, right: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis
                type="number"
                stroke="#888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) =>
                  viewMode === "revenue"
                    ? `${(value / 1000).toFixed(0)}k`
                    : value.toString()
                }
              />
              <YAxis
                type="category"
                dataKey="ticketName"
                stroke="#888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={120}
                tickFormatter={(name) => shortenName(name)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey={viewMode}
                radius={[0, 4, 4, 0]}
              >
                {sortedData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <PieChart>
              <Pie
                data={sortedData as any}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey={viewMode}
                nameKey="ticketName"
                label={(props: any) =>
                  `${shortenName(props.ticketName || "", 10)} (${((props.percent || 0) * 100).toFixed(0)}%)`
                }
                labelLine={false}
              >
                {sortedData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Summary Table */}
      <div className="mt-4 max-h-[150px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="text-gray-500 border-b sticky top-0 bg-white">
            <tr>
              <th className="text-left py-2 font-medium">Билет</th>
              <th className="text-right py-2 font-medium">Продано</th>
              <th className="text-right py-2 font-medium">Выручка</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((ticket, index) => (
              <tr key={ticket.ticketId} className="border-b border-gray-100">
                <td className="py-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="truncate">{ticket.ticketName}</span>
                  </div>
                </td>
                <td className="text-right py-2 font-medium">{ticket.count}</td>
                <td className="text-right py-2 text-green-600">
                  {ticket.revenue.toLocaleString("ru-RU")} MDL
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
