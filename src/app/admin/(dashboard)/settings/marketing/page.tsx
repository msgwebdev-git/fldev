import { createClient } from "@/lib/supabase/server";
import { MarketingSettingsForm } from "./MarketingSettingsForm";

export default async function MarketingSettingsPage() {
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from("site_settings")
    .select("*")
    .eq("category", "marketing");

  // Convert to key-value object
  const settingsMap: Record<string, string> = {};
  settings?.forEach((setting) => {
    settingsMap[setting.key] = setting.value || "";
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Маркетинг</h1>
        <p className="text-gray-500 mt-1">
          Настройка аналитики и маркетинговых скриптов
        </p>
      </div>

      <MarketingSettingsForm initialSettings={settingsMap} />
    </div>
  );
}
