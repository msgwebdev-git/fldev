"use client";

import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DailySales {
  date: string;
  orders: number;
  revenue: number;
  tickets: number;
}

interface SalesChartProps {
  data: DailySales[];
}

type ViewMode = "revenue" | "orders" | "tickets";
type ChartType = "area" | "bar";
type Period = "7d" | "30d" | "90d" | "1y" | "all";

const viewModeLabels: Record<ViewMode, string> = {
  revenue: "Выручка",
  orders: "Заказы",
  tickets: "Билеты",
};

const viewModeColors: Record<ViewMode, string> = {
  revenue: "#22c55e",
  orders: "#3b82f6",
  tickets: "#a855f7",
};

const periodLabels: Record<Period, string> = {
  "7d": "7 дней",
  "30d": "30 дней",
  "90d": "3 месяца",
  "1y": "1 год",
  "all": "Все время",
};

// Parse "YYYY-MM-DD" as LOCAL midnight — new Date("YYYY-MM-DD") is UTC
// midnight and mixing it with local getDay()/getDate() shifts buckets.
function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function localKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function formatTooltipDate(dateStr: string) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="font-medium text-gray-900 mb-2">
          {formatTooltipDate(label)}
        </p>
        <div className="space-y-1 text-sm">
          <p className="text-green-600">
            Выручка: <strong>{data.revenue.toLocaleString("ru-RU")} MDL</strong>
          </p>
          <p className="text-blue-600">
            Заказов: <strong>{data.orders}</strong>
          </p>
          <p className="text-purple-600">
            Билетов: <strong>{data.tickets}</strong>
          </p>
        </div>
      </div>
    );
  }
  return null;
}

export function SalesChart({ data }: SalesChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("revenue");
  const [chartType, setChartType] = useState<ChartType>("area");
  const [period, setPeriod] = useState<Period>("30d");

  // Filter and aggregate data based on period.
  // Grouping follows the SELECTED RANGE (7/30 days = daily, 3 months = weekly,
  // 1y/all = monthly) — never the number of sale-days, which used to collapse
  // "30 дней" into 5 weekly points. Daily views are zero-filled so days
  // without sales show as real dips instead of being skipped.
  const { chartData, groupingLabel } = useMemo(() => {
    if (period === "7d" || period === "30d") {
      const daysBack = period === "7d" ? 7 : 30;
      const byDate = new Map(data.map((d) => [d.date, d]));
      const days: DailySales[] = [];
      const now = new Date();
      for (let i = daysBack - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const key = localKey(d);
        days.push(byDate.get(key) ?? { date: key, orders: 0, revenue: 0, tickets: 0 });
      }
      return { chartData: days, groupingLabel: "по дням" };
    }

    if (period === "90d") {
      const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const filtered = data.filter((d) => parseLocalDate(d.date) >= cutoff);
      return { chartData: aggregateByWeek(filtered), groupingLabel: "по неделям" };
    }

    const filtered =
      period === "1y"
        ? data.filter((d) => parseLocalDate(d.date) >= new Date(Date.now() - 365 * 24 * 60 * 60 * 1000))
        : data;
    return { chartData: aggregateByMonth(filtered), groupingLabel: "по месяцам" };
  }, [data, period]);

  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-gray-500">
        <p>Нет данных о продажах</p>
      </div>
    );
  }

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        {/* Period Selector */}
        <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(periodLabels) as Period[]).map((p) => (
              <SelectItem key={p} value={p}>
                {periodLabels[p]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* View Mode */}
        <div className="flex gap-1">
          {(Object.keys(viewModeLabels) as ViewMode[]).map((mode) => (
            <Button
              key={mode}
              variant={viewMode === mode ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode(mode)}
            >
              {viewModeLabels[mode]}
            </Button>
          ))}
        </div>

        {/* Chart Type */}
        <div className="flex gap-1">
          <Button
            variant={chartType === "area" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setChartType("area")}
          >
            Область
          </Button>
          <Button
            variant={chartType === "bar" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setChartType("bar")}
          >
            Столбцы
          </Button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "area" ? (
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`gradient-${viewMode}`} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={viewModeColors[viewMode]}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={viewModeColors[viewMode]}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                stroke="#888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
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
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="linear"
                dataKey={viewMode}
                stroke={viewModeColors[viewMode]}
                strokeWidth={2}
                fill={`url(#gradient-${viewMode})`}
              />
            </AreaChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                stroke="#888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
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
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey={viewMode}
                fill={viewModeColors[viewMode]}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 text-center text-sm text-gray-500">
        Данные {groupingLabel} ({chartData.length} точек)
      </div>
    </div>
  );
}

// Helper function to aggregate data by week
function aggregateByWeek(data: DailySales[]): DailySales[] {
  const weekMap = new Map<string, DailySales>();

  data.forEach((day) => {
    const date = parseLocalDate(day.date);
    // Get Monday of the week (all-local math — no UTC/local mixing)
    const dayOfWeek = date.getDay();
    const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(date);
    monday.setDate(diff);
    const weekKey = localKey(monday);

    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, { date: weekKey, orders: 0, revenue: 0, tickets: 0 });
    }

    const week = weekMap.get(weekKey)!;
    week.orders += day.orders;
    week.revenue += day.revenue;
    week.tickets += day.tickets;
  });

  return Array.from(weekMap.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

// Helper function to aggregate data by month
function aggregateByMonth(data: DailySales[]): DailySales[] {
  const monthMap = new Map<string, DailySales>();

  data.forEach((day) => {
    const date = parseLocalDate(day.date);
    // First day of the month
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;

    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, { date: monthKey, orders: 0, revenue: 0, tickets: 0 });
    }

    const month = monthMap.get(monthKey)!;
    month.orders += day.orders;
    month.revenue += day.revenue;
    month.tickets += day.tickets;
  });

  return Array.from(monthMap.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}
