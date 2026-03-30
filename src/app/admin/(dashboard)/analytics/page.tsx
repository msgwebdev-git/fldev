import { createClient } from "@/lib/supabase/server";
import { SalesChart } from "./SalesChart";
import { PopularTicketsChart } from "./PopularTicketsChart";
import { AnalyticsStats } from "./AnalyticsStats";
import { CampingStats } from "./CampingStats";
import { PromoStats } from "./PromoStats";
import { FreeTicketsStats } from "./FreeTicketsStats";

export const dynamic = "force-dynamic";

interface DailySales {
  date: string;
  orders: number;
  revenue: number;
  tickets: number;
}

interface TicketStats {
  ticketId: string;
  ticketName: string;
  count: number;
  revenue: number;
}

async function getSalesData(): Promise<{
  daily: DailySales[];
  ticketStats: TicketStats[];
  totals: {
    totalOrders: number;
    totalRevenue: number;
    totalTickets: number;
    avgOrderValue: number;
  };
}> {
  const supabase = await createClient();

  // Get all paid orders (excluding invitations)
  const { data: orders } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      total_amount,
      discount_amount,
      created_at,
      is_invitation
    `)
    .eq("status", "paid")
    .eq("is_invitation", false)
    .order("created_at", { ascending: true });

  // Get order IDs of paid orders (not invitations)
  const paidOrderIds = orders?.map((o) => o.id) || [];

  // Get order items only from paid orders
  const { data: orderItems } = paidOrderIds.length > 0
    ? await supabase
        .from("order_items")
        .select(`
          id,
          order_id,
          ticket_id,
          unit_price,
          quantity,
          is_invitation,
          ticket:tickets (
            id,
            name_ru
          )
        `)
        .in("order_id", paidOrderIds)
        .eq("is_invitation", false)
    : { data: [] };

  // Process daily sales
  const dailyMap = new Map<string, DailySales>();

  orders?.forEach((order) => {
    const date = new Date(order.created_at).toISOString().split("T")[0];
    const revenue = Number(order.total_amount) - Number(order.discount_amount || 0);

    if (!dailyMap.has(date)) {
      dailyMap.set(date, { date, orders: 0, revenue: 0, tickets: 0 });
    }

    const day = dailyMap.get(date)!;
    day.orders += 1;
    day.revenue += revenue;
  });

  // Count tickets per day
  const orderIdToDate = new Map<string, string>();
  orders?.forEach((order) => {
    const date = new Date(order.created_at).toISOString().split("T")[0];
    orderIdToDate.set(order.id, date);
  });

  orderItems?.forEach((item) => {
    const date = orderIdToDate.get(item.order_id);
    if (date && dailyMap.has(date)) {
      dailyMap.get(date)!.tickets += item.quantity;
    }
  });

  // Process ticket stats
  const ticketMap = new Map<string, TicketStats>();

  orderItems?.forEach((item) => {
    const ticketId = item.ticket_id;
    // @ts-ignore
    const ticketName = item.ticket?.name_ru || "Неизвестный билет";

    if (!ticketMap.has(ticketId)) {
      ticketMap.set(ticketId, { ticketId, ticketName, count: 0, revenue: 0 });
    }

    const stats = ticketMap.get(ticketId)!;
    stats.count += item.quantity;
    stats.revenue += Number(item.unit_price) * item.quantity;
  });

  // Calculate totals
  const totalOrders = orders?.length || 0;
  const totalRevenue = orders?.reduce(
    (sum, o) => sum + (Number(o.total_amount) - Number(o.discount_amount || 0)),
    0
  ) || 0;
  const totalTickets = orderItems?.reduce((sum, i) => sum + i.quantity, 0) || 0;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Sort and format data
  const daily = Array.from(dailyMap.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const ticketStats = Array.from(ticketMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    daily,
    ticketStats,
    totals: {
      totalOrders,
      totalRevenue,
      totalTickets,
      avgOrderValue,
    },
  };
}

interface CampingOptionStats {
  optionName: string;
  optionNameRu: string;
  ticketType: string;
  count: number;
}

async function getCampingData(): Promise<{
  options: CampingOptionStats[];
  totalCamping: number;
  withOption: number;
  withoutOption: number;
}> {
  const supabase = await createClient();

  // Get all camping-related order items from paid orders
  const { data: campingItems } = await supabase
    .from("order_items")
    .select(`
      id,
      ticket_option_id,
      quantity,
      ticket:tickets!inner (name, name_ru),
      option:ticket_options (name, name_ro, name_ru),
      order:orders!inner (status, is_invitation)
    `)
    .or("ticket_id.eq.dc85e3de-1b17-4c86-b4b5-a6f057ffef63,ticket_id.eq.d5da39b7-8afc-441c-be6f-36be47e396dc")
    .eq("orders.status", "paid");

  if (!campingItems || campingItems.length === 0) {
    return { options: [], totalCamping: 0, withOption: 0, withoutOption: 0 };
  }

  const totalCamping = campingItems.reduce((s, i) => s + i.quantity, 0);
  const withOption = campingItems.filter((i) => i.ticket_option_id).reduce((s, i) => s + i.quantity, 0);
  const withoutOption = totalCamping - withOption;

  // Group by option
  const optionMap = new Map<string, CampingOptionStats>();

  for (const item of campingItems) {
    if (!item.ticket_option_id || !item.option) continue;
    const opt = item.option as any;
    const ticket = item.ticket as any;
    const key = `${opt.name}_${ticket.name}`;

    if (!optionMap.has(key)) {
      optionMap.set(key, {
        optionName: opt.name_ro || opt.name,
        optionNameRu: opt.name_ru || opt.name,
        ticketType: ticket.name_ru || ticket.name,
        count: 0,
      });
    }
    optionMap.get(key)!.count += item.quantity;
  }

  return {
    options: Array.from(optionMap.values()).sort((a, b) => b.count - a.count),
    totalCamping,
    withOption,
    withoutOption,
  };
}

interface PromoCodeData {
  code: string;
  discountPercent: number | null;
  discountAmount: number | null;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
  validUntil: string | null;
  ordersCount: number;
  totalDiscount: number;
  totalRevenue: number;
}

async function getPromoData(): Promise<{
  promoCodes: PromoCodeData[];
  totalDiscountGiven: number;
  totalOrdersWithPromo: number;
}> {
  const supabase = await createClient();

  // Get all promo codes
  const { data: codes } = await supabase
    .from("promo_codes")
    .select("*")
    .order("used_count", { ascending: false });

  // Get paid orders with promo codes
  const { data: promoOrders } = await supabase
    .from("orders")
    .select("promo_code, total_amount, discount_amount, status")
    .eq("status", "paid")
    .not("promo_code", "is", null);

  // Build stats per promo code
  const ordersByCode = new Map<string, { count: number; discount: number; revenue: number }>();

  for (const order of promoOrders || []) {
    const code = order.promo_code;
    if (!code) continue;
    if (!ordersByCode.has(code)) {
      ordersByCode.set(code, { count: 0, discount: 0, revenue: 0 });
    }
    const stats = ordersByCode.get(code)!;
    stats.count++;
    stats.discount += Number(order.discount_amount || 0);
    stats.revenue += Number(order.total_amount) - Number(order.discount_amount || 0);
  }

  const promoCodes: PromoCodeData[] = (codes || []).map((c) => {
    const orderStats = ordersByCode.get(c.code) || { count: 0, discount: 0, revenue: 0 };
    return {
      code: c.code,
      discountPercent: c.discount_percent,
      discountAmount: c.discount_amount,
      usageLimit: c.usage_limit,
      usedCount: c.used_count,
      isActive: c.is_active,
      validUntil: c.valid_until,
      ordersCount: orderStats.count,
      totalDiscount: orderStats.discount,
      totalRevenue: orderStats.revenue,
    };
  });

  const totalDiscountGiven = promoCodes.reduce((s, p) => s + p.totalDiscount, 0);
  const totalOrdersWithPromo = promoOrders?.length || 0;

  return { promoCodes, totalDiscountGiven, totalOrdersWithPromo };
}

interface FreeTicketData {
  type: "invitation" | "giveaway" | "manual" | "offline";
  label: string;
  orders: number;
  tickets: number;
}

async function getFreeTicketsData(): Promise<FreeTicketData[]> {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      is_invitation,
      total_amount,
      items:order_items (quantity)
    `)
    .eq("status", "paid")
    .or("is_invitation.eq.true,order_number.like.MAN%,order_number.like.OFF%");

  if (!orders || orders.length === 0) return [];

  const stats = new Map<string, FreeTicketData>();
  stats.set("invitation", { type: "invitation", label: "Приглашения", orders: 0, tickets: 0 });
  stats.set("giveaway", { type: "giveaway", label: "Розыгрыши", orders: 0, tickets: 0 });
  stats.set("manual", { type: "manual", label: "Вручную", orders: 0, tickets: 0 });
  stats.set("offline", { type: "offline", label: "Оффлайн", orders: 0, tickets: 0 });

  for (const order of orders) {
    const num = order.order_number || "";
    let type: string;

    if (num.startsWith("GW")) type = "giveaway";
    else if (num.startsWith("MAN")) type = "manual";
    else if (num.startsWith("OFF")) type = "offline";
    else if (num.startsWith("INV") || order.is_invitation) type = "invitation";
    else continue;

    const entry = stats.get(type)!;
    entry.orders++;
    entry.tickets += (order.items || []).reduce((s: number, i: any) => s + (i.quantity || 1), 0);
  }

  return Array.from(stats.values()).filter((s) => s.orders > 0);
}

export default async function AnalyticsPage() {
  const [{ daily, ticketStats, totals }, campingData, promoData, freeTicketsData] = await Promise.all([
    getSalesData(),
    getCampingData(),
    getPromoData(),
    getFreeTicketsData(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Аналитика</h1>
        <p className="text-gray-500 mt-1">Статистика продаж и популярность билетов</p>
      </div>

      {/* Stats Cards */}
      <AnalyticsStats totals={totals} />

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Продажи по дням
          </h2>
          <SalesChart data={daily} />
        </div>

        {/* Popular Tickets */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Популярные билеты
          </h2>
          <PopularTicketsChart data={ticketStats} />
        </div>
      </div>

      {/* Free Tickets, Promo Codes, Camping */}
      {freeTicketsData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Бесплатные и ручные билеты
          </h2>
          <FreeTicketsStats data={freeTicketsData} />
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Promo Codes */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Промокоды
          </h2>
          <PromoStats data={promoData} />
        </div>

        {/* Camping Options */}
        {campingData.totalCamping > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Camping опции
            </h2>
            <CampingStats data={campingData} />
          </div>
        )}
      </div>
    </div>
  );
}
