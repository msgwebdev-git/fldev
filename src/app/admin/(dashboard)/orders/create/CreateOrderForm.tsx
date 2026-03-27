"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ShoppingBag, Trophy, PenLine, Plus, Minus, Loader2, CheckCircle, X } from "lucide-react";

interface TicketOption {
  id: string;
  name_ro: string;
  name_ru: string;
  price_modifier: number;
  is_default: boolean;
}

interface Ticket {
  id: string;
  name_ro: string;
  name_ru: string;
  price: number;
  is_active: boolean;
  has_options: boolean;
  ticket_options: TicketOption[];
}

interface CreateOrderFormProps {
  tickets: Ticket[];
}

interface OrderItem {
  ticketId: string;
  optionId?: string;
  quantity: number;
}

type OrderSource = "offline" | "giveaway" | "manual";

export function CreateOrderForm({ tickets }: CreateOrderFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [source, setSource] = useState<OrderSource>("manual");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [language, setLanguage] = useState<"ro" | "ru">("ro");
  const [items, setItems] = useState<OrderItem[]>([
    { ticketId: "", quantity: 1 },
  ]);

  const isGiveaway = source === "giveaway";
  const isFree = isGiveaway;
  const SourceIcon = isGiveaway ? Trophy : source === "offline" ? ShoppingBag : PenLine;

  const addItem = () => {
    setItems([...items, { ticketId: "", quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, updates: Partial<OrderItem>) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], ...updates };
    if (updates.ticketId) {
      newItems[index].optionId = undefined;
    }
    setItems(newItems);
  };

  const getTicketById = (id: string) => tickets.find((t) => t.id === id);

  // Calculate total
  const total = items.reduce((sum, item) => {
    if (isFree) return 0;
    const ticket = getTicketById(item.ticketId);
    if (!ticket) return sum;
    let price = ticket.price;
    if (item.optionId) {
      const opt = ticket.ticket_options?.find((o) => o.id === item.optionId);
      if (opt) price += opt.price_modifier;
    }
    return sum + price * item.quantity;
  }, 0);

  const pollJobProgress = async (jobId: string, orderNumber: string) => {
    const maxAttempts = 120;
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      try {
        const res = await fetch(`/api/admin/invitations/job/${jobId}`);
        if (!res.ok) continue;
        const data = await res.json();

        if (data.status === "completed") {
          setSuccess(
            `Заказ ${orderNumber}: ${data.sent} билетов создано и отправлено на ${email}`
          );
          return;
        }
        if (data.status === "failed") {
          setError(`Ошибка генерации билетов. Создано: ${data.sent}, ошибок: ${data.failed}`);
          return;
        }
        setSuccess(`Заказ ${orderNumber}: генерация билетов ${data.processed}/${data.total}...`);
      } catch {
        // retry
      }
    }
    setSuccess(`Заказ ${orderNumber} создан. Билеты генерируются на сервере.`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError("Заполните имя, фамилию и email");
      setLoading(false);
      return;
    }

    const validItems = items.filter((item) => item.ticketId && item.quantity > 0);
    if (validItems.length === 0) {
      setError("Добавьте хотя бы один билет");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/admin/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            phone: phone.trim() || undefined,
          },
          items: validItems.map((item) => ({
            ticketId: item.ticketId,
            optionId: item.optionId || undefined,
            quantity: item.quantity,
          })),
          source,
          language,
          note: note.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create order");
      }

      if (data.jobId) {
        setSuccess(`Заказ ${data.orderNumber} создан. Генерация билетов...`);
        await pollJobProgress(data.jobId, data.orderNumber);
      } else {
        setSuccess(`Заказ ${data.orderNumber} создан и отправлен на ${email}`);
      }

      // Reset form
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setNote("");
      setItems([{ ticketId: "", quantity: 1 }]);

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при создании заказа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Header with source toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isGiveaway ? "bg-purple-50" : "bg-blue-50"}`}>
            <SourceIcon className={`w-5 h-5 ${isGiveaway ? "text-purple-600" : "text-blue-600"}`} />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            {source === "giveaway" ? "Розыгрыш" : source === "offline" ? "Оффлайн продажа" : "Ручной заказ"}
          </h2>
        </div>

        <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
          <button
            type="button"
            onClick={() => setSource("manual")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              source === "manual"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <PenLine className="w-4 h-4 inline mr-1.5" />
            Вручную
          </button>
          <button
            type="button"
            onClick={() => setSource("offline")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              source === "offline"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <ShoppingBag className="w-4 h-4 inline mr-1.5" />
            Оффлайн
          </button>
          <button
            type="button"
            onClick={() => setSource("giveaway")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              source === "giveaway"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Trophy className="w-4 h-4 inline mr-1.5" />
            Розыгрыш
          </button>
        </div>
      </div>

      {/* Source description */}
      <div className={`mb-6 p-3 rounded-lg text-sm ${isGiveaway ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700"}`}>
        {source === "giveaway"
          ? "Бесплатный билет за конкурс/розыгрыш. Не учитывается в выручке."
          : source === "offline"
            ? "Оплата наличными или переводом. Учитывается в выручке по текущей цене."
            : "Ручное создание заказа (как при покупке на сайте). Учитывается в выручке."}
      </div>

      {/* Messages */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-green-800">{success}</p>
          <button type="button" onClick={() => setSuccess(null)} className="ml-auto text-green-600 hover:text-green-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <X className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
          <button type="button" onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Info */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-700">Данные клиента</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Имя *</Label>
              <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Иван" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Фамилия *</Label>
              <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Иванов" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ivan@example.com" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Телефон</Label>
            <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+373 xxx xxx xxx" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Язык письма</Label>
            <Select value={language} onValueChange={(v) => setLanguage(v as "ro" | "ru")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ro">Romana</SelectItem>
                <SelectItem value="ru">Русский</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Заметка (видна только админу)</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={isGiveaway ? "Конкурс в Instagram, пост от 15.03" : "Оплата наличными"}
              rows={2}
            />
          </div>
        </div>

        {/* Tickets */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-700">Билеты</h3>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="w-4 h-4 mr-1" />
              Добавить
            </Button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => {
              const selectedTicket = getTicketById(item.ticketId);
              const hasOptions = selectedTicket?.has_options && selectedTicket?.ticket_options?.length > 0;
              const itemPrice = isFree ? 0 : (selectedTicket?.price || 0);

              return (
                <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Билет #{index + 1}</span>
                    {items.length > 1 && (
                      <button type="button" onClick={() => removeItem(index)} className="text-gray-400 hover:text-red-500">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <Select value={item.ticketId} onValueChange={(v) => updateItem(index, { ticketId: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите билет" />
                    </SelectTrigger>
                    <SelectContent>
                      {tickets.map((ticket) => (
                        <SelectItem key={ticket.id} value={ticket.id}>
                          {ticket.name_ru} {!isFree && `— ${ticket.price} MDL`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {hasOptions && (
                    <Select value={item.optionId || ""} onValueChange={(v) => updateItem(index, { optionId: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите опцию" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedTicket?.ticket_options?.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.name_ru}
                            {!isFree && option.price_modifier > 0 && ` (+${option.price_modifier} MDL)`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Label className="text-sm">Кол-во:</Label>
                      <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" size="icon" className="h-8 w-8"
                          onClick={() => updateItem(index, { quantity: Math.max(1, item.quantity - 1) })}>
                          <Minus className="w-3 h-3" />
                        </Button>
                        <Input type="number" min={1} value={item.quantity}
                          onChange={(e) => updateItem(index, { quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                          className="h-8 w-16 text-center font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <Button type="button" variant="outline" size="icon" className="h-8 w-8"
                          onClick={() => updateItem(index, { quantity: item.quantity + 1 })}>
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    {selectedTicket && (
                      <span className="text-sm font-medium text-gray-500">
                        {isFree ? "0 MDL" : `${itemPrice * item.quantity} MDL`}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total */}
          <div className={`p-4 rounded-lg ${isGiveaway ? "bg-purple-50" : "bg-blue-50"}`}>
            <div className="flex items-center justify-between">
              <span className={`font-medium ${isGiveaway ? "text-purple-700" : "text-blue-700"}`}>Итого:</span>
              <span className={`text-xl font-bold ${isGiveaway ? "text-purple-700" : "text-blue-700"}`}>
                {isFree ? "0" : total.toLocaleString()} MDL
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="mt-6 flex justify-end">
        <Button type="submit" disabled={loading} className="min-w-[200px]">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Создание...
            </>
          ) : (
            <>
              <SourceIcon className="w-4 h-4 mr-2" />
              {source === "giveaway" ? "Создать розыгрыш" : "Создать заказ"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
