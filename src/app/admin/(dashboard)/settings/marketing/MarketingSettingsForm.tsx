"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Save, Loader2, ExternalLink } from "lucide-react";

interface MarketingSettingsFormProps {
  initialSettings: Record<string, string>;
}

const ANALYTICS_FIELDS = [
  {
    key: "ga4_id",
    label: "Google Analytics 4",
    placeholder: "G-XXXXXXXXXX",
    description: "Measurement ID из Google Analytics 4",
    docsUrl: "https://support.google.com/analytics/answer/9539598",
  },
  {
    key: "gtm_id",
    label: "Google Tag Manager",
    placeholder: "GTM-XXXXXXX",
    description: "Container ID из Google Tag Manager",
    docsUrl: "https://support.google.com/tagmanager/answer/6103696",
  },
  {
    key: "facebook_pixel_id",
    label: "Facebook/Meta Pixel",
    placeholder: "1234567890123456",
    description: "Pixel ID из Meta Business Suite",
    docsUrl: "https://www.facebook.com/business/help/952192354843755",
  },
  {
    key: "tiktok_pixel_id",
    label: "TikTok Pixel",
    placeholder: "XXXXXXXXXXXXXXXXXX",
    description: "Pixel ID из TikTok Ads Manager",
    docsUrl: "https://ads.tiktok.com/help/article/get-started-pixel",
  },
  {
    key: "yandex_metrica_id",
    label: "Yandex Metrica",
    placeholder: "12345678",
    description: "ID счётчика из Яндекс Метрики",
    docsUrl: "https://yandex.ru/support/metrica/general/creating-counter.html",
  },
];

export function MarketingSettingsForm({
  initialSettings,
}: MarketingSettingsFormProps) {
  const router = useRouter();
  const [settings, setSettings] = useState(initialSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  const handleSave = async () => {
    setIsLoading(true);
    setSavedMessage("");

    const supabase = createClient();

    try {
      // Update each setting
      const updates = Object.entries(settings).map(([key, value]) =>
        supabase
          .from("site_settings")
          .update({ value })
          .eq("key", key)
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

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Analytics IDs */}
      <Card>
        <CardHeader>
          <CardTitle>Аналитика и пиксели</CardTitle>
          <CardDescription>
            Введите ID для автоматического подключения сервисов аналитики
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {ANALYTICS_FIELDS.map((field) => (
            <div key={field.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={field.key}>{field.label}</Label>
                <a
                  href={field.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                >
                  Документация
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <Input
                id={field.key}
                value={settings[field.key] || ""}
                onChange={(e) => updateSetting(field.key, e.target.value)}
                placeholder={field.placeholder}
              />
              <p className="text-xs text-muted-foreground">{field.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Custom Scripts */}
      <Card>
        <CardHeader>
          <CardTitle>Пользовательские скрипты</CardTitle>
          <CardDescription>
            Добавьте собственные скрипты для интеграции сторонних сервисов
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="custom_head_scripts">
              Скрипты в &lt;head&gt;
            </Label>
            <Textarea
              id="custom_head_scripts"
              value={settings.custom_head_scripts || ""}
              onChange={(e) =>
                updateSetting("custom_head_scripts", e.target.value)
              }
              placeholder="<script>...</script>"
              rows={6}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Эти скрипты будут добавлены в секцию &lt;head&gt; перед закрывающим тегом
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="custom_body_scripts">
              Скрипты в &lt;body&gt;
            </Label>
            <Textarea
              id="custom_body_scripts"
              value={settings.custom_body_scripts || ""}
              onChange={(e) =>
                updateSetting("custom_body_scripts", e.target.value)
              }
              placeholder="<script>...</script>"
              rows={6}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Эти скрипты будут добавлены в конец &lt;body&gt; перед закрывающим тегом
            </p>
          </div>
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
