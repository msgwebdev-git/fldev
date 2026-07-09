"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { setBusEnabled } from "./actions";

export function BusVisibilityToggle({ initialEnabled }: { initialEnabled: boolean }) {
  const router = useRouter();
  const [enabled, setEnabled] = React.useState(initialEnabled);
  const [saving, setSaving] = React.useState(false);

  const handleToggle = async (next: boolean) => {
    setEnabled(next); // optimistic
    setSaving(true);
    const res = await setBusEnabled(next);
    setSaving(false);
    if (res.ok) {
      toast.success(next ? "Страница автобуса включена" : "Страница автобуса скрыта");
      router.refresh();
    } else {
      setEnabled(!next); // rollback
      toast.error(res.error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Видимость</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <label className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium text-gray-900">Показывать страницу автобуса на сайте</p>
            <p className="text-sm text-gray-500">
              Когда выключено — страница /bus недоступна (404) и ссылка скрыта из меню. Уже оплаченные заказы не затрагиваются.
            </p>
          </div>
          <Switch checked={enabled} disabled={saving} onCheckedChange={handleToggle} />
        </label>
        {!enabled && (
          <Button variant="outline" size="sm" asChild>
            <a href="/api/admin/preview?path=/ro/bus" target="_blank" rel="noopener">
              <Eye className="mr-2 h-4 w-4" />
              Предпросмотр скрытой страницы
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
