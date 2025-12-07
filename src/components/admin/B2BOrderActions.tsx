"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  CheckCircle,
  Ticket,
  Send,
  Download,
  XCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface B2BOrderActionsProps {
  order: any;
}

export function B2BOrderActions({ order }: B2BOrderActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAction = async (action: string, endpoint: string, method: string = "POST") => {
    setLoading(action);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const response = await fetch(`${apiUrl}/api/b2b/${endpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId: order.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${action}`);
      }

      const result = await response.json();

      // Refresh the page to show updated data
      router.refresh();

      // Handle invoice download
      if (action === "generate-invoice" && result.data?.invoiceUrl) {
        window.open(result.data.invoiceUrl, "_blank");
      }
    } catch (err: any) {
      console.error(`Error ${action}:`, err);
      setError(err.message || `Не удалось выполнить действие: ${action}`);
    } finally {
      setLoading(null);
    }
  };

  const canGenerateInvoice = ["pending", "invoice_sent"].includes(order.status);
  const canMarkAsPaid = ["pending", "invoice_sent"].includes(order.status);
  const canGenerateTickets = order.status === "paid";
  const canSendTickets = order.status === "tickets_generated";
  const canCancel = !["completed", "cancelled"].includes(order.status);

  return (
    <div className="space-y-3">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Generate Invoice */}
      {canGenerateInvoice && (
        <Button
          onClick={() => handleAction("generate-invoice", `orders/${order.id}/generate-invoice`)}
          disabled={loading !== null}
          className="w-full"
          variant="outline"
        >
          {loading === "generate-invoice" ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <FileText className="w-4 h-4 mr-2" />
          )}
          Сгенерировать счёт
        </Button>
      )}

      {/* Download Invoice */}
      {order.invoice_url && (
        <Button
          onClick={() => window.open(order.invoice_url, "_blank")}
          className="w-full"
          variant="outline"
        >
          <Download className="w-4 h-4 mr-2" />
          Скачать счёт
        </Button>
      )}

      {/* Mark as Paid */}
      {canMarkAsPaid && (
        <Button
          onClick={() => handleAction("mark-paid", `orders/${order.id}/mark-paid`, "PATCH")}
          disabled={loading !== null}
          className="w-full"
          variant="outline"
        >
          {loading === "mark-paid" ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4 mr-2" />
          )}
          Отметить как оплачен
        </Button>
      )}

      {/* Generate Tickets */}
      {canGenerateTickets && (
        <Button
          onClick={() => handleAction("generate-tickets", `orders/${order.id}/generate-tickets`)}
          disabled={loading !== null}
          className="w-full"
        >
          {loading === "generate-tickets" ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Ticket className="w-4 h-4 mr-2" />
          )}
          Сгенерировать билеты
        </Button>
      )}

      {/* Send Tickets */}
      {canSendTickets && (
        <Button
          onClick={() => handleAction("send-tickets", `orders/${order.id}/send-tickets`)}
          disabled={loading !== null}
          className="w-full"
        >
          {loading === "send-tickets" ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Send className="w-4 h-4 mr-2" />
          )}
          Отправить билеты
        </Button>
      )}

      {/* Cancel Order */}
      {canCancel && (
        <Button
          onClick={() => {
            if (confirm("Вы уверены, что хотите отменить этот заказ?")) {
              handleAction("cancel", `orders/${order.id}/cancel`, "PATCH");
            }
          }}
          disabled={loading !== null}
          className="w-full"
          variant="destructive"
        >
          {loading === "cancel" ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <XCircle className="w-4 h-4 mr-2" />
          )}
          Отменить заказ
        </Button>
      )}
    </div>
  );
}
