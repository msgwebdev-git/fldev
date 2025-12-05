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
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";

interface Ticket {
  id: string;
  name_ro: string;
  name_ru: string;
  is_active: boolean;
}

interface AddPromoCodeButtonProps {
  tickets: Ticket[];
}

export function AddPromoCodeButton({ tickets }: AddPromoCodeButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [discountType, setDiscountType] = useState<"percent" | "amount">("percent");
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [restrictToTickets, setRestrictToTickets] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const supabase = createClient();

    const { error } = await supabase.from("promo_codes").insert({
      code: (formData.get("code") as string).toUpperCase(),
      discount_percent:
        discountType === "percent"
          ? parseFloat(formData.get("discount_value") as string)
          : null,
      discount_amount:
        discountType === "amount"
          ? parseFloat(formData.get("discount_value") as string)
          : null,
      usage_limit: formData.get("usage_limit")
        ? parseInt(formData.get("usage_limit") as string)
        : null,
      valid_from: (formData.get("valid_from") as string) || null,
      valid_until: (formData.get("valid_until") as string) || null,
      is_active: formData.get("is_active") === "on",
      // New fields
      min_order_amount: formData.get("min_order_amount")
        ? parseFloat(formData.get("min_order_amount") as string)
        : null,
      allowed_ticket_ids: restrictToTickets && selectedTickets.length > 0
        ? selectedTickets
        : null,
      one_per_email: formData.get("one_per_email") === "on",
    });

    if (error) {
      console.error("Error adding promo code:", error);
      alert(`Ошибка добавления: ${error.message}`);
    }

    setIsLoading(false);
    setOpen(false);
    setSelectedTickets([]);
    setRestrictToTickets(false);
    router.refresh();
  };

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const input = document.getElementById("code") as HTMLInputElement;
    if (input) {
      input.value = code;
    }
  };

  const toggleTicket = (ticketId: string) => {
    setSelectedTickets((prev) =>
      prev.includes(ticketId)
        ? prev.filter((id) => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Добавить промо-код
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white border-gray-200 max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-gray-900">
            Добавить промо-код
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code" className="text-gray-700">
              Код *
            </Label>
            <div className="flex gap-2">
              <Input
                id="code"
                name="code"
                placeholder="SUMMER2025"
                required
                className="bg-white border-gray-300 text-gray-900 font-mono uppercase"
              />
              <Button
                type="button"
                variant="outline"
                onClick={generateCode}
                className="shrink-0"
              >
                Сгенерировать
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700">Тип скидки *</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="discount_type"
                  checked={discountType === "percent"}
                  onChange={() => setDiscountType("percent")}
                  className="text-primary"
                />
                <span className="text-gray-700">Процент</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="discount_type"
                  checked={discountType === "amount"}
                  onChange={() => setDiscountType("amount")}
                  className="text-primary"
                />
                <span className="text-gray-700">Фикс. сумма</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="discount_value" className="text-gray-700">
              {discountType === "percent" ? "Скидка (%)" : "Скидка (MDL)"} *
            </Label>
            <Input
              id="discount_value"
              name="discount_value"
              type="number"
              min="0"
              max={discountType === "percent" ? "100" : undefined}
              step="0.01"
              placeholder={discountType === "percent" ? "10" : "50"}
              required
              className="bg-white border-gray-300 text-gray-900"
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-700">Ограничения</p>

            <div className="space-y-2">
              <Label htmlFor="min_order_amount" className="text-gray-700">
                Минимальная сумма заказа (MDL)
              </Label>
              <Input
                id="min_order_amount"
                name="min_order_amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="Без ограничений"
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="usage_limit" className="text-gray-700">
                Лимит использований
              </Label>
              <Input
                id="usage_limit"
                name="usage_limit"
                type="number"
                min="1"
                placeholder="Без ограничений"
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="one_per_email"
                name="one_per_email"
              />
              <Label htmlFor="one_per_email" className="text-gray-700">
                Один раз на email
              </Label>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="restrict_tickets"
                  checked={restrictToTickets}
                  onCheckedChange={(checked) => {
                    setRestrictToTickets(checked as boolean);
                    if (!checked) setSelectedTickets([]);
                  }}
                />
                <Label htmlFor="restrict_tickets" className="text-gray-700">
                  Только для определённых билетов
                </Label>
              </div>

              {restrictToTickets && (
                <div className="ml-6 space-y-2 p-3 bg-gray-50 rounded-lg">
                  {tickets.map((ticket) => (
                    <div key={ticket.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`ticket-${ticket.id}`}
                        checked={selectedTickets.includes(ticket.id)}
                        onCheckedChange={() => toggleTicket(ticket.id)}
                      />
                      <Label
                        htmlFor={`ticket-${ticket.id}`}
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
              <Label htmlFor="valid_from" className="text-gray-700">
                Действует с
              </Label>
              <Input
                id="valid_from"
                name="valid_from"
                type="datetime-local"
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valid_until" className="text-gray-700">
                Действует до
              </Label>
              <Input
                id="valid_until"
                name="valid_until"
                type="datetime-local"
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="is_active" name="is_active" defaultChecked />
            <Label htmlFor="is_active" className="text-gray-700">
              Активный
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
