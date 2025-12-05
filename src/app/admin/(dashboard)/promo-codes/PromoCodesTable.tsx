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
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Pencil, Trash2, Percent, Copy, Check, Mail, Ticket, ShoppingCart } from "lucide-react";

interface PromoCode {
  id: string;
  code: string;
  discount_percent: number | null;
  discount_amount: number | null;
  usage_limit: number | null;
  used_count: number;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
  min_order_amount: number | null;
  allowed_ticket_ids: string[] | null;
  one_per_email: boolean;
}

interface TicketInfo {
  id: string;
  name_ro: string;
  name_ru: string;
  is_active: boolean;
}

interface PromoCodesTableProps {
  promoCodes: PromoCode[];
  tickets: TicketInfo[];
}

export function PromoCodesTable({ promoCodes, tickets }: PromoCodesTableProps) {
  const router = useRouter();
  const [editingItem, setEditingItem] = useState<PromoCode | null>(null);
  const [deletingItem, setDeletingItem] = useState<PromoCode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: "",
    discount_percent: "",
    discount_amount: "",
    usage_limit: "",
    valid_from: "",
    valid_until: "",
    is_active: true,
    min_order_amount: "",
    one_per_email: false,
  });
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [restrictToTickets, setRestrictToTickets] = useState(false);

  const ticketsMap = new Map(tickets.map((t) => [t.id, t]));

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingItem) return;

    setIsLoading(true);
    const supabase = createClient();

    const updateData = {
      code: formData.code.toUpperCase(),
      discount_percent: formData.discount_percent
        ? parseFloat(formData.discount_percent)
        : null,
      discount_amount: formData.discount_amount
        ? parseFloat(formData.discount_amount)
        : null,
      usage_limit: formData.usage_limit
        ? parseInt(formData.usage_limit)
        : null,
      valid_from: formData.valid_from || null,
      valid_until: formData.valid_until || null,
      is_active: formData.is_active,
      min_order_amount: formData.min_order_amount
        ? parseFloat(formData.min_order_amount)
        : null,
      allowed_ticket_ids: restrictToTickets && selectedTickets.length > 0
        ? selectedTickets
        : null,
      one_per_email: formData.one_per_email,
    };

    const { error } = await supabase
      .from("promo_codes")
      .update(updateData)
      .eq("id", editingItem.id);

    if (error) {
      console.error("Error updating promo code:", error);
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

    await supabase.from("promo_codes").delete().eq("id", deletingItem.id);

    setIsLoading(false);
    setDeletingItem(null);
    router.refresh();
  };

  const openEditDialog = (promo: PromoCode) => {
    setEditingItem(promo);
    setFormData({
      code: promo.code || "",
      discount_percent: promo.discount_percent?.toString() || "",
      discount_amount: promo.discount_amount?.toString() || "",
      usage_limit: promo.usage_limit?.toString() || "",
      valid_from: promo.valid_from
        ? new Date(promo.valid_from).toISOString().slice(0, 16)
        : "",
      valid_until: promo.valid_until
        ? new Date(promo.valid_until).toISOString().slice(0, 16)
        : "",
      is_active: promo.is_active,
      min_order_amount: promo.min_order_amount?.toString() || "",
      one_per_email: promo.one_per_email || false,
    });
    setSelectedTickets(promo.allowed_ticket_ids || []);
    setRestrictToTickets(!!promo.allowed_ticket_ids && promo.allowed_ticket_ids.length > 0);
  };

  const toggleTicket = (ticketId: string) => {
    setSelectedTickets((prev) =>
      prev.includes(ticketId)
        ? prev.filter((id) => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatus = (promo: PromoCode) => {
    if (!promo.is_active) {
      return { label: "Неактивен", className: "bg-gray-100 text-gray-800" };
    }

    const now = new Date();
    if (promo.valid_until && new Date(promo.valid_until) < now) {
      return { label: "Истёк", className: "bg-red-100 text-red-800" };
    }
    if (promo.valid_from && new Date(promo.valid_from) > now) {
      return { label: "Ожидает", className: "bg-yellow-100 text-yellow-800" };
    }
    if (promo.usage_limit && promo.used_count >= promo.usage_limit) {
      return { label: "Лимит", className: "bg-orange-100 text-orange-800" };
    }

    return { label: "Активен", className: "bg-green-100 text-green-800" };
  };

  const getRestrictionIcons = (promo: PromoCode) => {
    const icons = [];

    if (promo.one_per_email) {
      icons.push(
        <TooltipProvider key="email">
          <Tooltip>
            <TooltipTrigger>
              <Mail className="w-4 h-4 text-blue-500" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Один раз на email</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    if (promo.allowed_ticket_ids && promo.allowed_ticket_ids.length > 0) {
      const ticketNames = promo.allowed_ticket_ids
        .map((id) => ticketsMap.get(id)?.name_ru)
        .filter(Boolean)
        .join(", ");
      icons.push(
        <TooltipProvider key="tickets">
          <Tooltip>
            <TooltipTrigger>
              <Ticket className="w-4 h-4 text-purple-500" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Только: {ticketNames}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    if (promo.min_order_amount) {
      icons.push(
        <TooltipProvider key="min">
          <Tooltip>
            <TooltipTrigger>
              <ShoppingCart className="w-4 h-4 text-orange-500" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Мин. сумма: {promo.min_order_amount} MDL</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return icons;
  };

  if (promoCodes.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
        <Percent className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Нет промо-кодов. Добавьте первый!</p>
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
                Код
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">
                Скидка
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">
                Использовано
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-28">
                Ограничения
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">
                Действует до
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">
                Статус
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-24">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {promoCodes.map((promo) => {
              const status = getStatus(promo);
              const restrictionIcons = getRestrictionIcons(promo);

              return (
                <tr key={promo.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <code className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                        {promo.code}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-gray-400 hover:text-gray-600"
                        onClick={() => copyCode(promo.code)}
                      >
                        {copiedCode === promo.code ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {promo.discount_percent ? (
                      <span className="font-medium text-gray-900">
                        {promo.discount_percent}%
                      </span>
                    ) : promo.discount_amount ? (
                      <span className="font-medium text-gray-900">
                        {promo.discount_amount} MDL
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-900">
                      {promo.used_count}
                      {promo.usage_limit && (
                        <span className="text-gray-400">
                          {" "}
                          / {promo.usage_limit}
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {restrictionIcons.length > 0 ? (
                        restrictionIcons
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatDate(promo.valid_until)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={status.className}>{status.label}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-gray-900"
                        onClick={() => openEditDialog(promo)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-red-600"
                        onClick={() => setDeletingItem(promo)}
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
        <DialogContent className="bg-white border-gray-200 max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-900">
              Редактировать промо-код
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-code" className="text-gray-700">
                Код *
              </Label>
              <Input
                id="edit-code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value.toUpperCase() })
                }
                required
                className="bg-white border-gray-300 text-gray-900 font-mono uppercase"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-discount_percent" className="text-gray-700">
                  Скидка (%)
                </Label>
                <Input
                  id="edit-discount_percent"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.discount_percent}
                  onChange={(e) =>
                    setFormData({ ...formData, discount_percent: e.target.value })
                  }
                  className="bg-white border-gray-300 text-gray-900"
                  disabled={!!formData.discount_amount}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-discount_amount" className="text-gray-700">
                  Скидка (MDL)
                </Label>
                <Input
                  id="edit-discount_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.discount_amount}
                  onChange={(e) =>
                    setFormData({ ...formData, discount_amount: e.target.value })
                  }
                  className="bg-white border-gray-300 text-gray-900"
                  disabled={!!formData.discount_percent}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <p className="text-sm font-medium text-gray-700">Ограничения</p>

              <div className="space-y-2">
                <Label htmlFor="edit-min_order_amount" className="text-gray-700">
                  Минимальная сумма заказа (MDL)
                </Label>
                <Input
                  id="edit-min_order_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.min_order_amount}
                  onChange={(e) =>
                    setFormData({ ...formData, min_order_amount: e.target.value })
                  }
                  placeholder="Без ограничений"
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-usage_limit" className="text-gray-700">
                  Лимит использований
                </Label>
                <Input
                  id="edit-usage_limit"
                  type="number"
                  min="0"
                  value={formData.usage_limit}
                  onChange={(e) =>
                    setFormData({ ...formData, usage_limit: e.target.value })
                  }
                  placeholder="Без ограничений"
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-one_per_email"
                  checked={formData.one_per_email}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, one_per_email: checked as boolean })
                  }
                />
                <Label htmlFor="edit-one_per_email" className="text-gray-700">
                  Один раз на email
                </Label>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-restrict_tickets"
                    checked={restrictToTickets}
                    onCheckedChange={(checked) => {
                      setRestrictToTickets(checked as boolean);
                      if (!checked) setSelectedTickets([]);
                    }}
                  />
                  <Label htmlFor="edit-restrict_tickets" className="text-gray-700">
                    Только для определённых билетов
                  </Label>
                </div>

                {restrictToTickets && (
                  <div className="ml-6 space-y-2 p-3 bg-gray-50 rounded-lg">
                    {tickets.map((ticket) => (
                      <div key={ticket.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-ticket-${ticket.id}`}
                          checked={selectedTickets.includes(ticket.id)}
                          onCheckedChange={() => toggleTicket(ticket.id)}
                        />
                        <Label
                          htmlFor={`edit-ticket-${ticket.id}`}
                          className={`text-sm ${ticket.is_active ? "text-gray-700" : "text-gray-400"}`}
                        >
                          {ticket.name_ru}
                          {!ticket.is_active && " (неактивен)"}
                        </Label>
                      </div>
                    ))}
                    {tickets.length === 0 && (
                      <p className="text-sm text-gray-400">Нет доступных билетов</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-valid_from" className="text-gray-700">
                  Действует с
                </Label>
                <Input
                  id="edit-valid_from"
                  type="datetime-local"
                  value={formData.valid_from}
                  onChange={(e) =>
                    setFormData({ ...formData, valid_from: e.target.value })
                  }
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-valid_until" className="text-gray-700">
                  Действует до
                </Label>
                <Input
                  id="edit-valid_until"
                  type="datetime-local"
                  value={formData.valid_until}
                  onChange={(e) =>
                    setFormData({ ...formData, valid_until: e.target.value })
                  }
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: checked as boolean })
                }
              />
              <Label htmlFor="edit-is_active" className="text-gray-700">
                Активный
              </Label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setEditingItem(null)}
              >
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
            <DialogTitle className="text-gray-900">
              Удалить промо-код?
            </DialogTitle>
          </DialogHeader>
          <p className="text-gray-500">
            Вы уверены, что хотите удалить промо-код{" "}
            <code className="font-mono font-bold">{deletingItem?.code}</code>?
            Это действие нельзя отменить.
          </p>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDeletingItem(null)}
            >
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
