"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, Upload, X, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { setMerchSettings, type MerchSettingsInput } from "../actions";

function BannerUpload({
  label,
  hint,
  aspect,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  aspect: string;
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const [uploading, setUploading] = React.useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("productId", "banner");
      const res = await fetch("/api/admin/merch/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.url) onChange(data.url);
      else toast.error(data.error || "Ошибка загрузки");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {value ? (
        <div className={`group relative w-full overflow-hidden rounded-xl border ${aspect}`}>
          <Image src={value} alt={label} fill className="object-cover" sizes="(min-width:768px) 640px, 100vw" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
            title="Удалить"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label className={`flex ${aspect} w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 text-gray-400 hover:border-primary hover:text-primary`}>
          {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
          <span className="text-sm">Загрузить</span>
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
      )}
      <p className="text-xs text-gray-400">{hint}</p>
    </div>
  );
}

export function MerchSettingsForm({ initial }: { initial: MerchSettingsInput }) {
  const router = useRouter();
  const [form, setForm] = React.useState<MerchSettingsInput>(initial);
  const [saving, setSaving] = React.useState(false);

  const set = <K extends keyof MerchSettingsInput>(k: K, v: MerchSettingsInput[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const save = async () => {
    setSaving(true);
    const res = await setMerchSettings(form);
    setSaving(false);
    if (res.ok) {
      toast.success("Настройки сохранены");
      router.refresh();
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Видимость</CardTitle>
        </CardHeader>
        <CardContent>
          <label className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-gray-900">Показывать магазин на сайте</p>
              <p className="text-sm text-gray-500">
                Когда выключено — страница /shop недоступна (404) и ссылка скрыта из меню.
              </p>
            </div>
            <Switch checked={form.shopEnabled} onCheckedChange={(v) => set("shopEnabled", v)} />
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Баннер магазина</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <BannerUpload
            label="Баннер (десктоп)"
            hint="Широкое фото, реком. ~2000×760. Показывается на /shop."
            aspect="aspect-[21/8]"
            value={form.bannerUrl}
            onChange={(url) => set("bannerUrl", url)}
          />
          <BannerUpload
            label="Баннер (мобильный) — необязательно"
            hint="Если пусто — на телефоне покажется десктопный баннер."
            aspect="aspect-[16/10]"
            value={form.bannerUrlMobile}
            onChange={(url) => set("bannerUrlMobile", url)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Доставка</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Стоимость доставки (MDL)</Label>
            <Input type="number" value={form.shippingFee} onChange={(e) => set("shippingFee", Number(e.target.value))} />
          </div>
          <div className="space-y-1.5">
            <Label>Бесплатно от суммы (пусто = выкл.)</Label>
            <Input
              type="number"
              value={form.freeShippingThreshold ?? ""}
              onChange={(e) => set("freeShippingThreshold", e.target.value ? Number(e.target.value) : null)}
              placeholder="напр. 800"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Сохранить
        </Button>
      </div>
    </div>
  );
}
