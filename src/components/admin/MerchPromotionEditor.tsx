"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { savePromotion, type PromotionInput } from "@/app/admin/(dashboard)/merch/actions";

export interface TicketOption {
  id: string;
  name: string;
}

export interface MerchPromotionEditorProps {
  tickets: TicketOption[];
  initial?: PromotionInput;
  isEdit?: boolean;
}

const EMPTY: PromotionInput = {
  name: "",
  isActive: true,
  minOrderAmount: 800,
  amountBasis: "subtotal",
  rewardTicketId: "",
  rewardOptionId: null,
  rewardQuantity: 1,
  maxRedemptions: null,
  startsAt: null,
  endsAt: null,
};

// ISO <-> yyyy-mm-dd for <input type=date>
function toDateInput(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export function MerchPromotionEditor({ tickets, initial, isEdit = false }: MerchPromotionEditorProps) {
  const router = useRouter();
  const [form, setForm] = React.useState<PromotionInput>(initial ?? EMPTY);
  const [saving, setSaving] = React.useState(false);

  const set = <K extends keyof PromotionInput>(key: K, value: PromotionInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error("Укажите название");
    if (!form.rewardTicketId) return toast.error("Выберите билет-подарок");
    if (form.minOrderAmount <= 0) return toast.error("Укажите порог заказа");

    setSaving(true);
    const res = await savePromotion(form);
    setSaving(false);
    if (res.ok) {
      toast.success("Акция сохранена");
      router.push("/admin/merch/promotions");
      router.refresh();
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? "Редактировать акцию" : "Новая акция"}</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push("/admin/merch/promotions")}>Отмена</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Сохранить
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Условия</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Название</Label>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Merch + вход на фестиваль" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Порог заказа (MDL)</Label>
              <Input type="number" value={form.minOrderAmount} onChange={(e) => set("minOrderAmount", Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>Считать от</Label>
              <Select value={form.amountBasis} onValueChange={(v) => set("amountBasis", v as "subtotal" | "total")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="subtotal">Суммы товаров</SelectItem>
                  <SelectItem value="total">Итоговой суммы</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Подарок</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Билет-подарок</Label>
              <Select value={form.rewardTicketId} onValueChange={(v) => set("rewardTicketId", v)}>
                <SelectTrigger><SelectValue placeholder="Выберите билет" /></SelectTrigger>
                <SelectContent>
                  {tickets.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Количество билетов</Label>
              <Input type="number" min={1} value={form.rewardQuantity} onChange={(e) => set("rewardQuantity", Number(e.target.value))} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Ограничения</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Лимит выдач (пусто = без лимита)</Label>
            <Input
              type="number"
              value={form.maxRedemptions ?? ""}
              onChange={(e) => set("maxRedemptions", e.target.value ? Number(e.target.value) : null)}
              placeholder="напр. 100"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Начало (необязательно)</Label>
              <Input
                type="date"
                value={toDateInput(form.startsAt)}
                onChange={(e) => set("startsAt", e.target.value ? `${e.target.value}T00:00:00` : null)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Окончание (необязательно)</Label>
              <Input
                type="date"
                value={toDateInput(form.endsAt)}
                onChange={(e) => set("endsAt", e.target.value ? `${e.target.value}T23:59:59` : null)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Switch checked={form.isActive} onCheckedChange={(v) => set("isActive", v)} />
            <Label>Активна</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
