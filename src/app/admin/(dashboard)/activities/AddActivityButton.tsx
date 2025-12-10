"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
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
import { Plus } from "lucide-react";

interface AddActivityButtonProps {
  years: string[];
}

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

export function AddActivityButton({ years }: AddActivityButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(years[0] || "2025");
  const [selectedCategory, setSelectedCategory] = useState("entertainment");
  const [selectedIcon, setSelectedIcon] = useState("sparkles");
  const [isHighlight, setIsHighlight] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const supabase = createClient();

    const { error } = await supabase.from("activities").insert({
      title_ru: formData.get("title_ru") as string,
      title_ro: formData.get("title_ro") as string,
      description_ru: formData.get("description_ru") as string || null,
      description_ro: formData.get("description_ro") as string || null,
      category: selectedCategory,
      icon: selectedIcon,
      location: formData.get("location") as string || null,
      time: formData.get("time") as string || null,
      is_highlight: isHighlight,
      year: selectedYear,
      sort_order: parseInt(formData.get("sort_order") as string) || 0,
    });

    if (error) {
      console.error("Error adding activity:", error);
    }

    setIsLoading(false);
    setOpen(false);
    setIsHighlight(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Добавить активность
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white border-gray-200 max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Добавить активность</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title_ru" className="text-gray-700">Название (RU) *</Label>
            <Input
              id="title_ru"
              name="title_ru"
              placeholder="Концерты на главной сцене"
              required
              className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title_ro" className="text-gray-700">Titlu (RO) *</Label>
            <Input
              id="title_ro"
              name="title_ro"
              placeholder="Concerte pe scena principală"
              required
              className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description_ru" className="text-gray-700">Описание (RU)</Label>
            <Textarea
              id="description_ru"
              name="description_ru"
              placeholder="Выступления хедлайнеров и известных артистов"
              className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description_ro" className="text-gray-700">Descriere (RO)</Label>
            <Textarea
              id="description_ro"
              name="description_ro"
              placeholder="Spectacole ale headlinerilor și artiștilor celebri"
              className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year" className="text-gray-700">Год *</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                  <SelectValue placeholder="Выберите год" />
                </SelectTrigger>
                <SelectContent>
                  {["2025", "2024", "2023", "2022", "2021"].map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-gray-700">Категория</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
              <Label htmlFor="icon" className="text-gray-700">Иконка</Label>
              <Select value={selectedIcon} onValueChange={setSelectedIcon}>
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
              <Label htmlFor="sort_order" className="text-gray-700">Порядок сортировки</Label>
              <Input
                id="sort_order"
                name="sort_order"
                type="number"
                defaultValue="0"
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-gray-700">Локация</Label>
            <Input
              id="location"
              name="location"
              placeholder="Scena Principală"
              className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="time" className="text-gray-700">Время работы</Label>
            <Input
              id="time"
              name="time"
              placeholder="10:00 - 18:00"
              className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_highlight"
              checked={isHighlight}
              onCheckedChange={(checked) => setIsHighlight(checked === true)}
            />
            <Label htmlFor="is_highlight" className="text-gray-700 cursor-pointer">
              Рекомендуемая активность
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Добавление..." : "Добавить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
