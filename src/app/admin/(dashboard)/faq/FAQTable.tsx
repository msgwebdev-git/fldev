"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Pencil, Trash2, Eye, EyeOff } from "lucide-react";

interface FAQItem {
  id: string;
  question_ro: string;
  question_ru: string;
  answer_ro: string;
  answer_ru: string;
  category: string;
  sort_order: number;
  is_active: boolean;
}

interface FAQTableProps {
  faqItems: FAQItem[];
}

const categories = [
  { value: "tickets", label: "Билеты" },
  { value: "camping", label: "Кемпинг" },
  { value: "transport", label: "Транспорт" },
  { value: "children", label: "Дети" },
  { value: "food", label: "Еда и напитки" },
  { value: "safety", label: "Безопасность" },
  { value: "location", label: "Локация" },
  { value: "app", label: "Приложение" },
  { value: "general", label: "Общие" },
];

const getCategoryLabel = (category: string) => {
  return categories.find((c) => c.value === category)?.label || category;
};

export function FAQTable({ faqItems }: FAQTableProps) {
  const router = useRouter();
  const [deletingItem, setDeletingItem] = useState<FAQItem | null>(null);
  const [editingItem, setEditingItem] = useState<FAQItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<FAQItem>>({});

  const handleDelete = async () => {
    if (!deletingItem) return;

    setIsLoading(true);
    const supabase = createClient();

    await supabase.from("faq").delete().eq("id", deletingItem.id);

    setIsLoading(false);
    setDeletingItem(null);
    router.refresh();
  };

  const toggleActive = async (item: FAQItem) => {
    const supabase = createClient();
    await supabase
      .from("faq")
      .update({ is_active: !item.is_active })
      .eq("id", item.id);
    router.refresh();
  };

  const handleEdit = (item: FAQItem) => {
    setEditingItem(item);
    setFormData(item);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setIsLoading(true);
    const supabase = createClient();

    await supabase
      .from("faq")
      .update({
        question_ro: formData.question_ro,
        question_ru: formData.question_ru,
        answer_ro: formData.answer_ro,
        answer_ru: formData.answer_ru,
        category: formData.category,
        sort_order: formData.sort_order,
      })
      .eq("id", editingItem.id);

    setIsLoading(false);
    setEditingItem(null);
    router.refresh();
  };

  if (faqItems.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
        <p className="text-gray-500">
          Нет вопросов FAQ. Добавьте первый!
        </p>
      </div>
    );
  }

  // Group items by category
  const groupedItems = faqItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, FAQItem[]>);

  return (
    <>
      <div className="space-y-6">
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">
                {getCategoryLabel(category)} ({items.length})
              </h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                    №
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Вопрос
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Языки
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((item) => {
                  const hasRu = item.question_ru && item.answer_ru;
                  const hasRo = item.question_ro && item.answer_ro;

                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500 text-sm">
                        {item.sort_order}
                      </td>
                      <td className="px-4 py-3">
                        <div className="max-w-md">
                          <span className="text-gray-900 font-medium block">
                            {item.question_ru || item.question_ro}
                          </span>
                          <span className="text-gray-500 text-sm line-clamp-2">
                            {item.answer_ru || item.answer_ro}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {hasRu && (
                            <Badge variant="secondary" className="text-xs">
                              RU
                            </Badge>
                          )}
                          {hasRo && (
                            <Badge variant="secondary" className="text-xs">
                              RO
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleActive(item)}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                            item.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {item.is_active ? (
                            <>
                              <Eye className="w-3 h-3" />
                              Активен
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" />
                              Скрыт
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-gray-900"
                            onClick={() => handleEdit(item)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-red-600"
                            onClick={() => setDeletingItem(item)}
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
        ))}
      </div>

      {/* Delete Dialog */}
      <Dialog open={!!deletingItem} onOpenChange={() => setDeletingItem(null)}>
        <DialogContent className="bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Удалить вопрос?</DialogTitle>
          </DialogHeader>
          <p className="text-gray-500">
            Вы уверены, что хотите удалить "{deletingItem?.question_ru || deletingItem?.question_ro}"? Это действие нельзя отменить.
          </p>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setDeletingItem(null)}>
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? "Удаление..." : "Удалить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="bg-white border-gray-200 max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Редактировать вопрос</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Категория</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Порядок сортировки</Label>
                <Input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sort_order: parseInt(e.target.value) || 1,
                    })
                  }
                  min="1"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="border-b pb-2">
                <h3 className="font-semibold text-gray-900">Румынский (RO)</h3>
              </div>

              <div className="space-y-2">
                <Label>Вопрос (RO)</Label>
                <Input
                  value={formData.question_ro}
                  onChange={(e) =>
                    setFormData({ ...formData, question_ro: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Ответ (RO)</Label>
                <Textarea
                  value={formData.answer_ro}
                  onChange={(e) =>
                    setFormData({ ...formData, answer_ro: e.target.value })
                  }
                  rows={4}
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="border-b pb-2">
                <h3 className="font-semibold text-gray-900">Русский (RU)</h3>
              </div>

              <div className="space-y-2">
                <Label>Вопрос (RU)</Label>
                <Input
                  value={formData.question_ru}
                  onChange={(e) =>
                    setFormData({ ...formData, question_ru: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Ответ (RU)</Label>
                <Textarea
                  value={formData.answer_ru}
                  onChange={(e) =>
                    setFormData({ ...formData, answer_ru: e.target.value })
                  }
                  rows={4}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setEditingItem(null)}
              >
                Отмена
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Сохранение..." : "Сохранить"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
