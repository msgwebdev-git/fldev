"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { revalidateTicketsCache } from "./actions";
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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2 } from "lucide-react";

export function AddTicketButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [featuresRo, setFeaturesRo] = useState<string[]>([""]);
  const [featuresRu, setFeaturesRu] = useState<string[]>([""]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const supabase = createClient();

    const filteredFeaturesRo = featuresRo.filter((f) => f.trim() !== "");
    const filteredFeaturesRu = featuresRu.filter((f) => f.trim() !== "");

    // Generate name from name_ro (lowercase, no spaces)
    const nameRo = formData.get("name_ro") as string;
    const name = nameRo.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");

    const { error } = await supabase.from("tickets").insert({
      name: name,
      name_ro: nameRo,
      name_ru: formData.get("name_ru") as string,
      description_ro: formData.get("description_ro") as string || null,
      description_ru: formData.get("description_ru") as string || null,
      features_ro: filteredFeaturesRo,
      features_ru: filteredFeaturesRu,
      price: parseFloat(formData.get("price") as string),
      original_price: formData.get("original_price")
        ? parseFloat(formData.get("original_price") as string)
        : null,
      currency: formData.get("currency") as string || "MDL",
      is_active: formData.get("is_active") === "on",
      sort_order: parseInt(formData.get("sort_order") as string) || 0,
      max_per_order: parseInt(formData.get("max_per_order") as string) || 50,
      has_options: formData.get("has_options") === "on",
    });

    if (error) {
      console.error("Error adding ticket:", error);
    } else {
      await revalidateTicketsCache();
    }

    setIsLoading(false);
    setOpen(false);
    setFeaturesRo([""]);
    setFeaturesRu([""]);
    router.refresh();
  };

  const addFeatureRo = () => setFeaturesRo([...featuresRo, ""]);
  const updateFeatureRo = (index: number, value: string) => {
    const newFeatures = [...featuresRo];
    newFeatures[index] = value;
    setFeaturesRo(newFeatures);
  };
  const removeFeatureRo = (index: number) => {
    if (featuresRo.length > 1) setFeaturesRo(featuresRo.filter((_, i) => i !== index));
  };

  const addFeatureRu = () => setFeaturesRu([...featuresRu, ""]);
  const updateFeatureRu = (index: number, value: string) => {
    const newFeatures = [...featuresRu];
    newFeatures[index] = value;
    setFeaturesRu(newFeatures);
  };
  const removeFeatureRu = (index: number) => {
    if (featuresRu.length > 1) setFeaturesRu(featuresRu.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Добавить билет
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white border-gray-200 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Добавить билет</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs defaultValue="ro" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ro">🇷🇴 Română</TabsTrigger>
              <TabsTrigger value="ru">🇷🇺 Русский</TabsTrigger>
            </TabsList>

            <TabsContent value="ro" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name_ro" className="text-gray-700">Название (RO) *</Label>
                <Input
                  id="name_ro"
                  name="name_ro"
                  placeholder="Day Pass"
                  required
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description_ro" className="text-gray-700">Описание (RO)</Label>
                <Textarea
                  id="description_ro"
                  name="description_ro"
                  placeholder="Acces pe teritoriul festivalului"
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700">Включено в билет (RO)</Label>
                <div className="space-y-2">
                  {featuresRo.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={feature}
                        onChange={(e) => updateFeatureRo(index, e.target.value)}
                        placeholder="Acces pe teritoriul festivalului"
                        className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFeatureRo(index)}
                        className="text-red-500 hover:text-red-700"
                        disabled={featuresRo.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addFeatureRo}>
                    + Добавить
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ru" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name_ru" className="text-gray-700">Название (RU) *</Label>
                <Input
                  id="name_ru"
                  name="name_ru"
                  placeholder="Дневной пропуск"
                  required
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description_ru" className="text-gray-700">Описание (RU)</Label>
                <Textarea
                  id="description_ru"
                  name="description_ru"
                  placeholder="Доступ на территорию фестиваля"
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700">Включено в билет (RU)</Label>
                <div className="space-y-2">
                  {featuresRu.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={feature}
                        onChange={(e) => updateFeatureRu(index, e.target.value)}
                        placeholder="Доступ на территорию фестиваля"
                        className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFeatureRu(index)}
                        className="text-red-500 hover:text-red-700"
                        disabled={featuresRu.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addFeatureRu}>
                    + Добавить
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Separator />

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price" className="text-gray-700">Цена *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                placeholder="380"
                required
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="original_price" className="text-gray-700">Старая цена</Label>
              <Input
                id="original_price"
                name="original_price"
                type="number"
                step="0.01"
                placeholder="500"
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency" className="text-gray-700">Валюта</Label>
              <Input
                id="currency"
                name="currency"
                defaultValue="MDL"
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>
          </div>

          <Separator />

          <div className="flex items-center space-x-2">
            <Checkbox id="has_options" name="has_options" />
            <Label htmlFor="has_options" className="text-gray-700">
              Билет с опциями (например, тип размещения)
            </Label>
          </div>

          <div className="grid grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label htmlFor="max_per_order" className="text-gray-700">Макс. на заказ</Label>
              <Input
                id="max_per_order"
                name="max_per_order"
                type="number"
                defaultValue="50"
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="is_active" name="is_active" defaultChecked />
            <Label htmlFor="is_active" className="text-gray-700">
              Активный (отображается на сайте)
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
