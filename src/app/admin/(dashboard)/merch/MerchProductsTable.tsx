"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, ShoppingBag, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteProduct, toggleProductActive } from "./actions";

interface AdminVariant {
  id: string;
  size: string;
  stock_quantity: number;
  is_active: boolean;
}

export interface AdminProduct {
  id: string;
  slug: string;
  name_ru: string;
  name_ro: string;
  category_id: string | null;
  merch_categories: { name_ru: string } | null;
  price: number;
  currency: string;
  images: string[] | null;
  is_active: boolean;
  sort_order: number;
  merch_variants: AdminVariant[] | null;
}

export function MerchProductsTable({ products }: { products: AdminProduct[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [toDelete, setToDelete] = React.useState<AdminProduct | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const handleToggle = async (product: AdminProduct, next: boolean) => {
    setPendingId(product.id);
    const res = await toggleProductActive(product.id, next);
    setPendingId(null);
    if (res.ok) {
      toast.success(next ? "Товар включён" : "Товар отключён");
      router.refresh();
    } else {
      toast.error(res.error);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    const res = await deleteProduct(toDelete.id);
    setDeleting(false);
    if (res.ok) {
      toast.success("Товар удалён");
      setToDelete(null);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  };

  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center text-gray-500">
        <ShoppingBag className="mx-auto mb-3 h-10 w-10 text-gray-300" />
        Пока нет товаров. Добавьте первый.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Товар</th>
              <th className="px-4 py-3 font-medium">Категория</th>
              <th className="px-4 py-3 font-medium">Цена</th>
              <th className="px-4 py-3 font-medium">Остаток</th>
              <th className="px-4 py-3 font-medium">Активен</th>
              <th className="px-4 py-3 font-medium text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product) => {
              const cover = product.images?.[0];
              const totalStock = (product.merch_variants ?? [])
                .filter((v) => v.is_active)
                .reduce((sum, v) => sum + (v.stock_quantity ?? 0), 0);
              const sizes = (product.merch_variants ?? []).filter((v) => v.is_active).length;

              return (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        {cover ? (
                          <Image src={cover} alt={product.name_ru} fill sizes="44px" className="object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-gray-300">
                            <ShoppingBag className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{product.name_ru}</p>
                        <p className="text-xs text-gray-400">/{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{product.merch_categories?.name_ru ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-900">{product.price} {product.currency}</td>
                  <td className="px-4 py-3">
                    <span className={totalStock === 0 ? "text-red-500" : "text-gray-700"}>
                      {totalStock} шт · {sizes} разм.
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {pendingId === product.id ? (
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    ) : (
                      <Switch checked={product.is_active} onCheckedChange={(v) => handleToggle(product, v)} />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <Link href={`/admin/merch/products/${product.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600"
                        onClick={() => setToDelete(product)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить товар?</DialogTitle>
            <DialogDescription>
              {toDelete && (
                <>
                  «{toDelete.name_ru}» будет удалён без возможности восстановления.
                  Если товар уже участвовал в заказах, удаление будет отклонено — используйте отключение.
                </>
              )}
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
