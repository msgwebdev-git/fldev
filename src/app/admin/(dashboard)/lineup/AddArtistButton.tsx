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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

interface AddArtistButtonProps {
  years: string[];
}

export function AddArtistButton({ years }: AddArtistButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isHeadliner, setIsHeadliner] = useState(false);
  const [selectedYear, setSelectedYear] = useState(years[0] || "2025");
  const [selectedDay, setSelectedDay] = useState("1");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const supabase = createClient();

    let imageUrl = formData.get("image_url") as string;

    // Если есть файл изображения, загружаем в storage
    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("artists")
        .upload(fileName, imageFile);

      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage
          .from("artists")
          .getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }
    }

    const { error } = await supabase.from("artists").insert({
      name: formData.get("name") as string,
      image_url: imageUrl || null,
      genre: formData.get("genre") as string || null,
      country: formData.get("country") as string || null,
      is_headliner: isHeadliner,
      day: parseInt(selectedDay),
      stage: formData.get("stage") as string || null,
      year: selectedYear,
      sort_order: parseInt(formData.get("sort_order") as string) || 0,
    });

    if (error) {
      console.error("Error adding artist:", error);
    }

    setIsLoading(false);
    setOpen(false);
    setImageFile(null);
    setIsHeadliner(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Добавить артиста
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white border-gray-200 max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Добавить артиста</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700">Имя артиста *</Label>
            <Input
              id="name"
              name="name"
              placeholder="Carla's Dreams"
              required
              className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
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
              <Label htmlFor="day" className="text-gray-700">День</Label>
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                  <SelectValue placeholder="День" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">День 1</SelectItem>
                  <SelectItem value="2">День 2</SelectItem>
                  <SelectItem value="3">День 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="genre" className="text-gray-700">Жанр</Label>
            <Input
              id="genre"
              name="genre"
              placeholder="Pop / Rock"
              className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country" className="text-gray-700">Страна</Label>
            <Input
              id="country"
              name="country"
              placeholder="Moldova"
              className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stage" className="text-gray-700">Сцена</Label>
            <Input
              id="stage"
              name="stage"
              placeholder="Main Stage"
              className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700">Изображение</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="bg-white border-gray-300 text-gray-900"
            />
            <p className="text-xs text-gray-500">Или укажите URL:</p>
            <Input
              id="image_url"
              name="image_url"
              placeholder="https://example.com/image.jpg"
              className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
            />
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

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_headliner"
              checked={isHeadliner}
              onCheckedChange={(checked) => setIsHeadliner(checked === true)}
            />
            <Label htmlFor="is_headliner" className="text-gray-700 cursor-pointer">
              Хедлайнер
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
