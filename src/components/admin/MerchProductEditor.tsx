"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2, Upload, X, GripVertical, Star } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { saveProduct, type ProductInput, type VariantInput } from "@/app/admin/(dashboard)/merch/actions";
import type { MerchCategory } from "@/lib/data/merch";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface MerchProductEditorProps {
  categories: MerchCategory[];
  initial?: ProductInput;
  isEdit?: boolean;
}

const EMPTY: ProductInput = {
  slug: "",
  nameRo: "",
  nameRu: "",
  descriptionRo: "",
  descriptionRu: "",
  categoryId: null,
  colorRo: "",
  colorRu: "",
  colorHex: "",
  price: 0,
  originalPrice: null,
  currency: "MDL",
  images: [],
  sizeChartRo: "",
  sizeChartRu: "",
  maxPerOrder: 10,
  isActive: true,
  sortOrder: 0,
  variants: [
    { size: "S", stockQuantity: 0, priceModifier: 0, sortOrder: 1, isActive: true },
    { size: "M", stockQuantity: 0, priceModifier: 0, sortOrder: 2, isActive: true },
    { size: "L", stockQuantity: 0, priceModifier: 0, sortOrder: 3, isActive: true },
    { size: "XL", stockQuantity: 0, priceModifier: 0, sortOrder: 4, isActive: true },
  ],
};

export function MerchProductEditor({ categories, initial, isEdit = false }: MerchProductEditorProps) {
  const router = useRouter();
  const [form, setForm] = React.useState<ProductInput>(initial ?? EMPTY);
  const [slugTouched, setSlugTouched] = React.useState(isEdit);
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);

  const set = <K extends keyof ProductInput>(key: K, value: ProductInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Auto-slug from RO name until the slug field is edited manually
  React.useEffect(() => {
    if (!slugTouched && form.nameRo) {
      setForm((prev) => ({ ...prev, slug: slugify(form.nameRo) }));
    }
  }, [form.nameRo, slugTouched]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("productId", form.id ?? "new");
        const res = await fetch("/api/admin/merch/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (res.ok && data.url) {
          setForm((prev) => ({ ...prev, images: [...prev.images, data.url] }));
        } else {
          toast.error(data.error || "Ошибка загрузки");
        }
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (url: string) =>
    set("images", form.images.filter((u) => u !== url));

  const makeCover = (url: string) =>
    set("images", [url, ...form.images.filter((u) => u !== url)]);

  const updateVariant = (index: number, patch: Partial<VariantInput>) =>
    set(
      "variants",
      form.variants.map((v, i) => (i === index ? { ...v, ...patch } : v))
    );

  const addVariant = () =>
    set("variants", [
      ...form.variants,
      { size: "", stockQuantity: 0, priceModifier: 0, sortOrder: form.variants.length + 1, isActive: true },
    ]);

  const removeVariant = (index: number) =>
    set("variants", form.variants.filter((_, i) => i !== index));

  const validate = (): string | null => {
    if (!form.nameRo.trim() || !form.nameRu.trim()) return "Укажите название на обоих языках";
    if (!form.slug.trim()) return "Укажите slug";
    if (form.price <= 0) return "Укажите цену";
    const sizes = form.variants.map((v) => v.size.trim()).filter(Boolean);
    if (sizes.length === 0) return "Добавьте хотя бы один размер";
    if (new Set(sizes).size !== sizes.length) return "Размеры не должны повторяться";
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }
    setSaving(true);
    const res = await saveProduct({
      ...form,
      variants: form.variants.filter((v) => v.size.trim()),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Товар сохранён");
      router.push("/admin/merch");
      router.refresh();
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? "Редактировать товар" : "Новый товар"}
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push("/admin/merch")}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Сохранить
          </Button>
        </div>
      </div>

      {/* Bilingual fields */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Описание</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="ru">
            <TabsList>
              <TabsTrigger value="ru">Русский</TabsTrigger>
              <TabsTrigger value="ro">Română</TabsTrigger>
            </TabsList>
            <TabsContent value="ru" className="space-y-4 pt-4">
              <div className="space-y-1.5">
                <Label>Название (RU)</Label>
                <Input value={form.nameRu} onChange={(e) => set("nameRu", e.target.value)} placeholder="Футболка Lupii" />
              </div>
              <div className="space-y-1.5">
                <Label>Описание (RU)</Label>
                <Textarea value={form.descriptionRu ?? ""} onChange={(e) => set("descriptionRu", e.target.value)} className="min-h-[100px]" />
              </div>
              <div className="space-y-1.5">
                <Label>Таблица размеров (RU)</Label>
                <Textarea value={form.sizeChartRu ?? ""} onChange={(e) => set("sizeChartRu", e.target.value)} className="min-h-[80px]" placeholder="S — 46, M — 48, ..." />
              </div>
            </TabsContent>
            <TabsContent value="ro" className="space-y-4 pt-4">
              <div className="space-y-1.5">
                <Label>Название (RO)</Label>
                <Input value={form.nameRo} onChange={(e) => set("nameRo", e.target.value)} placeholder="Tricou Lupii" />
              </div>
              <div className="space-y-1.5">
                <Label>Описание (RO)</Label>
                <Textarea value={form.descriptionRo ?? ""} onChange={(e) => set("descriptionRo", e.target.value)} className="min-h-[100px]" />
              </div>
              <div className="space-y-1.5">
                <Label>Таблица размеров (RO)</Label>
                <Textarea value={form.sizeChartRo ?? ""} onChange={(e) => set("sizeChartRo", e.target.value)} className="min-h-[80px]" />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Meta / pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Параметры</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Slug</Label>
            <Input
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", slugify(e.target.value));
              }}
              placeholder="tricou-lupii"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Категория</Label>
            <Select value={form.categoryId ?? ""} onValueChange={(v) => set("categoryId", v)}>
              <SelectTrigger><SelectValue placeholder="Выберите категорию" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.nameRu}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Цвет (RU)</Label>
            <Input value={form.colorRu ?? ""} onChange={(e) => set("colorRu", e.target.value)} placeholder="Чёрный" />
          </div>
          <div className="space-y-1.5">
            <Label>Цвет (RO)</Label>
            <Input value={form.colorRo ?? ""} onChange={(e) => set("colorRo", e.target.value)} placeholder="Negru" />
          </div>
          <div className="space-y-1.5">
            <Label>Образец цвета</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.colorHex || "#000000"}
                onChange={(e) => set("colorHex", e.target.value)}
                className="h-10 w-12 flex-shrink-0 cursor-pointer rounded-md border border-input bg-background"
              />
              <Input value={form.colorHex ?? ""} onChange={(e) => set("colorHex", e.target.value)} placeholder="#000000" className="flex-1" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Цена ({form.currency})</Label>
            <Input type="number" value={form.price} onChange={(e) => set("price", Number(e.target.value))} />
          </div>
          <div className="space-y-1.5">
            <Label>Старая цена (для скидки)</Label>
            <Input
              type="number"
              value={form.originalPrice ?? ""}
              onChange={(e) => set("originalPrice", e.target.value ? Number(e.target.value) : null)}
              placeholder="—"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Макс. в заказе</Label>
            <Input type="number" value={form.maxPerOrder} onChange={(e) => set("maxPerOrder", Number(e.target.value))} />
          </div>
          <div className="space-y-1.5">
            <Label>Порядок сортировки</Label>
            <Input type="number" value={form.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value))} />
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Switch checked={form.isActive} onCheckedChange={(v) => set("isActive", v)} />
            <Label>Активен (виден в магазине)</Label>
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Изображения</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            {form.images.map((url, i) => (
              <div key={url} className="group relative h-24 w-24 overflow-hidden rounded-lg border">
                <Image src={url} alt="" fill sizes="96px" className="object-cover" />
                {i === 0 && (
                  <span className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                    Обложка
                  </span>
                )}
                <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  {i !== 0 && (
                    <button type="button" onClick={() => makeCover(url)} className="rounded bg-white/90 p-1" title="Сделать обложкой">
                      <Star className="h-4 w-4 text-gray-800" />
                    </button>
                  )}
                  <button type="button" onClick={() => removeImage(url)} className="rounded bg-white/90 p-1" title="Удалить">
                    <X className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
            <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-gray-300 text-gray-400 hover:border-primary hover:text-primary">
              {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
              <span className="text-xs">Загрузить</span>
              <input type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" disabled={uploading} />
            </label>
          </div>
          <p className="text-xs text-gray-400">Первое изображение — обложка. JPG/PNG/WEBP, до 8 МБ.</p>
        </CardContent>
      </Card>

      {/* Variants */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Размеры и остатки</CardTitle>
          <Button variant="outline" size="sm" onClick={addVariant}>
            <Plus className="mr-1 h-4 w-4" /> Размер
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-[1fr_1fr_1fr_auto_auto] items-center gap-2 px-1 text-xs text-gray-400">
            <span>Размер</span>
            <span>Остаток</span>
            <span>+ к цене</span>
            <span>Активен</span>
            <span></span>
          </div>
          {form.variants.map((v, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto_auto] items-center gap-2">
              <div className="flex items-center gap-1">
                <GripVertical className="h-4 w-4 text-gray-300" />
                <Input value={v.size} onChange={(e) => updateVariant(i, { size: e.target.value })} placeholder="M" className="h-9" />
              </div>
              <Input type="number" value={v.stockQuantity} onChange={(e) => updateVariant(i, { stockQuantity: Number(e.target.value) })} className="h-9" />
              <Input type="number" value={v.priceModifier} onChange={(e) => updateVariant(i, { priceModifier: Number(e.target.value) })} className="h-9" />
              <div className="flex justify-center">
                <Switch checked={v.isActive} onCheckedChange={(val) => updateVariant(i, { isActive: val })} />
              </div>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-red-500" onClick={() => removeVariant(i)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2 pb-8">
        <Button variant="outline" onClick={() => router.push("/admin/merch")}>Отмена</Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Сохранить
        </Button>
      </div>
    </div>
  );
}
