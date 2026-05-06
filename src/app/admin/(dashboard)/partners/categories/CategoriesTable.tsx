"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Trash2, Tag } from "lucide-react";

export interface PartnerCategory {
  id: number;
  key: string;
  label_ro: string;
  label_ru: string;
  label_en: string | null;
  sort_order: number;
  badge_color: string;
}

interface Props {
  categories: PartnerCategory[];
  usageMap: Record<string, number>;
}

export const BADGE_COLORS = [
  { value: "yellow", label: "Жёлтый", classes: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { value: "blue",   label: "Синий",  classes: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "green",  label: "Зелёный",classes: "bg-green-100 text-green-800 border-green-200" },
  { value: "purple", label: "Фиолетовый", classes: "bg-purple-100 text-purple-800 border-purple-200" },
  { value: "pink",   label: "Розовый",classes: "bg-pink-100 text-pink-800 border-pink-200" },
  { value: "orange", label: "Оранжевый", classes: "bg-orange-100 text-orange-800 border-orange-200" },
  { value: "gray",   label: "Серый",  classes: "bg-gray-100 text-gray-800 border-gray-200" },
];

export const getBadgeClasses = (color: string) =>
  BADGE_COLORS.find((c) => c.value === color)?.classes ?? BADGE_COLORS[6].classes;

export function CategoriesTable({ categories, usageMap }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState<PartnerCategory | null>(null);
  const [deleting, setDeleting] = useState<PartnerCategory | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editColor, setEditColor] = useState("gray");

  const openEdit = (c: PartnerCategory) => {
    setEditing(c);
    setEditColor(c.badge_color);
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editing) return;
    setIsLoading(true);
    const supabase = createClient();
    const formData = new FormData(e.currentTarget);

    const { error } = await supabase
      .from("partner_categories")
      .update({
        label_ro: formData.get("label_ro") as string,
        label_ru: formData.get("label_ru") as string,
        label_en: (formData.get("label_en") as string) || null,
        sort_order: parseInt(formData.get("sort_order") as string) || 0,
        badge_color: editColor,
      })
      .eq("id", editing.id);

    setIsLoading(false);
    if (error) {
      alert(`Ошибка: ${error.message}`);
      return;
    }
    setEditing(null);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!deleting) return;
    const usage = usageMap[deleting.key] ?? 0;
    if (usage > 0) {
      alert(
        `Нельзя удалить: категория используется в ${usage} партнёрах. Сначала переназначьте их на другую категорию.`,
      );
      setDeleting(null);
      return;
    }
    setIsLoading(true);
    const supabase = createClient();
    await supabase.from("partner_categories").delete().eq("id", deleting.id);
    setIsLoading(false);
    setDeleting(null);
    router.refresh();
  };

  if (categories.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
        <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Нет категорий. Добавьте первую!</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-20">
                Порядок
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                RO / RU / EN
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Ключ (slug)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">
                Партнёров
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-24">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {categories.map((c) => {
              const usage = usageMap[c.key] ?? 0;
              return (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500 text-sm">{c.sort_order}</td>
                  <td className="px-4 py-3">
                    <Badge className={getBadgeClasses(c.badge_color)}>{c.label_ro}</Badge>
                    <div className="text-sm text-gray-600 mt-1">{c.label_ru}</div>
                    {c.label_en && <div className="text-xs text-gray-400">{c.label_en}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                      {c.key}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm">{usage}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-gray-900"
                        onClick={() => openEdit(c)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-red-600"
                        onClick={() => setDeleting(c)}
                        disabled={usage > 0}
                        title={usage > 0 ? "Категория используется — удалить нельзя" : ""}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="bg-white border-gray-200 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Редактировать категорию</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-700">Ключ</Label>
              <Input
                value={editing?.key ?? ""}
                disabled
                className="bg-gray-50 border-gray-300 text-gray-500 font-mono"
              />
              <p className="text-xs text-gray-500">
                Ключ нельзя менять — он связан с записями партнёров
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="label_ro" className="text-gray-700">Label RO *</Label>
              <Input
                id="label_ro"
                name="label_ro"
                defaultValue={editing?.label_ro}
                required
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="label_ru" className="text-gray-700">Label RU *</Label>
              <Input
                id="label_ru"
                name="label_ru"
                defaultValue={editing?.label_ru}
                required
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="label_en" className="text-gray-700">Label EN</Label>
              <Input
                id="label_en"
                name="label_en"
                defaultValue={editing?.label_en ?? ""}
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sort_order" className="text-gray-700">Порядок сортировки</Label>
              <Input
                id="sort_order"
                name="sort_order"
                type="number"
                defaultValue={editing?.sort_order ?? 0}
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700">Цвет бейджа в админке</Label>
              <Select value={editColor} onValueChange={setEditColor}>
                <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BADGE_COLORS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      <span className="flex items-center gap-2">
                        <span className={`inline-block w-3 h-3 rounded-full ${c.classes.split(" ")[0]}`} />
                        {c.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
                Отмена
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Сохранение..." : "Сохранить"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent className="bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Удалить категорию?</DialogTitle>
          </DialogHeader>
          <p className="text-gray-500">
            Удалить категорию &quot;{deleting?.label_ro}&quot;? Это действие нельзя отменить.
          </p>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setDeleting(null)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {isLoading ? "Удаление..." : "Удалить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
