"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MapPin } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { setBusDepartureAddress } from "./actions";

export function BusDepartureAddress({ initialAddress }: { initialAddress: string }) {
  const router = useRouter();
  const [address, setAddress] = React.useState(initialAddress);
  const [saving, setSaving] = React.useState(false);

  const dirty = address.trim() !== initialAddress.trim();

  const handleSave = async () => {
    setSaving(true);
    const res = await setBusDepartureAddress(address);
    setSaving(false);
    if (res.ok) {
      toast.success("Адрес отправления сохранён");
      router.refresh();
    } else {
      toast.error(res.error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Место отправления из Кишинёва
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-500">
          Показывается на странице автобуса, чтобы пассажиры знали, откуда уезжает автобус. Одна точка для всех рейсов.
        </p>
        <div className="flex gap-2">
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Напр.: Gara Centrală, str. Ismail 84"
            className="flex-1"
          />
          <Button onClick={handleSave} disabled={saving || !dirty}>
            {saving ? "Сохранение…" : "Сохранить"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
