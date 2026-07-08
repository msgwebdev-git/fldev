"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Loader2, Bus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { saveBusDate, toggleBusDate, deleteBusDate, type BusDateInput } from "./actions";

export interface AdminBusDate {
  id: string;
  travel_date: string;
  price: number;
  currency: string;
  capacity: number;
  seats_taken: number;
  depart_time_tur: string | null;
  depart_time_retur: string | null;
  is_active: boolean;
  sort_order: number;
}

const BLANK: BusDateInput = {
  travelDate: "",
  price: 150,
  capacity: 50,
  departTimeTur: "",
  departTimeRetur: "",
  isActive: true,
  sortOrder: 0,
};

export function BusDatesManager({ dates }: { dates: AdminBusDate[] }) {
  const router = useRouter();
  const [editing, setEditing] = React.useState<BusDateInput | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [toDelete, setToDelete] = React.useState<AdminBusDate | null>(null);

  const openNew = () => setEditing({ ...BLANK, sortOrder: dates.length + 1 });
  const openEdit = (d: AdminBusDate) =>
    setEditing({
      id: d.id,
      travelDate: d.travel_date,
      price: Number(d.price),
      capacity: d.capacity,
      departTimeTur: d.depart_time_tur,
      departTimeRetur: d.depart_time_retur,
      isActive: d.is_active,
      sortOrder: d.sort_order,
    });

  const set = <K extends keyof BusDateInput>(k: K, v: BusDateInput[K]) =>
    setEditing((prev) => (prev ? { ...prev, [k]: v } : prev));

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    const res = await saveBusDate(editing);
    setSaving(false);
    if (res.ok) {
      toast.success("Дата сохранена");
      setEditing(null);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  };

  const handleToggle = async (d: AdminBusDate, next: boolean) => {
    setPendingId(d.id);
    const res = await toggleBusDate(d.id, next);
    setPendingId(null);
    if (res.ok) router.refresh();
    else toast.error(res.error);
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setSaving(true);
    const res = await deleteBusDate(toDelete.id);
    setSaving(false);
    if (res.ok) {
      toast.success("Дата удалена");
      setToDelete(null);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  };

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={openNew}>
          <Plus className="mr-2 h-4 w-4" /> Добавить дату
        </Button>
      </div>

      {dates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center text-gray-500">
          <Bus className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          Пока нет дат.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Дата</th>
                <th className="px-4 py-3 font-medium">Рейсы (первый → последний)</th>
                <th className="px-4 py-3 font-medium">Цена</th>
                <th className="px-4 py-3 font-medium">Места</th>
                <th className="px-4 py-3 font-medium">Активна</th>
                <th className="px-4 py-3 font-medium text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dates.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {new Date(d.travel_date).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{d.depart_time_tur || "—"} → {d.depart_time_retur || "—"}</td>
                  <td className="px-4 py-3 text-gray-900">{d.price} {d.currency}</td>
                  <td className="px-4 py-3">
                    <span className={d.seats_taken >= d.capacity ? "text-red-500" : "text-gray-700"}>
                      {d.seats_taken} / {d.capacity}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {pendingId === d.id ? (
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    ) : (
                      <Switch checked={d.is_active} onCheckedChange={(v) => handleToggle(d, v)} />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(d)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => setToDelete(d)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Редактировать дату" : "Новая дата"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Дата</Label>
                  <Input type="date" value={editing.travelDate} onChange={(e) => set("travelDate", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Цена round-trip (MDL)</Label>
                  <Input type="number" value={editing.price} onChange={(e) => set("price", Number(e.target.value))} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>Вместимость</Label>
                  <Input type="number" value={editing.capacity} onChange={(e) => set("capacity", Number(e.target.value))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Первый рейс (туда)</Label>
                  <Input value={editing.departTimeTur ?? ""} onChange={(e) => set("departTimeTur", e.target.value || null)} placeholder="12:00" />
                </div>
                <div className="space-y-1.5">
                  <Label>Последний рейс (обратно)</Label>
                  <Input value={editing.departTimeRetur ?? ""} onChange={(e) => set("departTimeRetur", e.target.value || null)} placeholder="00:30" />
                </div>
              </div>
              <div className="grid grid-cols-2 items-center gap-3">
                <div className="space-y-1.5">
                  <Label>Порядок</Label>
                  <Input type="number" value={editing.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value))} />
                </div>
                <label className="mt-6 flex items-center gap-2">
                  <Switch checked={editing.isActive} onCheckedChange={(v) => set("isActive", v)} />
                  <span className="text-sm">Активна</span>
                </label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)} disabled={saving}>Отмена</Button>
            <Button onClick={save} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Сохранить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить дату?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">Если по дате уже есть заказы, удаление будет отклонено.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToDelete(null)} disabled={saving}>Отмена</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Удалить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
