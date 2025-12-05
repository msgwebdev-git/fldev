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
import { Pencil, Globe, MapPin, Phone, Mail, Clock, Link2 } from "lucide-react";

interface SiteContact {
  id: number;
  key: string;
  value: string;
  type: string;
}

interface SiteContactsTableProps {
  contacts: SiteContact[];
}

const keyLabels: Record<string, string> = {
  office_address: "Адрес офиса",
  office_hours: "Часы работы",
  main_phone: "Основной телефон",
  main_email: "Основной email",
  festival_location: "Место проведения",
  facebook: "Facebook",
  instagram: "Instagram",
  telegram: "Telegram",
  tiktok: "TikTok",
  youtube: "YouTube",
  google_maps_embed: "Google Maps (embed URL)",
};

const typeColors: Record<string, string> = {
  text: "bg-gray-100 text-gray-800",
  phone: "bg-green-100 text-green-800",
  email: "bg-blue-100 text-blue-800",
  url: "bg-purple-100 text-purple-800",
  address: "bg-orange-100 text-orange-800",
};

const typeIcons: Record<string, React.ElementType> = {
  text: Clock,
  phone: Phone,
  email: Mail,
  url: Link2,
  address: MapPin,
};

export function SiteContactsTable({ contacts }: SiteContactsTableProps) {
  const router = useRouter();
  const [editingItem, setEditingItem] = useState<SiteContact | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingItem) return;

    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const supabase = createClient();

    await supabase
      .from("site_contacts")
      .update({
        value: formData.get("value") as string,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editingItem.id);

    setIsLoading(false);
    setEditingItem(null);
    router.refresh();
  };

  if (contacts.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
        <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Нет общих контактов</p>
      </div>
    );
  }

  // Группируем контакты по типу
  const groupedContacts: Record<string, SiteContact[]> = {};
  contacts.forEach((contact) => {
    const group = contact.type || "text";
    if (!groupedContacts[group]) {
      groupedContacts[group] = [];
    }
    groupedContacts[group].push(contact);
  });

  const groupOrder = ["address", "phone", "email", "url", "text"];

  return (
    <>
      <div className="space-y-6">
        {groupOrder.map((type) => {
          const items = groupedContacts[type];
          if (!items || items.length === 0) return null;

          const Icon = typeIcons[type] || Globe;
          const groupLabels: Record<string, string> = {
            address: "Адреса",
            phone: "Телефоны",
            email: "Email",
            url: "Ссылки",
            text: "Текстовые данные",
          };

          return (
            <div key={type}>
              <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                <Icon className="w-4 h-4" />
                {groupLabels[type] || type}
              </h3>
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-48">
                        Поле
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Значение
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-24">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {items.map((contact) => (
                      <tr key={contact.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Badge className={typeColors[contact.type] || typeColors.text}>
                              {keyLabels[contact.key] || contact.key}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-gray-900 text-sm break-all">
                            {contact.value.length > 80
                              ? contact.value.substring(0, 80) + "..."
                              : contact.value}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-500 hover:text-gray-900"
                              onClick={() => setEditingItem(contact)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="bg-white border-gray-200 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-gray-900">
              Редактировать: {keyLabels[editingItem?.key || ""] || editingItem?.key}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-value" className="text-gray-700">Значение *</Label>
              {editingItem?.value && editingItem.value.length > 100 ? (
                <Textarea
                  id="edit-value"
                  name="value"
                  defaultValue={editingItem?.value}
                  required
                  rows={4}
                  className="bg-white border-gray-300 text-gray-900"
                />
              ) : (
                <Input
                  id="edit-value"
                  name="value"
                  defaultValue={editingItem?.value}
                  required
                  className="bg-white border-gray-300 text-gray-900"
                />
              )}
              {editingItem?.type === "url" && (
                <p className="text-xs text-gray-500">Введите полный URL с https://</p>
              )}
              {editingItem?.type === "phone" && (
                <p className="text-xs text-gray-500">Формат: +373 XX XXX XXX</p>
              )}
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
    </>
  );
}
