"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Save, Loader2, Smartphone } from "lucide-react";

interface SectionsSettingsFormProps {
  initialSettings: Record<string, string>;
}

const SECTION_TOGGLES = [
  {
    key: "show_mobile_app",
    label: "Мобильное приложение",
    description:
      "Блоки скачивания мобильного приложения на главной, странице программы и активностей",
    icon: Smartphone,
  },
];

export function SectionsSettingsForm({
  initialSettings,
}: SectionsSettingsFormProps) {
  const router = useRouter();
  const [settings, setSettings] = useState(initialSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  const handleSave = async () => {
    setIsLoading(true);
    setSavedMessage("");

    const supabase = createClient();

    try {
      const updates = Object.entries(settings).map(([key, value]) =>
        supabase.from("site_settings").update({ value }).eq("key", key)
      );

      await Promise.all(updates);

      setSavedMessage("Настройки сохранены");
      router.refresh();

      setTimeout(() => setSavedMessage(""), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setSavedMessage("Ошибка сохранения");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSetting = (key: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: prev[key] === "true" ? "false" : "true",
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Видимость секций</CardTitle>
          <CardDescription>
            Включайте и отключайте секции сайта без необходимости деплоя
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {SECTION_TOGGLES.map((toggle) => {
            const Icon = toggle.icon;
            return (
              <div
                key={toggle.key}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-2 bg-gray-100 rounded-lg">
                    <Icon className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <Label htmlFor={toggle.key} className="text-sm font-medium">
                      {toggle.label}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {toggle.description}
                    </p>
                  </div>
                </div>
                <Switch
                  id={toggle.key}
                  checked={settings[toggle.key] === "true"}
                  onCheckedChange={() => toggleSetting(toggle.key)}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex items-center justify-between">
        <div>
          {savedMessage && (
            <p
              className={`text-sm ${
                savedMessage.includes("Ошибка")
                  ? "text-destructive"
                  : "text-green-600"
              }`}
            >
              {savedMessage}
            </p>
          )}
        </div>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Сохранить
        </Button>
      </div>
    </div>
  );
}
