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
import { BADGE_COLORS } from "./CategoriesTable";

const slugify = (input: string) =>
  input
    .toLowerCase()
    .replace(/ă/g, "a")
    .replace(/â/g, "a")
    .replace(/î/g, "i")
    .replace(/ș/g, "s")
    .replace(/ț/g, "t")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 50);

export function AddCategoryButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [labelRo, setLabelRo] = useState("");
  const [keyValue, setKeyValue] = useState("");
  const [keyEdited, setKeyEdited] = useState(false);
  const [color, setColor] = useState("gray");

  const handleLabelRoChange = (v: string) => {
    setLabelRo(v);
    if (!keyEdited) setKeyValue(slugify(v));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const supabase = createClient();

    const { error } = await supabase.from("partner_categories").insert({
      key: keyValue.trim(),
      label_ro: labelRo,
      label_ru: formData.get("label_ru") as string,
      label_en: (formData.get("label_en") as string) || null,
      sort_order: parseInt(formData.get("sort_order") as string) || 0,
      badge_color: color,
    });

    setIsLoading(false);
    if (error) {
      alert(`Ошибка: ${error.message}`);
      return;
    }
    setOpen(false);
    setLabelRo("");
    setKeyValue("");
    setKeyEdited(false);
    setColor("gray");
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Добавить категорию
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white border-gray-200 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Добавить категорию</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="label_ro" className="text-gray-700">Label RO *</Label>
            <Input
              id="label_ro"
              value={labelRo}
              onChange={(e) => handleLabelRoChange(e.target.value)}
              placeholder="Partener exclusiv"
              required
              className="bg-white border-gray-300 text-gray-900"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="label_ru" className="text-gray-700">Label RU *</Label>
            <Input
              id="label_ru"
              name="label_ru"
              placeholder="Эксклюзивный партнёр"
              required
              className="bg-white border-gray-300 text-gray-900"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="label_en" className="text-gray-700">Label EN</Label>
            <Input
              id="label_en"
              name="label_en"
              placeholder="Exclusive Partner"
              className="bg-white border-gray-300 text-gray-900"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="key" className="text-gray-700">Ключ (slug) *</Label>
            <Input
              id="key"
              value={keyValue}
              onChange={(e) => {
                setKeyValue(e.target.value);
                setKeyEdited(true);
              }}
              placeholder="partener_exclusiv"
              required
              pattern="[a-z0-9_]+"
              className="bg-white border-gray-300 text-gray-900 font-mono"
            />
            <p className="text-xs text-gray-500">
              Только латиница в нижнем регистре, цифры и _. Автогенерируется из RO-названия.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sort_order" className="text-gray-700">Порядок сортировки</Label>
            <Input
              id="sort_order"
              name="sort_order"
              type="number"
              defaultValue="100"
              className="bg-white border-gray-300 text-gray-900"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-700">Цвет бейджа в админке</Label>
            <Select value={color} onValueChange={setColor}>
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
