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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

export function AddPartnerButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("partners");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const supabase = createClient();

    let logoUrl = formData.get("logo_url") as string;

    // Если есть файл изображения, загружаем в storage
    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("partners")
        .upload(fileName, imageFile);

      if (uploadError) {
        console.error("Error uploading image:", uploadError);
        alert(`Ошибка загрузки изображения: ${uploadError.message}`);
        setIsLoading(false);
        return;
      }

      if (uploadData) {
        const { data: urlData } = supabase.storage
          .from("partners")
          .getPublicUrl(fileName);
        logoUrl = urlData.publicUrl;
      }
    }

    const { error } = await supabase.from("partners").insert({
      name: formData.get("name") as string,
      logo_url: logoUrl || null,
      website: formData.get("website") as string || null,
      category: selectedCategory,
      sort_order: parseInt(formData.get("sort_order") as string) || 0,
    });

    if (error) {
      console.error("Error adding partner:", error);
      alert(`Ошибка добавления партнера: ${error.message || JSON.stringify(error)}`);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    setOpen(false);
    setImageFile(null);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Добавить партнёра
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white border-gray-200 max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Добавить партнёра</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700">Название *</Label>
            <Input
              id="name"
              name="name"
              placeholder="Orange Moldova"
              required
              className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-gray-700">Категория</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                <SelectValue placeholder="Категория" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="patronage">Патронаж</SelectItem>
                <SelectItem value="generalPartner">Генеральный партнёр</SelectItem>
                <SelectItem value="partners">Партнёры</SelectItem>
                <SelectItem value="generalMediaPartner">Генеральный медиа-партнёр</SelectItem>
                <SelectItem value="mediaPartners">Медиа-партнёры</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website" className="text-gray-700">Сайт</Label>
            <Input
              id="website"
              name="website"
              placeholder="https://example.com"
              className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700">Логотип</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="bg-white border-gray-300 text-gray-900"
            />
            <p className="text-xs text-gray-500">Или укажите URL:</p>
            <Input
              id="logo_url"
              name="logo_url"
              placeholder="https://example.com/logo.png"
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
