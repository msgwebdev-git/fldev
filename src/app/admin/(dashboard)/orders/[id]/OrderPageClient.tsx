"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  User,
  Calendar,
  CreditCard,
  Package,
  Download,
  Copy,
  Check,
  Pencil,
  Loader2,
  X,
  Globe,
  Hash,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  Bell,
  RotateCcw,
  History,
  ExternalLink,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { OrderData, CustomerOrderHistory } from "./page";

const statusConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  pending: { label: "Ожидает оплаты", className: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock },
  paid: { label: "Оплачен", className: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle },
  failed: { label: "Ошибка оплаты", className: "bg-red-100 text-red-800 border-red-200", icon: XCircle },
  expired: { label: "Истёк", className: "bg-gray-100 text-gray-800 border-gray-200", icon: Clock },
  cancelled: { label: "Отменён", className: "bg-gray-100 text-gray-800 border-gray-200", icon: XCircle },
  refunded: { label: "Возврат", className: "bg-purple-100 text-purple-800 border-purple-200", icon: AlertCircle },
};

const paymentStatusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Ожидает", className: "bg-yellow-100 text-yellow-800" },
  ok: { label: "Успешно", className: "bg-green-100 text-green-800" },
  failed: { label: "Ошибка", className: "bg-red-100 text-red-800" },
  reversed: { label: "Отменён", className: "bg-purple-100 text-purple-800" },
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatPrice(amount: number) {
  return `${amount.toLocaleString("ru-RU")} MDL`;
}

interface OrderPageClientProps {
  order: OrderData;
  customerHistory: CustomerOrderHistory[];
}

export function OrderPageClient({ order: initialOrder, customerHistory }: OrderPageClientProps) {
  const router = useRouter();
  const [order, setOrder] = React.useState(initialOrder);
  const [isEditingEmail, setIsEditingEmail] = React.useState(false);
  const [email, setEmail] = React.useState(order.customer_email);
  const [isSaving, setIsSaving] = React.useState(false);
  const [copied, setCopied] = React.useState<string | null>(null);
  const [isResending, setIsResending] = React.useState(false);
  const [resendSuccess, setResendSuccess] = React.useState(false);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = React.useState(false);
  const [refundReason, setRefundReason] = React.useState("");
  const [isRefunding, setIsRefunding] = React.useState(false);

  const statusInfo = statusConfig[order.status] || statusConfig.pending;
  const paymentInfo = paymentStatusConfig[order.payment_status] || paymentStatusConfig.pending;
  const StatusIcon = statusInfo.icon;

  const totalTickets = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const finalAmount = Number(order.total_amount) - Number(order.discount_amount || 0);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSaveEmail = async () => {
    if (!email || email === order.customer_email) {
      setIsEditingEmail(false);
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/orders/${order.id}/update-email`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setOrder({ ...order, customer_email: email });
        setIsEditingEmail(false);
      }
    } catch (error) {
      console.error("Failed to update email:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadTickets = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    window.open(`${apiUrl}/api/checkout/tickets/${order.order_number}/download`, "_blank");
  };

  const handleResendTickets = async () => {
    setIsResending(true);
    setResendSuccess(false);
    try {
      const response = await fetch(`/api/admin/orders/${order.id}/resend-tickets`, {
        method: "POST",
      });

      if (response.ok) {
        setResendSuccess(true);
        setTimeout(() => setResendSuccess(false), 3000);
      } else {
        const data = await response.json();
        alert(data.error || "Ошибка при отправке билетов");
      }
    } catch (error) {
      console.error("Failed to resend tickets:", error);
      alert("Ошибка при отправке билетов");
    } finally {
      setIsResending(false);
    }
  };

  const handleRefund = async () => {
    if (!refundReason.trim()) {
      alert("Укажите причину возврата");
      return;
    }

    setIsRefunding(true);
    try {
      const response = await fetch(`/api/admin/orders/${order.id}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: refundReason }),
      });

      const data = await response.json();

      if (response.ok) {
        setOrder({
          ...order,
          status: "refunded",
          payment_status: "reversed",
          refund_reason: refundReason,
          refunded_at: new Date().toISOString(),
        });
        setIsRefundDialogOpen(false);
        setRefundReason("");
      } else {
        alert(data.error || "Ошибка при оформлении возврата");
      }
    } catch (error) {
      console.error("Failed to process refund:", error);
      alert("Ошибка при оформлении возврата");
    } finally {
      setIsRefunding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/admin/orders")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{order.order_number}</h1>
              <Badge variant="outline" className={`${statusInfo.className} gap-1.5`}>
                <StatusIcon className="h-3.5 w-3.5" />
                {statusInfo.label}
              </Badge>
            </div>
            <p className="text-gray-500 mt-1">Создан {formatDate(order.created_at)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => handleCopy(order.order_number, "order")}
            className="gap-2"
          >
            {copied === "order" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            Копировать номер
          </Button>
          {order.status === "paid" && (
            <>
              <Button
                variant="outline"
                onClick={() => setIsRefundDialogOpen(true)}
                className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <RotateCcw className="h-4 w-4" />
                Возврат
              </Button>
              <Button
                variant="outline"
                onClick={handleResendTickets}
                disabled={isResending}
                className="gap-2"
              >
                {isResending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : resendSuccess ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {resendSuccess ? "Отправлено!" : "Переотправить билеты"}
              </Button>
              <Button onClick={handleDownloadTickets} className="gap-2">
                <Download className="h-4 w-4" />
                Скачать билеты
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500 mb-1">Сумма заказа</p>
          <p className="text-2xl font-bold text-gray-900">{formatPrice(finalAmount)}</p>
          {Number(order.discount_amount) > 0 && (
            <p className="text-sm text-green-600 mt-1">Скидка: -{formatPrice(Number(order.discount_amount))}</p>
          )}
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500 mb-1">Количество билетов</p>
          <p className="text-2xl font-bold text-gray-900">{totalTickets}</p>
          <p className="text-sm text-gray-500 mt-1">{order.items?.length || 0} позиций</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500 mb-1">Статус оплаты</p>
          <Badge className={`${paymentInfo.className} mt-1`}>{paymentInfo.label}</Badge>
          {order.paid_at && (
            <p className="text-sm text-gray-500 mt-2">{formatDate(order.paid_at)}</p>
          )}
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500 mb-1">Язык</p>
          <p className="text-2xl font-bold text-gray-900">{order.language === "ro" ? "RO" : "RU"}</p>
          <p className="text-sm text-gray-500 mt-1">{order.language === "ro" ? "Română" : "Русский"}</p>
        </div>
      </div>

      {/* Error Banner */}
      {order.failure_reason && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="font-medium text-red-800">Ошибка оплаты</p>
            <p className="text-sm text-red-700 mt-0.5">{order.failure_reason}</p>
          </div>
        </div>
      )}

      {/* Refund Banner */}
      {order.status === "refunded" && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
            <RotateCcw className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-purple-800">Заказ возвращён</p>
            {order.refund_reason && (
              <p className="text-sm text-purple-700 mt-0.5">Причина: {order.refund_reason}</p>
            )}
            {order.refunded_at && (
              <p className="text-xs text-purple-500 mt-1">
                {formatDate(order.refunded_at)}
                {order.refunded_by && ` • ${order.refunded_by}`}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Детали заказа</TabsTrigger>
          <TabsTrigger value="tickets">Билеты ({totalTickets})</TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5">
            <History className="h-4 w-4" />
            История клиента
            {customerHistory.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1.5">
                {customerHistory.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="technical">Техническая информация</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Info */}
            <div className="bg-white rounded-xl border p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="font-semibold text-lg text-gray-900">Клиент</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Имя</p>
                  <p className="font-medium text-gray-900">{order.customer_name}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  {isEditingEmail ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEmail();
                          if (e.key === "Escape") {
                            setEmail(order.customer_email);
                            setIsEditingEmail(false);
                          }
                        }}
                      />
                      <Button size="icon" variant="ghost" onClick={handleSaveEmail} disabled={isSaving}>
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 text-green-600" />}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEmail(order.customer_email);
                          setIsEditingEmail(false);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group">
                      <a href={`mailto:${order.customer_email}`} className="font-medium text-primary hover:underline">
                        {order.customer_email}
                      </a>
                      <button
                        onClick={() => setIsEditingEmail(true)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                      >
                        <Pencil className="w-4 h-4 text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleCopy(order.customer_email, "email")}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                      >
                        {copied === "email" ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-400" />}
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Телефон</p>
                  <div className="flex items-center gap-2 group">
                    <a href={`tel:${order.customer_phone}`} className="font-medium text-primary hover:underline">
                      {order.customer_phone}
                    </a>
                    <button
                      onClick={() => handleCopy(order.customer_phone, "phone")}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                    >
                      {copied === "phone" ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-xl border p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="font-semibold text-lg text-gray-900">Оплата</h2>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Сумма</span>
                  <span className="font-medium">{formatPrice(Number(order.total_amount))}</span>
                </div>
                {Number(order.discount_amount) > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Скидка</span>
                      <span className="font-medium text-green-600">-{formatPrice(Number(order.discount_amount))}</span>
                    </div>
                    {order.promo_code && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Промокод</span>
                        <code className="bg-gray-100 px-2 py-0.5 rounded text-sm font-medium">{order.promo_code}</code>
                      </div>
                    )}
                  </>
                )}
                <Separator />
                <div className="flex justify-between">
                  <span className="font-semibold">Итого</span>
                  <span className="text-xl font-bold">{formatPrice(finalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tickets Tab */}
        <TabsContent value="tickets">
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Билет</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Код</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-center">Статус</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Цена</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {order.items?.map((item) => {
                  const ticketStatus = item.status || "valid";
                  const statusStyles = {
                    valid: "bg-green-100 text-green-800",
                    used: "bg-gray-100 text-gray-800",
                    refunded: "bg-purple-100 text-purple-800",
                  };
                  const statusLabels = {
                    valid: "Активен",
                    used: "Использован",
                    refunded: "Возврат",
                  };
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">
                          {item.ticket?.name_ru || item.ticket?.name}
                        </p>
                        {item.ticket_option && (
                          <p className="text-sm text-gray-500 mt-0.5">
                            {item.ticket_option.name_ru || item.ticket_option.name}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono text-gray-600">
                            {item.ticket_code}
                          </code>
                          <button
                            onClick={() => handleCopy(item.ticket_code, item.ticket_code)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                          >
                            {copied === item.ticket_code ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge className={statusStyles[ticketStatus]}>
                          {statusLabels[ticketStatus]}
                        </Badge>
                        {item.scanned_at && (
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDate(item.scanned_at)}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-semibold text-gray-900">
                          {formatPrice(Number(item.unit_price))}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50">
                  <td colSpan={3} className="px-6 py-4 text-right font-semibold text-gray-700">
                    Итого:
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-xl font-bold text-primary">{formatPrice(finalAmount)}</span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </TabsContent>

        {/* Customer History Tab */}
        <TabsContent value="history">
          <div className="bg-white rounded-xl border overflow-hidden">
            {customerHistory.length > 0 ? (
              <>
                <div className="px-6 py-4 border-b bg-gray-50/50">
                  <p className="text-sm text-gray-600">
                    Все заказы клиента <span className="font-medium">{order.customer_email}</span>
                    {" "}(кроме текущего)
                  </p>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Номер заказа</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Дата</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-center">Статус</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-center">Билетов</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Сумма</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {customerHistory.map((historyOrder) => {
                      const historyStatusInfo = statusConfig[historyOrder.status] || statusConfig.pending;
                      const historyFinalAmount = Number(historyOrder.total_amount) - Number(historyOrder.discount_amount || 0);
                      return (
                        <tr key={historyOrder.id} className="hover:bg-gray-50/50">
                          <td className="px-6 py-4">
                            <span className="font-mono font-medium text-primary">
                              {historyOrder.order_number}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-gray-600 text-sm">
                              {formatDate(historyOrder.created_at)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Badge variant="outline" className={historyStatusInfo.className}>
                              {historyStatusInfo.label}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-gray-600">{historyOrder.items_count} шт.</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-semibold text-gray-900">
                              {formatPrice(historyFinalAmount)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/admin/orders/${historyOrder.id}`)}
                              className="gap-1.5"
                            >
                              Открыть
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="px-6 py-4 border-t bg-gray-50/50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      Всего заказов: <span className="font-medium text-gray-900">{customerHistory.length + 1}</span>
                      {" "}(включая текущий)
                    </span>
                    <span className="text-gray-500">
                      Общая сумма:{" "}
                      <span className="font-medium text-gray-900">
                        {formatPrice(
                          customerHistory.reduce(
                            (sum, o) => sum + (Number(o.total_amount) - Number(o.discount_amount || 0)),
                            finalAmount
                          )
                        )}
                      </span>
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-16 text-center">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <History className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500">Других заказов от этого клиента нет</p>
                <p className="text-sm text-gray-400 mt-1">
                  {order.customer_email}
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Technical Tab */}
        <TabsContent value="technical">
          <div className="bg-white rounded-xl border p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Hash className="w-4 h-4 text-gray-400" />
                  Идентификаторы
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">ID заказа</span>
                    <code className="bg-gray-100 px-2 py-0.5 rounded font-mono text-xs">{order.id}</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Номер заказа</span>
                    <code className="bg-gray-100 px-2 py-0.5 rounded font-mono text-xs">{order.order_number}</code>
                  </div>
                  {order.maib_transaction_id && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">MAIB Transaction ID</span>
                      <code className="bg-gray-100 px-2 py-0.5 rounded font-mono text-xs">{order.maib_transaction_id}</code>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  Даты
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Создан</span>
                    <span>{formatDate(order.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Обновлён</span>
                    <span>{formatDate(order.updated_at)}</span>
                  </div>
                  {order.paid_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Оплачен</span>
                      <span className="text-green-600">{formatDate(order.paid_at)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  Клиент
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">IP адрес</span>
                    <code className="bg-gray-100 px-2 py-0.5 rounded font-mono text-xs">{order.client_ip || "—"}</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Язык</span>
                    <span>{order.language === "ro" ? "Română (RO)" : "Русский (RU)"}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  Платёж
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Статус заказа</span>
                    <Badge variant="outline" className={statusInfo.className}>{statusInfo.label}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Статус платежа</span>
                    <Badge className={paymentInfo.className}>{paymentInfo.label}</Badge>
                  </div>
                </div>
              </div>

              {/* Reminders section - only show for pending orders or if reminders were sent */}
              {(order.status === "pending" || order.reminder_count > 0) && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-gray-400" />
                    Напоминания
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Отправлено напоминаний</span>
                      <span className={order.reminder_count > 0 ? "text-orange-600 font-medium" : ""}>
                        {order.reminder_count} из 2
                      </span>
                    </div>
                    {order.reminder_sent_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Последнее напоминание</span>
                        <span className="text-orange-600">{formatDate(order.reminder_sent_at)}</span>
                      </div>
                    )}
                    {order.status === "pending" && order.reminder_count === 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Статус</span>
                        <span className="text-gray-400">Ожидает отправки</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Refund Dialog */}
      <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-red-600" />
              Оформить возврат
            </DialogTitle>
            <DialogDescription>
              Возврат средств для заказа <strong>{order.order_number}</strong> на сумму{" "}
              <strong>{formatPrice(finalAmount)}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Причина возврата <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder="Укажите причину возврата..."
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Внимание:</strong> После оформления возврата статус заказа изменится на "Возврат".
                Это действие нельзя отменить.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRefundDialogOpen(false);
                setRefundReason("");
              }}
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleRefund}
              disabled={isRefunding || !refundReason.trim()}
            >
              {isRefunding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Оформляем...
                </>
              ) : (
                "Оформить возврат"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
