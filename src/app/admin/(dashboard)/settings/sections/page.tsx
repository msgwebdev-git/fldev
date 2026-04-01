import { createClient } from "@/lib/supabase/server";
import { SectionsSettingsForm } from "./SectionsSettingsForm";

export default async function SectionsSettingsPage() {
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from("site_settings")
    .select("*")
    .eq("category", "sections");

  const settingsMap: Record<string, string> = {};
  settings?.forEach((setting) => {
    settingsMap[setting.key] = setting.value || "";
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Секции сайта</h1>
        <p className="text-gray-500 mt-1">
          Управление видимостью секций на сайте
        </p>
      </div>

      <SectionsSettingsForm initialSettings={settingsMap} />
    </div>
  );
}
