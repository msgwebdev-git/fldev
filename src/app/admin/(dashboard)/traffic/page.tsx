import { createClient } from "@/lib/supabase/server";
import { TrafficChart } from "./TrafficChart";

export const dynamic = "force-dynamic";

const DAYS = 30;

interface DailyRow { day: string; visits: number; sessions: number }
interface FunnelRow { event_type: string; events: number; sessions: number }
interface TicketRow { ticket_name: string; adds: number; qty: number }
interface SourceRow { source: string; campaign: string; sessions: number; purchases: number }
interface LineupRow { artist: string; clicks: number }

async function getTrafficData() {
  const supabase = await createClient();

  const [daily, funnel, tickets, sources, lineup] = await Promise.all([
    supabase.rpc("analytics_daily", { days_back: DAYS }),
    supabase.rpc("analytics_funnel", { days_back: DAYS }),
    supabase.rpc("analytics_top_tickets", { days_back: DAYS }),
    supabase.rpc("analytics_sources", { days_back: DAYS }),
    supabase.rpc("analytics_top_lineup", { days_back: DAYS }),
  ]);

  return {
    daily: (daily.data as DailyRow[]) || [],
    funnel: (funnel.data as FunnelRow[]) || [],
    tickets: (tickets.data as TicketRow[]) || [],
    sources: (sources.data as SourceRow[]) || [],
    lineup: (lineup.data as LineupRow[]) || [],
  };
}

const num = (n: number) => new Intl.NumberFormat("ru-RU").format(n);

// Funnel stages in order, mapped to our event_type values.
const FUNNEL_STAGES: { key: string; label: string; color: string }[] = [
  { key: "page_view", label: "Просмотры страниц", color: "bg-indigo-500" },
  { key: "view_content", label: "Смотрели билеты", color: "bg-sky-500" },
  { key: "add_to_cart", label: "Добавили в корзину", color: "bg-emerald-500" },
  { key: "initiate_checkout", label: "Начали оформление", color: "bg-amber-500" },
  { key: "purchase", label: "Покупки", color: "bg-rose-500" },
];

export default async function TrafficPage() {
  const { daily, funnel, tickets, sources, lineup } = await getTrafficData();

  const eventsByType = new Map(funnel.map((f) => [f.event_type, f]));
  const sessionsFor = (key: string) => eventsByType.get(key)?.sessions ?? 0;
  const eventsFor = (key: string) => eventsByType.get(key)?.events ?? 0;

  const totalVisits = daily.reduce((s, d) => s + Number(d.visits), 0);
  const totalSessions = daily.reduce((s, d) => s + Number(d.sessions), 0);
  const totalAddToCart = eventsFor("add_to_cart");
  const totalPurchases = eventsFor("purchase");
  const conversion =
    totalSessions > 0 ? (sessionsFor("purchase") / totalSessions) * 100 : 0;

  const funnelTop = sessionsFor("page_view") || 1;

  const cards = [
    { label: "Просмотры (30д)", value: num(totalVisits) },
    { label: "Уникальные сессии", value: num(totalSessions) },
    { label: "Добавлений в корзину", value: num(totalAddToCart) },
    { label: "Покупок", value: num(totalPurchases) },
    { label: "Конверсия в покупку", value: `${conversion.toFixed(1)}%` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Трафик и поведение</h1>
        <p className="text-gray-500 mt-1">
          Заходы, воронка и активность на сайте за последние {DAYS} дней
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-sm text-gray-500">{c.label}</div>
            <div className="text-2xl font-semibold text-gray-900 mt-1">{c.value}</div>
          </div>
        ))}
      </div>

      {/* Traffic over time */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Заходы по дням</h2>
        <TrafficChart data={daily} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Funnel */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Воронка (по сессиям)
          </h2>
          <div className="space-y-3">
            {FUNNEL_STAGES.map((stage) => {
              const sessions = sessionsFor(stage.key);
              const pct = Math.min(100, (sessions / funnelTop) * 100);
              return (
                <div key={stage.key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{stage.label}</span>
                    <span className="font-medium text-gray-900">
                      {num(sessions)} ({pct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${stage.color} rounded-full`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top tickets added to cart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Билеты — добавления в корзину
          </h2>
          {tickets.length === 0 ? (
            <p className="text-gray-400 text-sm">Пока нет данных</p>
          ) : (
            <div className="space-y-2">
              {tickets.map((t) => {
                const max = Number(tickets[0].adds) || 1;
                const pct = (Number(t.adds) / max) * 100;
                return (
                  <div key={t.ticket_name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 truncate pr-2">{t.ticket_name}</span>
                      <span className="font-medium text-gray-900 shrink-0">
                        {num(Number(t.adds))} раз · {num(Number(t.qty))} шт
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Sources / campaigns */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Источники и кампании (UTM)
          </h2>
          {sources.length === 0 ? (
            <p className="text-gray-400 text-sm">Пока нет данных</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100">
                    <th className="py-2 font-medium">Источник</th>
                    <th className="py-2 font-medium">Кампания</th>
                    <th className="py-2 font-medium text-right">Сессии</th>
                    <th className="py-2 font-medium text-right">Покупки</th>
                  </tr>
                </thead>
                <tbody>
                  {sources.map((s, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="py-2 text-gray-800">{s.source}</td>
                      <td className="py-2 text-gray-500">{s.campaign}</td>
                      <td className="py-2 text-right text-gray-800">{num(Number(s.sessions))}</td>
                      <td className="py-2 text-right font-medium text-gray-900">
                        {num(Number(s.purchases))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Lineup clicks */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Клики по артистам (Lineup)
          </h2>
          {lineup.length === 0 ? (
            <p className="text-gray-400 text-sm">Пока нет данных</p>
          ) : (
            <div className="space-y-2">
              {lineup.map((l) => {
                const max = Number(lineup[0].clicks) || 1;
                const pct = (Number(l.clicks) / max) * 100;
                return (
                  <div key={l.artist}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 truncate pr-2">{l.artist}</span>
                      <span className="font-medium text-gray-900 shrink-0">
                        {num(Number(l.clicks))}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
