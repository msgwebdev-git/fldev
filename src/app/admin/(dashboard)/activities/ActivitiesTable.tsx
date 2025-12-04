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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Trash2, Sparkles, MapPin, Clock, Star } from "lucide-react";

interface Activity {
  id: number;
  title: string;
  description: string | null;
  category: string;
  icon: string;
  location: string | null;
  time: string | null;
  is_highlight: boolean;
  year: string;
  sort_order: number;
}

interface ActivitiesTableProps {
  activities: Activity[];
  years: string[];
}

const categoryLabels: Record<string, string> = {
  entertainment: "Развлечения",
  workshops: "Мастер-классы",
  relaxation: "Отдых",
  food: "Еда и напитки",
  family: "Семья",
};

const iconOptions = [
  { value: "music", label: "Музыка" },
  { value: "palette", label: "Искусство" },
  { value: "tent", label: "Кемпинг" },
  { value: "utensils", label: "Еда" },
  { value: "users", label: "Люди" },
  { value: "sparkles", label: "Звёзды" },
  { value: "camera", label: "Камера" },
  { value: "heart", label: "Сердце" },
  { value: "treePine", label: "Природа" },
];

const categoryOrder = ["entertainment", "workshops", "relaxation", "food", "family"];

export function ActivitiesTable({ activities, years }: ActivitiesTableProps) {
  const router = useRouter();
  const [editingItem, setEditingItem] = useState<Activity | null>(null);
  const [deletingItem, setDeletingItem] = useState<Activity | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(years[0] || "2025");
  const [selectedCategoryTab, setSelectedCategoryTab] = useState(categoryOrder[0]);
  const [editCategory, setEditCategory] = useState("entertainment");
  const [editIcon, setEditIcon] = useState("sparkles");
  const [editIsHighlight, setEditIsHighlight] = useState(false);

  const filteredActivities = activities.filter((a) => a.year === selectedYear);

  // Группируем по категориям
  const activitiesByCategory: Record<string, Activity[]> = {};
  filteredActivities.forEach((activity) => {
    if (!activitiesByCategory[activity.category]) {
      activitiesByCategory[activity.category] = [];
    }
    activitiesByCategory[activity.category].push(activity);
  });

  const availableCategories = categoryOrder.filter((cat) => activitiesByCategory[cat]?.length > 0);

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingItem) return;

    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const supabase = createClient();

    await supabase
      .from("activities")
      .update({
        title: formData.get("title") as string,
        description: formData.get("description") as string || null,
        category: editCategory,
        icon: editIcon,
        location: formData.get("location") as string || null,
        time: formData.get("time") as string || null,
        is_highlight: editIsHighlight,
        year: formData.get("year") as string,
        sort_order: parseInt(formData.get("sort_order") as string) || 0,
      })
      .eq("id", editingItem.id);

    setIsLoading(false);
    setEditingItem(null);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!deletingItem) return;

    setIsLoading(true);
    const supabase = createClient();

    await supabase.from("activities").delete().eq("id", deletingItem.id);

    setIsLoading(false);
    setDeletingItem(null);
    router.refresh();
  };

  const openEditDialog = (activity: Activity) => {
    setEditingItem(activity);
    setEditCategory(activity.category);
    setEditIcon(activity.icon);
    setEditIsHighlight(activity.is_highlight);
  };

  if (activities.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
        <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Нет активностей. Добавьте первую!</p>
      </div>
    );
  }

  const renderActivityRow = (activity: Activity) => (
    <tr key={activity.id} className={`hover:bg-gray-50 ${activity.is_highlight ? "bg-primary/5" : ""}`}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-gray-900 font-medium">{activity.title}</span>
          {activity.is_highlight && (
            <Badge variant="default" className="text-xs">
              <Star className="w-3 h-3 mr-1" />
              Рекомендуем
            </Badge>
          )}
        </div>
        {activity.description && (
          <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{activity.description}</p>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1 text-xs text-gray-500">
          {activity.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{activity.location}</span>
            </div>
          )}
          {activity.time && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{activity.time}</span>
            </div>
          )}
          {!activity.location && !activity.time && (
            <span className="text-gray-400">—</span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-gray-500 text-sm">{activity.sort_order}</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-500 hover:text-gray-900"
            onClick={() => openEditDialog(activity)}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-500 hover:text-red-600"
            onClick={() => setDeletingItem(activity)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  );

  return (
    <>
      {/* Year Tabs */}
      <Tabs value={selectedYear} onValueChange={setSelectedYear}>
        <TabsList className="bg-gray-100 mb-4">
          {years.length > 0 ? (
            years.map((year) => (
              <TabsTrigger key={year} value={year}>
                {year} ({activities.filter((a) => a.year === year).length})
              </TabsTrigger>
            ))
          ) : (
            <TabsTrigger value="2025">2025 (0)</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value={selectedYear} className="mt-0">
          {availableCategories.length > 0 ? (
            <Tabs value={selectedCategoryTab} onValueChange={setSelectedCategoryTab}>
              <TabsList className="bg-gray-100 mb-4">
                {availableCategories.map((category) => (
                  <TabsTrigger key={category} value={category}>
                    {categoryLabels[category]} ({activitiesByCategory[category]?.length || 0})
                  </TabsTrigger>
                ))}
              </TabsList>

              {availableCategories.map((category) => (
                <TabsContent key={category} value={category} className="mt-0">
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Активность
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-40">
                            Локация / Время
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-20">
                            Порядок
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-24">
                            Действия
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {(activitiesByCategory[category] || [])
                          .sort((a, b) => a.sort_order - b.sort_order)
                          .map(renderActivityRow)}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <p className="text-gray-500">Нет активностей за {selectedYear} год</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="bg-white border-gray-200 max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Редактировать активность</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title" className="text-gray-700">Название *</Label>
              <Input
                id="edit-title"
                name="title"
                defaultValue={editingItem?.title}
                required
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description" className="text-gray-700">Описание</Label>
              <Textarea
                id="edit-description"
                name="description"
                defaultValue={editingItem?.description || ""}
                className="bg-white border-gray-300 text-gray-900"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-year" className="text-gray-700">Год *</Label>
                <Input
                  id="edit-year"
                  name="year"
                  defaultValue={editingItem?.year}
                  required
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-category" className="text-gray-700">Категория</Label>
                <Select value={editCategory} onValueChange={setEditCategory}>
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                    <SelectValue placeholder="Категория" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entertainment">Развлечения</SelectItem>
                    <SelectItem value="workshops">Мастер-классы</SelectItem>
                    <SelectItem value="relaxation">Отдых</SelectItem>
                    <SelectItem value="food">Еда и напитки</SelectItem>
                    <SelectItem value="family">Семья</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-icon" className="text-gray-700">Иконка</Label>
                <Select value={editIcon} onValueChange={setEditIcon}>
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                    <SelectValue placeholder="Иконка" />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-sort_order" className="text-gray-700">Порядок</Label>
                <Input
                  id="edit-sort_order"
                  name="sort_order"
                  type="number"
                  defaultValue={editingItem?.sort_order || 0}
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-location" className="text-gray-700">Локация</Label>
                <Input
                  id="edit-location"
                  name="location"
                  defaultValue={editingItem?.location || ""}
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-time" className="text-gray-700">Время</Label>
                <Input
                  id="edit-time"
                  name="time"
                  defaultValue={editingItem?.time || ""}
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-is_highlight"
                checked={editIsHighlight}
                onCheckedChange={(checked) => setEditIsHighlight(checked === true)}
              />
              <Label htmlFor="edit-is_highlight" className="text-gray-700 cursor-pointer">
                Рекомендуемая активность
              </Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setEditingItem(null)}>
                Отмена
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Сохранение..." : "Сохранить"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deletingItem} onOpenChange={() => setDeletingItem(null)}>
        <DialogContent className="bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Удалить активность?</DialogTitle>
          </DialogHeader>
          <p className="text-gray-500">
            Вы уверены, что хотите удалить &quot;{deletingItem?.title}&quot;?
          </p>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setDeletingItem(null)}>
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
