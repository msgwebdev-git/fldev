"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
import { Pencil, Trash2, Handshake, ExternalLink } from "lucide-react";

interface Partner {
  id: number;
  name: string;
  logo_url: string | null;
  website: string | null;
  category: string;
  year: string;
  sort_order: number;
}

interface PartnersTableProps {
  partners: Partner[];
}

const categoryLabels: Record<string, string> = {
  patronage: "Патронаж",
  generalPartner: "Генеральный партнёр",
  partners: "Партнёры",
  generalMediaPartner: "Генеральный медиа-партнёр",
  mediaPartners: "Медиа-партнёры",
};

const categoryColors: Record<string, string> = {
  patronage: "bg-yellow-100 text-yellow-800 border-yellow-200",
  generalPartner: "bg-blue-100 text-blue-800 border-blue-200",
  partners: "bg-green-100 text-green-800 border-green-200",
  generalMediaPartner: "bg-purple-100 text-purple-800 border-purple-200",
  mediaPartners: "bg-pink-100 text-pink-800 border-pink-200",
};

export function PartnersTable({ partners }: PartnersTableProps) {
  const router = useRouter();
  const [editingItem, setEditingItem] = useState<Partner | null>(null);
  const [deletingItem, setDeletingItem] = useState<Partner | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editCategory, setEditCategory] = useState("partners");
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Группируем по категориям
  const partnersByCategory: Record<string, Partner[]> = {};
  partners.forEach((partner) => {
    if (!partnersByCategory[partner.category]) {
      partnersByCategory[partner.category] = [];
    }
    partnersByCategory[partner.category].push(partner);
  });

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingItem) return;

    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const supabase = createClient();

    let logoUrl = formData.get("logo_url") as string;

    // Если есть новый файл изображения
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

    const { error } = await supabase
      .from("partners")
      .update({
        name: formData.get("name") as string,
        logo_url: logoUrl || null,
        website: formData.get("website") as string || null,
        category: editCategory,
        sort_order: parseInt(formData.get("sort_order") as string) || 0,
      })
      .eq("id", editingItem.id);

    if (error) {
      console.error("Error updating partner:", error);
      alert(`Ошибка обновления партнера: ${error.message || JSON.stringify(error)}`);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    setEditingItem(null);
    setImageFile(null);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!deletingItem) return;

    setIsLoading(true);
    const supabase = createClient();

    await supabase.from("partners").delete().eq("id", deletingItem.id);

    setIsLoading(false);
    setDeletingItem(null);
    router.refresh();
  };

  const openEditDialog = (partner: Partner) => {
    setEditingItem(partner);
    setEditCategory(partner.category);
  };

  if (partners.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
        <Handshake className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Нет партнёров. Добавьте первого!</p>
      </div>
    );
  }

  const renderPartnerRow = (partner: Partner) => (
    <tr key={partner.id} className="hover:bg-gray-50">
      <td className="px-4 py-3">
        <div className="relative w-20 h-12 rounded-lg overflow-hidden bg-gray-100">
          {partner.logo_url ? (
            <Image
              src={partner.logo_url}
              alt={partner.name}
              fill
              className="object-contain p-1"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Handshake className="w-6 h-6" />
            </div>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-gray-900 font-medium">{partner.name}</span>
          {partner.website && (
            <a
              href={partner.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-600"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <Badge className={categoryColors[partner.category] || "bg-gray-100 text-gray-800"}>
          {categoryLabels[partner.category] || partner.category}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <span className="text-gray-500 text-sm">{partner.sort_order}</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-500 hover:text-gray-900"
            onClick={() => openEditDialog(partner)}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-500 hover:text-red-600"
            onClick={() => setDeletingItem(partner)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  );

  return (
    <>
      {Object.keys(partnersByCategory).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(partnersByCategory).map(([category, categoryPartners]) => (
            <div key={category}>
              <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                <Badge className={categoryColors[category] || "bg-gray-100"}>
                  {categoryLabels[category] || category}
                </Badge>
                <span>({categoryPartners.length})</span>
              </h3>
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">
                        Лого
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Название
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-48">
                        Категория
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
                    {categoryPartners
                      .sort((a, b) => a.sort_order - b.sort_order)
                      .map(renderPartnerRow)}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <Handshake className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Нет партнёров. Добавьте первого!</p>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="bg-white border-gray-200 max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Редактировать партнёра</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-gray-700">Название *</Label>
              <Input
                id="edit-name"
                name="name"
                defaultValue={editingItem?.name}
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
                  <SelectItem value="patronage">Патронаж</SelectItem>
                  <SelectItem value="generalPartner">Генеральный партнёр</SelectItem>
                  <SelectItem value="partners">Партнёры</SelectItem>
                  <SelectItem value="generalMediaPartner">Генеральный медиа-партнёр</SelectItem>
                  <SelectItem value="mediaPartners">Медиа-партнёры</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-website" className="text-gray-700">Сайт</Label>
              <Input
                id="edit-website"
                name="website"
                defaultValue={editingItem?.website || ""}
                placeholder="https://example.com"
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700">Логотип</Label>
              {editingItem?.logo_url && (
                <div className="relative w-32 h-20 rounded-lg overflow-hidden bg-gray-100 mb-2">
                  <Image
                    src={editingItem.logo_url}
                    alt={editingItem.name}
                    fill
                    className="object-contain p-2"
                  />
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="bg-white border-gray-300 text-gray-900"
              />
              <p className="text-xs text-gray-500">Или укажите URL:</p>
              <Input
                id="edit-logo_url"
                name="logo_url"
                defaultValue={editingItem?.logo_url || ""}
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-sort_order" className="text-gray-700">Порядок сортировки</Label>
              <Input
                id="edit-sort_order"
                name="sort_order"
                type="number"
                defaultValue={editingItem?.sort_order || 0}
                className="bg-white border-gray-300 text-gray-900"
              />
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingItem} onOpenChange={() => setDeletingItem(null)}>
        <DialogContent className="bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Удалить партнёра?</DialogTitle>
          </DialogHeader>
          <p className="text-gray-500">
            Вы уверены, что хотите удалить &quot;{deletingItem?.name}&quot;? Это действие нельзя отменить.
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
