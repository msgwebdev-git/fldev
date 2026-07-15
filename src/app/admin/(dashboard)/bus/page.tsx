import Link from "next/link";
import { Package } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { BusDatesManager, type AdminBusDate } from "./BusDatesManager";
import { BusVisibilityToggle } from "./BusVisibilityToggle";
import { BusDepartureAddress } from "./BusDepartureAddress";

export const dynamic = "force-dynamic";

export default async function BusAdminPage() {
  const supabase = await createClient();
  const [{ data }, { data: setting }, { data: addressSetting }] = await Promise.all([
    supabase.from("bus_dates").select("*").order("sort_order", { ascending: true }),
    supabase.from("site_settings").select("value").eq("key", "bus_enabled").maybeSingle(),
    supabase.from("site_settings").select("value").eq("key", "bus_departure_address").maybeSingle(),
  ]);
  const busEnabled = setting?.value !== "false";
  const departureAddress = addressSetting?.value ?? "";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Автобус — даты</h1>
          <p className="text-gray-500 mt-1">Рейсы, цена round-trip и вместимость</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/bus/orders">
            <Package className="mr-2 h-4 w-4" />
            Заказы
          </Link>
        </Button>
      </div>

      <BusVisibilityToggle initialEnabled={busEnabled} />

      <BusDepartureAddress initialAddress={departureAddress} />

      <BusDatesManager dates={(data ?? []) as AdminBusDate[]} />
    </div>
  );
}
