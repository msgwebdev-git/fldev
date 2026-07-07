"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Loader2, Tag } from "lucide-react";
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
import { saveCategory, deleteCategory, toggleCategory, type CategoryInput } from "../actions";

export interface AdminCategory {
  id: string;
  slug: string;
  name_ru: string;
  name_ro: string;
  sort_order: number;
  is_active: boolean;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const BLANK: CategoryInput = { slug: "", nameRo: "", nameRu: "", sortOrder: 0, isActive: true };

export function CategoriesManager({ categories }: { categories: AdminCategory[] }) {
  const router = useRouter();
  const [editing, setEditing] = React.useState<CategoryInput | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [toDelete, setToDelete] = React.useState<AdminCategory | null>(null);

  const openNew = () => setEditing({ ...BLANK, sortOrder: categories.length + 1 });
  const openEdit = (c: AdminCategory) =>
    setEditing({ id: c.id, slug: c.slug, nameRo: c.name_ro, nameRu: c.name_ru, sortOrder: c.sort_order, isActive: c.is_active });

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    const res = await saveCategory(editing);
    setSaving(false);
    if (res.ok) {
      toast.success("Категория сохранена");
      setEditing(null);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  };

  const handleToggle = async (c: AdminCategory, next: boolean) => {
    setPendingId(c.id);
    const res = await toggleCategory(c.id, next);
    setPendingId(null);
    if (res.ok) router.refresh();
    else toast.error(res.error);
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setSaving(true);
    const res = await deleteCategory(toDelete.id);
    setSaving(false);
    if (res.ok) {
      toast.success("Категория удалена");
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
          <Plus className="mr-2 h-4 w-4" /> Добавить категорию
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center text-gray-500">
          <Tag className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          Пока нет категорий.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Название (RU)</th>
                <th className="px-4 py-3 font-medium">Название (RO)</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Порядок</th>
                <th className="px-4 py-3 font-medium">Активна</th>
                <th className="px-4 py-3 font-medium text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.name_ru}</td>
                  <td className="px-4 py-3 text-gray-600">{c.name_ro}</td>
                  <td className="px-4 py-3 text-gray-400">/{c.slug}</td>
                  <td className="px-4 py-3 text-gray-600">{c.sort_order}</td>
                  <td className="px-4 py-3">
                    {pendingId === c.id ? (
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    ) : (
                      <Switch checked={c.is_active} onCheckedChange={(v) => handleToggle(c, v)} />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => setToDelete(c)}>
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

      {/* Edit / create dialog */}
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Редактировать категорию" : "Новая категория"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Название (RU)</Label>
                <Input
                  value={editing.nameRu}
                  onChange={(e) =>
                    setEditing((prev) => {
                      if (!prev) return prev;
                      const nameRu = e.target.value;
                      // auto-slug from RU name for new categories without a slug
                      const slug = prev.id || prev.slug ? prev.slug : slugify(nameRu);
                      return { ...prev, nameRu, slug };
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Название (RO)</Label>
                <Input value={editing.nameRo} onChange={(e) => setEditing({ ...editing, nameRo: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Slug</Label>
                  <Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Порядок</Label>
                  <Input type="number" value={editing.sortOrder} onChange={(e) => setEditing({ ...editing, sortOrder: Number(e.target.value) })} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={editing.isActive} onCheckedChange={(v) => setEditing({ ...editing, isActive: v })} />
                <Label>Активна</Label>
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

      {/* Delete confirm */}
      <Dialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить категорию?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            {toDelete && <>«{toDelete.name_ru}» будет удалена. Если она используется товарами, удаление будет отклонено.</>}
          </p>
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
