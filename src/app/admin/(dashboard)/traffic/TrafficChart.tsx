"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface DailyPoint {
  day: string;
  visits: number;
  sessions: number;
}

export function TrafficChart({ data }: { data: DailyPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center text-gray-400 text-sm">
        Пока нет данных о заходах
      </div>
    );
  }

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });

  return (
    <ResponsiveContainer width="100%" height={288}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="gVisits" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gSessions" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="day" tickFormatter={fmt} fontSize={12} stroke="#9ca3af" />
        <YAxis allowDecimals={false} fontSize={12} stroke="#9ca3af" />
        <Tooltip
          labelFormatter={(d) => fmt(String(d))}
          formatter={(v: number, name: string) => [
            v,
            name === "visits" ? "Просмотры" : "Сессии",
          ]}
        />
        <Area
          type="monotone"
          dataKey="visits"
          stroke="#6366f1"
          strokeWidth={2}
          fill="url(#gVisits)"
        />
        <Area
          type="monotone"
          dataKey="sessions"
          stroke="#10b981"
          strokeWidth={2}
          fill="url(#gSessions)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
