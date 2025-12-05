"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { Pencil, Trash2, Phone, Mail, MessageCircle, Briefcase, Handshake, Music, Megaphone, Monitor } from "lucide-react";

interface Contact {
  id: number;
  department_key: string;
  email: string;
  phone: string | null;
  sort_order: number;
  is_active: boolean;
}

interface ContactsTableProps {
  contacts: Contact[];
}

const departmentLabels: Record<string, string> = {
  general: "Общие вопросы",
  commercial: "Коммерческий отдел",
  partners: "Партнёрство",
  artists: "Артисты / Букинг",
  marketing: "Маркетинг",
  it: "IT / Техподдержка",
};

const departmentIcons: Record<string, React.ElementType> = {
  general: MessageCircle,
  commercial: Briefcase,
  partners: Handshake,
  artists: Music,
  marketing: Megaphone,
  it: Monitor,
};

export function ContactsTable({ contacts }: ContactsTableProps) {
  const router = useRouter();
  const [editingItem, setEditingItem] = useState<Contact | null>(null);
  const [deletingItem, setDeletingItem] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editDepartment, setEditDepartment] = useState("general");

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingItem) return;

    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const supabase = createClient();

    await supabase
      .from("contacts")
      .update({
        department_key: editDepartment,
        email: formData.get("email") as string,
        phone: (formData.get("phone") as string) || null,
        sort_order: parseInt(formData.get("sort_order") as string) || 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editingItem.id);

    setIsLoading(false);
    setEditingItem(null);
    router.refresh();
  };

  const handleToggleActive = async (contact: Contact) => {
    const supabase = createClient();
    await supabase
      .from("contacts")
      .update({
        is_active: !contact.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", contact.id);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!deletingItem) return;

    setIsLoading(true);
    const supabase = createClient();
    await supabase.from("contacts").delete().eq("id", deletingItem.id);

    setIsLoading(false);
    setDeletingItem(null);
    router.refresh();
  };

  const openEditDialog = (contact: Contact) => {
    setEditingItem(contact);
    setEditDepartment(contact.department_key);
  };

  if (contacts.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
        <Phone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Нет контактов. Добавьте первый!</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Отдел
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Телефон
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">
                Активен
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-24">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {contacts.map((contact) => {
              const Icon = departmentIcons[contact.department_key] || MessageCircle;
              return (
                <tr key={contact.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500 text-sm">
                    {contact.sort_order}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-gray-900 font-medium">
                        {departmentLabels[contact.department_key] || contact.department_key}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={`mailto:${contact.email}`}
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary"
                    >
                      <Mail className="w-4 h-4" />
                      {contact.email}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    {contact.phone ? (
                      <a
                        href={`tel:${contact.phone.replace(/\s/g, "")}`}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary"
                      >
                        <Phone className="w-4 h-4" />
                        {contact.phone}
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Switch
                      checked={contact.is_active}
                      onCheckedChange={() => handleToggleActive(contact)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-gray-900"
                        onClick={() => openEditDialog(contact)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-red-600"
                        onClick={() => setDeletingItem(contact)}
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
        <DialogContent className="bg-white border-gray-200 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Редактировать контакт</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-department" className="text-gray-700">Отдел *</Label>
              <Select value={editDepartment} onValueChange={setEditDepartment}>
                <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                  <SelectValue placeholder="Выберите отдел" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Общие вопросы</SelectItem>
                  <SelectItem value="commercial">Коммерческий отдел</SelectItem>
                  <SelectItem value="partners">Партнёрство</SelectItem>
                  <SelectItem value="artists">Артисты / Букинг</SelectItem>
                  <SelectItem value="marketing">Маркетинг</SelectItem>
                  <SelectItem value="it">IT / Техподдержка</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email" className="text-gray-700">Email *</Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                defaultValue={editingItem?.email}
                required
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-phone" className="text-gray-700">Телефон</Label>
              <Input
                id="edit-phone"
                name="phone"
                defaultValue={editingItem?.phone || ""}
                placeholder="+373 60 123 456"
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
            <DialogTitle className="text-gray-900">Удалить контакт?</DialogTitle>
          </DialogHeader>
          <p className="text-gray-500">
            Вы уверены, что хотите удалить контакт отдела &quot;{departmentLabels[deletingItem?.department_key || ""] || deletingItem?.department_key}&quot;? Это действие нельзя отменить.
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
