import { createClient } from "@/lib/supabase/server";
import { TrafficChart } from "./TrafficChart";

export const dynamic = "force-dynamic";

const DAYS = 30;

interface DailyRow { day: string; visits: number; sessions: number }
interface FunnelRow { event_type: string; events: number; sessions: number }
interface TicketRow { ticket_name: string; adds: number; qty: number }
interface SourceRow { source: string; campaign: string; sessions: number; purchases: number }
interface LineupRow { artist: string; clicks: number }
interface OverviewRow { pageviews: number; sessions: number; visitors: number }
interface PaidOrderRow {
  utm_source: string | null;
  utm_campaign: string | null;
  total_amount: number;
  discount_amount: number | null;
}

async function getTrafficData() {
  const supabase = await createClient();
  const since = new Date(Date.now() - DAYS * 24 * 60 * 60 * 1000).toISOString();

  const [daily, funnel, tickets, sources, lineup, overview, paidOrders] = await Promise.all([
    supabase.rpc("analytics_daily", { days_back: DAYS }),
    supabase.rpc("analytics_funnel", { days_back: DAYS }),
    supabase.rpc("analytics_top_tickets", { days_back: DAYS }),
    supabase.rpc("analytics_sources", { days_back: DAYS }),
    supabase.rpc("analytics_top_lineup", { days_back: DAYS }),
    supabase.rpc("analytics_overview", { days_back: DAYS }),
    // Ground truth: PAID orders (sales only) — immune to ad-blockers dropping
    // client-side purchase events.
    supabase
      .from("orders")
      .select("utm_source, utm_campaign, total_amount, discount_amount")
      .eq("status", "paid")
      .in("source", ["online", "offline", "manual", "app"])
      .gte("created_at", since),
  ]);

  return {
    daily: (daily.data as DailyRow[]) || [],
    funnel: (funnel.data as FunnelRow[]) || [],
    tickets: (tickets.data as TicketRow[]) || [],
    sources: (sources.data as SourceRow[]) || [],
    lineup: (lineup.data as LineupRow[]) || [],
    overview: ((overview.data as OverviewRow[]) || [])[0] ?? { pageviews: 0, sessions: 0, visitors: 0 },
    paidOrders: (paidOrders.data as PaidOrderRow[]) || [],
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
  const { daily, funnel, tickets, sources, lineup, overview, paidOrders } = await getTrafficData();

  const eventsByType = new Map(funnel.map((f) => [f.event_type, f]));
  const sessionsFor = (key: string) => eventsByType.get(key)?.sessions ?? 0;
  const eventsFor = (key: string) => eventsByType.get(key)?.events ?? 0;

  const totalVisits = Number(overview.pageviews);
  // TRUE distinct sessions over the window — summing per-day distincts would
  // count a visitor active on 3 days as 3 sessions and deflate conversion.
  const totalSessions = Number(overview.sessions);
  const totalAddToCart = eventsFor("add_to_cart");
  // Purchases = PAID orders from the DB, not client-side events
  const totalPurchases = paidOrders.length;
  const conversion = totalSessions > 0 ? (totalPurchases / totalSessions) * 100 : 0;

  const funnelTop = sessionsFor("page_view") || 1;

  // Merge behavioural sessions (analytics) with real paid orders + revenue
  // per source/campaign. Orders created before UTM tracking went live all
  // fall under "direct".
  const sourceKey = (s: string | null, c: string | null) => `${s || "direct"}|${c || "—"}`;
  const orderAgg = new Map<string, { orders: number; revenue: number }>();
  for (const o of paidOrders) {
    const key = sourceKey(o.utm_source, o.utm_campaign);
    const agg = orderAgg.get(key) ?? { orders: 0, revenue: 0 };
    agg.orders += 1;
    agg.revenue += Number(o.total_amount) - Number(o.discount_amount || 0);
    orderAgg.set(key, agg);
  }
  const sourceRows = sources.map((s) => {
    const agg = orderAgg.get(`${s.source}|${s.campaign}`);
    orderAgg.delete(`${s.source}|${s.campaign}`);
    return { ...s, paidOrders: agg?.orders ?? 0, revenue: agg?.revenue ?? 0 };
  });
  // Sources that produced orders but had no tracked sessions (e.g. events pruned)
  for (const [key, agg] of orderAgg) {
    const [source, campaign] = key.split("|");
    sourceRows.push({ source, campaign, sessions: 0, purchases: 0, paidOrders: agg.orders, revenue: agg.revenue });
  }

  const cards = [
    { label: "Просмотры (30д)", value: num(totalVisits) },
    { label: "Уникальные сессии", value: num(totalSessions) },
    { label: "Добавлений в корзину", value: num(totalAddToCart) },
    { label: "Оплаченных заказов", value: num(totalPurchases) },
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
          {sourceRows.length === 0 ? (
            <p className="text-gray-400 text-sm">Пока нет данных</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100">
                    <th className="py-2 font-medium">Источник</th>
                    <th className="py-2 font-medium">Кампания</th>
                    <th className="py-2 font-medium text-right">Сессии</th>
                    <th className="py-2 font-medium text-right">Заказы (оплата)</th>
                    <th className="py-2 font-medium text-right">Выручка</th>
                  </tr>
                </thead>
                <tbody>
                  {sourceRows.map((s, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="py-2 text-gray-800">{s.source}</td>
                      <td className="py-2 text-gray-500">{s.campaign}</td>
                      <td className="py-2 text-right text-gray-800">{num(Number(s.sessions))}</td>
                      <td className="py-2 text-right font-medium text-gray-900">{num(s.paidOrders)}</td>
                      <td className="py-2 text-right font-medium text-gray-900">
                        {s.revenue > 0 ? `${num(Math.round(s.revenue))} MDL` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-3 text-xs text-gray-400">
                Заказы и выручка — из оплаченных заказов (источник истины). UTM на заказах
                собирается с момента деплоя — старые заказы попадают в «direct».
              </p>
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
