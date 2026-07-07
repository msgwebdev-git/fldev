"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateMerchFulfillment } from "@/app/admin/(dashboard)/merch/actions";

// Status options depend on how the order is fulfilled.
const PICKUP_STATUSES = [
  { value: "processing", label: "В обработке" },
  { value: "ready_for_pickup", label: "Готов к выдаче" },
  { value: "picked_up", label: "Выдан" },
];

const DELIVERY_STATUSES = [
  { value: "processing", label: "В обработке" },
  { value: "shipped", label: "Отправлен" },
  { value: "delivered", label: "Доставлен" },
];

export function FulfillmentControls({
  orderId,
  method,
  initialStatus,
  initialTracking,
}: {
  orderId: string;
  method: "pickup" | "delivery";
  initialStatus: string;
  initialTracking: string;
}) {
  const router = useRouter();
  const [status, setStatus] = React.useState(initialStatus);
  const [tracking, setTracking] = React.useState(initialTracking);
  const [saving, setSaving] = React.useState(false);

  const options = method === "delivery" ? DELIVERY_STATUSES : PICKUP_STATUSES;

  const save = async () => {
    setSaving(true);
    const res = await updateMerchFulfillment(orderId, status, method === "delivery" ? tracking : undefined);
    setSaving(false);
    if (res.ok) {
      toast.success("Статус обновлён");
      router.refresh();
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
      <h2 className="font-semibold text-gray-900">Статус выполнения</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Статус</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {options.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {method === "delivery" && (
          <div className="space-y-1.5">
            <Label>Трек-номер</Label>
            <Input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="—" />
          </div>
        )}
      </div>
      <Button onClick={save} disabled={saving}>
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Сохранить
      </Button>
    </div>
  );
}
