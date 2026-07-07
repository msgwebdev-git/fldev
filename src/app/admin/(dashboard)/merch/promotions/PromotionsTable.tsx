"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Gift, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deletePromotion, togglePromotion } from "../actions";

export interface AdminPromotion {
  id: string;
  name: string;
  is_active: boolean;
  min_order_amount: number;
  reward_quantity: number;
  max_redemptions: number | null;
  redemption_count: number;
  starts_at: string | null;
  ends_at: string | null;
  tickets: { name_ru: string } | null;
}

export function PromotionsTable({ promotions }: { promotions: AdminPromotion[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [toDelete, setToDelete] = React.useState<AdminPromotion | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const handleToggle = async (p: AdminPromotion, next: boolean) => {
    setPendingId(p.id);
    const res = await togglePromotion(p.id, next);
    setPendingId(null);
    if (res.ok) {
      toast.success(next ? "Акция включена" : "Акция отключена");
      router.refresh();
    } else {
      toast.error(res.error);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    const res = await deletePromotion(toDelete.id);
    setDeleting(false);
    if (res.ok) {
      toast.success("Акция удалена");
      setToDelete(null);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  };

  if (promotions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center text-gray-500">
        <Gift className="mx-auto mb-3 h-10 w-10 text-gray-300" />
        Пока нет акций.
      </div>
    );
  }

  const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString("ru-RU") : "—");

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Акция</th>
              <th className="px-4 py-3 font-medium">Порог</th>
              <th className="px-4 py-3 font-medium">Подарок</th>
              <th className="px-4 py-3 font-medium">Выдано</th>
              <th className="px-4 py-3 font-medium">Период</th>
              <th className="px-4 py-3 font-medium">Активна</th>
              <th className="px-4 py-3 font-medium text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {promotions.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                <td className="px-4 py-3 text-gray-700">{p.min_order_amount} MDL</td>
                <td className="px-4 py-3 text-gray-600">
                  {p.tickets?.name_ru ?? "—"} × {p.reward_quantity}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {p.redemption_count}
                  {p.max_redemptions != null ? ` / ${p.max_redemptions}` : ""}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {fmt(p.starts_at)} — {fmt(p.ends_at)}
                </td>
                <td className="px-4 py-3">
                  {pendingId === p.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  ) : (
                    <Switch checked={p.is_active} onCheckedChange={(v) => handleToggle(p, v)} />
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <Link href={`/admin/merch/promotions/${p.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600"
                      onClick={() => setToDelete(p)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить акцию?</DialogTitle>
            <DialogDescription>
              {toDelete && <>«{toDelete.name}» будет удалена. Если по акции уже выдавались подарки, удаление будет отклонено.</>}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToDelete(null)} disabled={deleting}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Удалить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
