import { createClient } from "@/lib/supabase/server";
import { MerchSettingsForm } from "./MerchSettingsForm";

export const dynamic = "force-dynamic";

export default async function MerchSettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", ["merch_shop_enabled", "merch_banner_url", "merch_banner_url_mobile", "merch_shipping_fee", "merch_free_shipping_threshold"]);

  const map = new Map((data ?? []).map((r) => [r.key as string, r.value as string | null]));
  const threshold = map.get("merch_free_shipping_threshold");

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Настройки магазина</h1>
        <p className="text-gray-500 mt-1">Баннер и параметры доставки</p>
      </div>
      <MerchSettingsForm
        initial={{
          shopEnabled: map.get("merch_shop_enabled") === "true",
          bannerUrl: map.get("merch_banner_url") || null,
          bannerUrlMobile: map.get("merch_banner_url_mobile") || null,
          shippingFee: Number(map.get("merch_shipping_fee") ?? 0) || 0,
          freeShippingThreshold: threshold && threshold !== "" ? Number(threshold) : null,
        }}
      />
    </div>
  );
}
