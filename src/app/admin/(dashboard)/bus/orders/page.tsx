import Link from "next/link";
import { ArrowLeft, Package, ArrowRight, RefreshCw, Users, Baby } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface OrderRow {
  id: string;
  order_number: string;
  status: string;
  passengers: number;
  children: number;
  total_amount: number;
  customer_name: string;
  customer_email: string;
  created_at: string;
  bus_tickets: { checked_in_at: string | null }[] | null;
}

interface DateRow {
  id: string;
  travel_date: string;
  capacity: number;
  currency: string | null;
}

// One ticket of a PAID order, for per-date aggregation.
interface PaidTicket {
  travel_date: string;
  direction: "tur" | "retur";
  checked_in_at: string | null;
  unit_price: number | null;
  bus_orders: { id: string; children: number } | null;
}

const STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: "Ожидает оплаты", cls: "bg-amber-50 text-amber-700" },
  paid: { label: "Оплачен", cls: "bg-green-50 text-green-700" },
  failed: { label: "Не оплачен", cls: "bg-red-50 text-red-600" },
  refunded: { label: "Возврат", cls: "bg-gray-100 text-gray-600" },
  cancelled: { label: "Отменён", cls: "bg-gray-100 text-gray-500" },
};

function fmtDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return {
    day: d.toLocaleDateString("ru-RU", { day: "numeric", month: "long" }),
    weekday: d.toLocaleDateString("ru-RU", { weekday: "long" }),
  };
}

interface DateStats {
  adults: number;        // seats sold (paying) = one tur ticket per passenger
  children: number;      // lap infants, no seat — summed per distinct paid order
  revenue: number;
  boardedTur: number;
  totalTur: number;
  boardedRetur: number;
  totalRetur: number;
  currency: string;
  capacity: number;
}

export default async function BusOrdersPage() {
  const supabase = await createClient();

  const [ordersRes, datesRes, ticketsRes] = await Promise.all([
    supabase
      .from("bus_orders")
      .select("id, order_number, status, passengers, children, total_amount, customer_name, customer_email, created_at, bus_tickets(checked_in_at)")
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("bus_dates")
      .select("id, travel_date, capacity, currency")
      .order("travel_date", { ascending: true }),
    // All tickets of PAID orders — the source of truth for per-date seat sales.
    supabase
      .from("bus_tickets")
      .select("travel_date, direction, checked_in_at, unit_price, bus_orders!inner(id, children, status)")
      .eq("bus_orders.status", "paid"),
  ]);

  const orders = (ordersRes.data ?? []) as OrderRow[];
  const dates = (datesRes.data ?? []) as DateRow[];
  const tickets = (ticketsRes.data ?? []) as unknown as PaidTicket[];

  const paid = orders.filter((o) => o.status === "paid");
  const totalRevenue = paid.reduce((s, o) => s + Number(o.total_amount), 0);

  // ── Per-date aggregation from PAID tickets ──
  const byDate = new Map<string, DateStats>();
  // Track children per (date → distinct order) so a 2-date order isn't double-summed within a date.
  const childrenByDateOrder = new Map<string, Map<string, number>>();

  const ensure = (date: string): DateStats => {
    let s = byDate.get(date);
    if (!s) {
      const d = dates.find((x) => x.travel_date === date);
      s = { adults: 0, children: 0, revenue: 0, boardedTur: 0, totalTur: 0, boardedRetur: 0, totalRetur: 0, currency: d?.currency ?? "MDL", capacity: d?.capacity ?? 0 };
      byDate.set(date, s);
      childrenByDateOrder.set(date, new Map());
    }
    return s;
  };

  for (const tk of tickets) {
    const s = ensure(tk.travel_date);
    if (tk.direction === "tur") {
      s.totalTur += 1;
      s.adults += 1; // one tur ticket == one seated passenger for this date
      s.revenue += Number(tk.unit_price ?? 0);
      if (tk.checked_in_at) s.boardedTur += 1;
    } else {
      s.totalRetur += 1;
      if (tk.checked_in_at) s.boardedRetur += 1;
    }
    // Children: record once per (date, order) — they ride every day their order covers.
    if (tk.bus_orders) {
      childrenByDateOrder.get(tk.travel_date)!.set(tk.bus_orders.id, tk.bus_orders.children ?? 0);
    }
  }
  for (const [date, m] of childrenByDateOrder) {
    let c = 0;
    for (const v of m.values()) c += v;
    byDate.get(date)!.children = c;
  }

  // Enumerate every configured date (even with 0 sales) in chronological order.
  const dateStats = dates.map((d) => ({ date: d.travel_date, ...ensure(d.travel_date) }));

  return (
    <div className="space-y-6">
      <Link href="/admin/bus" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" /> К датам
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Заказы автобуса</h1>
        <p className="text-gray-500 mt-1">Продажи по датам, посадка и заказы</p>
      </div>

      {/* ── Per-date sales dashboard ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {dateStats.map((s) => {
          const people = s.adults + s.children;
          const pct = s.capacity > 0 ? Math.min(100, Math.round((s.adults / s.capacity) * 100)) : 0;
          const { day, weekday } = fmtDate(s.date);
          const low = s.capacity > 0 && s.capacity - s.adults <= Math.max(5, s.capacity * 0.1);
          return (
            <div key={s.date} className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-lg font-bold text-gray-900">{day}</p>
                  <p className="text-xs capitalize text-gray-400">{weekday}</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">{s.revenue.toLocaleString("ru-RU")} {s.currency}</p>
              </div>

              {/* Seats sold vs capacity */}
              <div className="mt-4">
                <div className="flex items-end justify-between">
                  <span className="flex items-center gap-1.5 text-sm text-gray-500"><Users className="h-4 w-4" /> Продано мест</span>
                  <span className="text-sm">
                    <span className="text-2xl font-bold text-gray-900">{s.adults}</span>
                    <span className="text-gray-400"> / {s.capacity || "∞"}</span>
                  </span>
                </div>
                {s.capacity > 0 && (
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div className={`h-full rounded-full ${low ? "bg-amber-500" : "bg-primary"}`} style={{ width: `${pct}%` }} />
                  </div>
                )}
              </div>

              {/* People breakdown */}
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-gray-50 py-2">
                  <p className="text-lg font-bold text-gray-900">{s.adults}</p>
                  <p className="text-[11px] text-gray-500">Взрослые</p>
                </div>
                <div className="rounded-lg bg-gray-50 py-2">
                  <p className="flex items-center justify-center gap-1 text-lg font-bold text-gray-900"><Baby className="h-3.5 w-3.5 text-gray-400" />{s.children}</p>
                  <p className="text-[11px] text-gray-500">Дети (на руках)</p>
                </div>
                <div className="rounded-lg bg-primary/5 py-2">
                  <p className="text-lg font-bold text-primary">{people}</p>
                  <p className="text-[11px] text-gray-500">Всего людей</p>
                </div>
              </div>

              {/* Boarding per direction */}
              <div className="mt-4 flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 text-sm">
                <span className="flex items-center gap-1.5 text-gray-600"><ArrowRight className="h-3.5 w-3.5 text-primary" /> Туда</span>
                <span className="font-medium text-gray-900">{s.boardedTur} / {s.totalTur}</span>
                <span className="mx-2 h-4 w-px bg-gray-200" />
                <span className="flex items-center gap-1.5 text-gray-600"><ArrowLeft className="h-3.5 w-3.5 text-primary" /> Обратно</span>
                <span className="font-medium text-gray-900">{s.boardedRetur} / {s.totalRetur}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Overall summary ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4"><p className="text-sm text-gray-500">Заказов всего</p><p className="text-2xl font-bold text-gray-900">{orders.length}</p></div>
        <div className="rounded-xl border border-gray-200 bg-white p-4"><p className="text-sm text-gray-500">Оплачено</p><p className="text-2xl font-bold text-green-600">{paid.length}</p></div>
        <div className="rounded-xl border border-gray-200 bg-white p-4"><p className="text-sm text-gray-500">Выручка</p><p className="text-2xl font-bold text-gray-900">{totalRevenue.toLocaleString("ru-RU")} MDL</p></div>
      </div>

      {/* ── Orders table ── */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Заказ</th>
              <th className="px-4 py-3 font-medium">Клиент</th>
              <th className="px-4 py-3 font-medium">Пассажиры</th>
              <th className="px-4 py-3 font-medium">Посадка</th>
              <th className="px-4 py-3 font-medium">Статус</th>
              <th className="px-4 py-3 font-medium text-right">Сумма</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-16 text-center text-gray-400"><Package className="mx-auto mb-2 h-8 w-8 text-gray-300" />Пока нет заказов</td></tr>
            ) : (
              orders.map((o) => {
                const tks = o.bus_tickets ?? [];
                const boarded = tks.filter((t) => t.checked_in_at).length;
                const st = STATUS[o.status] ?? { label: o.status, cls: "bg-gray-100 text-gray-600" };
                return (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/bus/orders/${o.id}`} className="font-mono font-medium text-gray-900 hover:text-primary">{o.order_number}</Link>
                      <p className="text-xs text-gray-400">{new Date(o.created_at).toLocaleDateString("ru-RU")}</p>
                    </td>
                    <td className="px-4 py-3"><p className="text-gray-900">{o.customer_name}</p><p className="text-xs text-gray-400">{o.customer_email}</p></td>
                    <td className="px-4 py-3 text-gray-700">
                      {o.passengers}
                      {o.children > 0 && <span className="text-gray-400"> +{o.children} дет.</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{o.status === "paid" ? `${boarded} / ${tks.length}` : "—"}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${st.cls}`}>{st.label}</span></td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">{o.total_amount} MDL</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
