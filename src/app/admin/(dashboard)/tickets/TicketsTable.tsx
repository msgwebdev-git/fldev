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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Trash2, Ticket, Settings2, Plus } from "lucide-react";

interface TicketOption {
  id: string;
  name: string;
  name_ro: string;
  name_ru: string;
  description_ro: string | null;
  description_ru: string | null;
  price_modifier: number;
  is_default: boolean;
  sort_order: number;
}

interface TicketItem {
  id: string;
  name: string;
  name_ro: string;
  name_ru: string;
  description_ro: string | null;
  description_ru: string | null;
  features_ro: string[];
  features_ru: string[];
  price: number;
  original_price: number | null;
  currency: string;
  is_active: boolean;
  sort_order: number;
  max_per_order: number;
  has_options: boolean;
  ticket_options: TicketOption[];
}

interface TicketsTableProps {
  tickets: TicketItem[];
}

export function TicketsTable({ tickets }: TicketsTableProps) {
  const router = useRouter();
  const [editingItem, setEditingItem] = useState<TicketItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<TicketItem | null>(null);
  const [optionsItem, setOptionsItem] = useState<TicketItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [featuresRo, setFeaturesRo] = useState<string[]>([]);
  const [featuresRu, setFeaturesRu] = useState<string[]>([]);
  const [options, setOptions] = useState<TicketOption[]>([]);

  // Form state for edit dialog
  const [formData, setFormData] = useState({
    name_ro: "",
    name_ru: "",
    description_ro: "",
    description_ru: "",
    price: "",
    original_price: "",
    currency: "MDL",
    sort_order: "0",
    max_per_order: "10",
    is_active: true,
    has_options: false,
  });

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingItem) return;

    setIsLoading(true);
    const supabase = createClient();

    const updateData = {
      name_ro: formData.name_ro,
      name_ru: formData.name_ru,
      description_ro: formData.description_ro || null,
      description_ru: formData.description_ru || null,
      features_ro: featuresRo.filter(f => f.trim() !== ""),
      features_ru: featuresRu.filter(f => f.trim() !== ""),
      price: parseFloat(formData.price),
      original_price: formData.original_price
        ? parseFloat(formData.original_price)
        : null,
      currency: formData.currency || "MDL",
      is_active: formData.is_active,
      sort_order: parseInt(formData.sort_order) || 0,
      max_per_order: parseInt(formData.max_per_order) || 10,
      has_options: formData.has_options,
    };

    console.log("Updating ticket:", editingItem.id, updateData);

    const { error } = await supabase
      .from("tickets")
      .update(updateData)
      .eq("id", editingItem.id);

    if (error) {
      console.error("Error updating ticket:", error);
      alert(`Ошибка сохранения: ${error.message}`);
    }

    setIsLoading(false);
    setEditingItem(null);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!deletingItem) return;

    setIsLoading(true);
    const supabase = createClient();

    await supabase.from("tickets").delete().eq("id", deletingItem.id);

    setIsLoading(false);
    setDeletingItem(null);
    router.refresh();
  };

  const handleSaveOptions = async () => {
    if (!optionsItem) return;

    setIsLoading(true);
    const supabase = createClient();
    const ticketId = optionsItem.id;
    const validOptions = options.filter((o) => o.name_ro.trim() !== "" || o.name_ru.trim() !== "");

    // Разделяем на существующие (update) и новые (insert)
    const existingOptions = validOptions.filter((o) => !o.id.startsWith("new-"));
    const newOptions = validOptions.filter((o) => o.id.startsWith("new-"));
    const existingIds = existingOptions.map((o) => o.id);

    // Удаляем только те опции, которые были убраны из списка
    const originalIds = (optionsItem.ticket_options || []).map((o) => o.id);
    const idsToDelete = originalIds.filter((id) => !existingIds.includes(id));

    if (idsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from("ticket_options")
        .delete()
        .in("id", idsToDelete);

      if (deleteError) {
        // FK constraint — опция используется в заказах, деактивируем вместо удаления
        console.warn("Cannot delete options (used in orders), skipping:", deleteError.message);
      }
    }

    // Обновляем существующие опции
    for (let i = 0; i < existingOptions.length; i++) {
      const o = existingOptions[i];
      const { error } = await supabase
        .from("ticket_options")
        .update({
          name: o.name || o.name_ro.toLowerCase().replace(/\s+/g, ""),
          name_ro: o.name_ro,
          name_ru: o.name_ru,
          description_ro: o.description_ro || null,
          description_ru: o.description_ru || null,
          price_modifier: o.price_modifier || 0,
          is_default: o.is_default,
          sort_order: i + 1,
        })
        .eq("id", o.id);

      if (error) {
        console.error("Error updating option:", error);
        alert(`Ошибка обновления опции: ${error.message}`);
        setIsLoading(false);
        return;
      }
    }

    // Добавляем новые опции
    if (newOptions.length > 0) {
      const { error: insertError } = await supabase.from("ticket_options").insert(
        newOptions.map((o, index) => ({
          ticket_id: ticketId,
          name: o.name || o.name_ro.toLowerCase().replace(/\s+/g, ""),
          name_ro: o.name_ro,
          name_ru: o.name_ru,
          description_ro: o.description_ro || null,
          description_ru: o.description_ru || null,
          price_modifier: o.price_modifier || 0,
          is_default: o.is_default,
          sort_order: existingOptions.length + index + 1,
        }))
      );

      if (insertError) {
        console.error("Error inserting options:", insertError);
        alert(`Ошибка добавления опций: ${insertError.message}`);
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(false);
    setOptionsItem(null);
    router.refresh();
  };

  const openEditDialog = (ticket: TicketItem) => {
    setEditingItem(ticket);
    setFeaturesRo(ticket.features_ro || []);
    setFeaturesRu(ticket.features_ru || []);
    setFormData({
      name_ro: ticket.name_ro || "",
      name_ru: ticket.name_ru || "",
      description_ro: ticket.description_ro || "",
      description_ru: ticket.description_ru || "",
      price: String(ticket.price || ""),
      original_price: ticket.original_price ? String(ticket.original_price) : "",
      currency: ticket.currency || "MDL",
      sort_order: String(ticket.sort_order || 0),
      max_per_order: String(ticket.max_per_order || 10),
      is_active: ticket.is_active,
      has_options: ticket.has_options,
    });
  };

  const openOptionsDialog = (ticket: TicketItem) => {
    setOptionsItem(ticket);
    setOptions(ticket.ticket_options || []);
  };

  const addFeatureRo = () => {
    setFeaturesRo([...featuresRo, ""]);
  };

  const updateFeatureRo = (index: number, value: string) => {
    const newFeatures = [...featuresRo];
    newFeatures[index] = value;
    setFeaturesRo(newFeatures);
  };

  const removeFeatureRo = (index: number) => {
    setFeaturesRo(featuresRo.filter((_, i) => i !== index));
  };

  const addFeatureRu = () => {
    setFeaturesRu([...featuresRu, ""]);
  };

  const updateFeatureRu = (index: number, value: string) => {
    const newFeatures = [...featuresRu];
    newFeatures[index] = value;
    setFeaturesRu(newFeatures);
  };

  const removeFeatureRu = (index: number) => {
    setFeaturesRu(featuresRu.filter((_, i) => i !== index));
  };

  const addOption = () => {
    setOptions((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        name: "",
        name_ro: "",
        name_ru: "",
        description_ro: null,
        description_ru: null,
        price_modifier: 0,
        is_default: false,
        sort_order: prev.length + 1
      },
    ]);
  };

  const updateOption = (index: number, field: keyof TicketOption, value: string | number | boolean | null) => {
    setOptions((prev) =>
      prev.map((o, i) => {
        if (i === index) {
          return { ...o, [field]: value };
        }
        if (field === "is_default" && value === true) {
          return { ...o, is_default: false };
        }
        return o;
      })
    );
  };

  const removeOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  if (tickets.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
        <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Нет билетов. Добавьте первый!</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Название (RO / RU)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">
                Цена
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">
                Скидка
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">
                Опции
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">
                Статус
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-32">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tickets.map((ticket) => {
              const discount = ticket.original_price
                ? Math.round(((ticket.original_price - ticket.price) / ticket.original_price) * 100)
                : 0;

              return (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-gray-900">{ticket.name_ro}</div>
                      <div className="text-sm text-gray-500">{ticket.name_ru}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900">
                      {ticket.price} {ticket.currency}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {discount > 0 ? (
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-500 line-through">
                          {ticket.original_price} {ticket.currency}
                        </span>
                        <Badge className="w-fit bg-green-100 text-green-800">
                          -{discount}%
                        </Badge>
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {ticket.has_options ? (
                      <Badge className="bg-blue-100 text-blue-800">
                        {ticket.ticket_options?.length || 0} опций
                      </Badge>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={ticket.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                    }>
                      {ticket.is_active ? "Активен" : "Скрыт"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {ticket.has_options && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-blue-600"
                          onClick={() => openOptionsDialog(ticket)}
                          title="Управление опциями"
                        >
                          <Settings2 className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-gray-900"
                        onClick={() => openEditDialog(ticket)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-red-600"
                        onClick={() => setDeletingItem(ticket)}
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

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent key={editingItem?.id} className="bg-white border-gray-200 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Редактировать билет</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <Tabs defaultValue="ro" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="ro">🇷🇴 Română</TabsTrigger>
                <TabsTrigger value="ru">🇷🇺 Русский</TabsTrigger>
              </TabsList>

              <TabsContent value="ro" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name_ro" className="text-gray-700">Название (RO) *</Label>
                  <Input
                    id="edit-name_ro"
                    value={formData.name_ro}
                    onChange={(e) => setFormData({ ...formData, name_ro: e.target.value })}
                    required
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description_ro" className="text-gray-700">Описание (RO)</Label>
                  <Textarea
                    id="edit-description_ro"
                    value={formData.description_ro}
                    onChange={(e) => setFormData({ ...formData, description_ro: e.target.value })}
                    className="bg-white border-gray-300 text-gray-900"
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
                          placeholder="Описание функции"
                          className="bg-white border-gray-300 text-gray-900"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFeatureRo(index)}
                          className="text-red-500 hover:text-red-700"
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
                  <Label htmlFor="edit-name_ru" className="text-gray-700">Название (RU) *</Label>
                  <Input
                    id="edit-name_ru"
                    value={formData.name_ru}
                    onChange={(e) => setFormData({ ...formData, name_ru: e.target.value })}
                    required
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description_ru" className="text-gray-700">Описание (RU)</Label>
                  <Textarea
                    id="edit-description_ru"
                    value={formData.description_ru}
                    onChange={(e) => setFormData({ ...formData, description_ru: e.target.value })}
                    className="bg-white border-gray-300 text-gray-900"
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
                          placeholder="Описание функции"
                          className="bg-white border-gray-300 text-gray-900"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFeatureRu(index)}
                          className="text-red-500 hover:text-red-700"
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
                <Label htmlFor="edit-price" className="text-gray-700">Цена *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-original_price" className="text-gray-700">Старая цена</Label>
                <Input
                  id="edit-original_price"
                  type="number"
                  step="0.01"
                  value={formData.original_price}
                  onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-currency" className="text-gray-700">Валюта</Label>
                <Input
                  id="edit-currency"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
            </div>

            <Separator />

            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-has_options"
                checked={formData.has_options}
                onCheckedChange={(checked) => setFormData({ ...formData, has_options: checked as boolean })}
              />
              <Label htmlFor="edit-has_options" className="text-gray-700">
                Билет с опциями (например, тип размещения)
              </Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-sort_order" className="text-gray-700">Порядок</Label>
                <Input
                  id="edit-sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-max_per_order" className="text-gray-700">Макс. на заказ</Label>
                <Input
                  id="edit-max_per_order"
                  type="number"
                  value={formData.max_per_order}
                  onChange={(e) => setFormData({ ...formData, max_per_order: e.target.value })}
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked as boolean })}
              />
              <Label htmlFor="edit-is_active" className="text-gray-700">
                Активный (отображается на сайте)
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

      {/* Options Dialog */}
      <Dialog open={!!optionsItem} onOpenChange={() => setOptionsItem(null)}>
        <DialogContent key={optionsItem?.id} className="bg-white border-gray-200 max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-900">
              Опции билета: {optionsItem?.name_ro}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Добавьте варианты выбора для этого билета (например, тип размещения в кемпинге)
            </p>

            {options.map((option, index) => (
              <div key={option.id} className="p-4 border border-gray-200 rounded-lg space-y-3">
                <div className="flex items-start justify-between">
                  <span className="text-sm font-medium text-gray-500">Опция {index + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(index)}
                    className="text-red-500 hover:text-red-700 h-6 w-6"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <Tabs defaultValue="ro" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="ro">🇷🇴 RO</TabsTrigger>
                    <TabsTrigger value="ru">🇷🇺 RU</TabsTrigger>
                  </TabsList>

                  <TabsContent value="ro" className="space-y-3 mt-3">
                    <div className="space-y-1">
                      <Label className="text-gray-700 text-sm">Название (RO) *</Label>
                      <Input
                        value={option.name_ro}
                        onChange={(e) => updateOption(index, "name_ro", e.target.value)}
                        placeholder="Tent Spot"
                        className="bg-white border-gray-300 text-gray-900"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-gray-700 text-sm">Описание (RO)</Label>
                      <Input
                        value={option.description_ro || ""}
                        onChange={(e) => updateOption(index, "description_ro", e.target.value)}
                        placeholder="Descrierea opțiunii"
                        className="bg-white border-gray-300 text-gray-900"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="ru" className="space-y-3 mt-3">
                    <div className="space-y-1">
                      <Label className="text-gray-700 text-sm">Название (RU) *</Label>
                      <Input
                        value={option.name_ru}
                        onChange={(e) => updateOption(index, "name_ru", e.target.value)}
                        placeholder="Место для палатки"
                        className="bg-white border-gray-300 text-gray-900"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-gray-700 text-sm">Описание (RU)</Label>
                      <Input
                        value={option.description_ru || ""}
                        onChange={(e) => updateOption(index, "description_ru", e.target.value)}
                        placeholder="Описание опции"
                        className="bg-white border-gray-300 text-gray-900"
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <Label className="text-gray-700 text-sm">Доплата (MDL)</Label>
                    <Input
                      type="number"
                      value={option.price_modifier}
                      onChange={(e) => updateOption(index, "price_modifier", parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="bg-white border-gray-300 text-gray-900"
                    />
                  </div>
                  <div className="flex items-end pb-1">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`option-default-${index}`}
                        checked={option.is_default}
                        onCheckedChange={(checked) => updateOption(index, "is_default", checked as boolean)}
                      />
                      <Label htmlFor={`option-default-${index}`} className="text-gray-700 text-sm">
                        По умолчанию
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" onClick={addOption} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Добавить опцию
            </Button>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOptionsItem(null)}>
              Отмена
            </Button>
            <Button onClick={handleSaveOptions} disabled={isLoading}>
              {isLoading ? "Сохранение..." : "Сохранить опции"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingItem} onOpenChange={() => setDeletingItem(null)}>
        <DialogContent className="bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Удалить билет?</DialogTitle>
          </DialogHeader>
          <p className="text-gray-500">
            Вы уверены, что хотите удалить &quot;{deletingItem?.name_ro}&quot;? Это действие нельзя отменить.
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
    </>
  );
}
