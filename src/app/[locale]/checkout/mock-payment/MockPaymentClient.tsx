"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { CreditCard, CheckCircle2, XCircle, Clock, Loader2, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type PaymentStatus = 'OK' | 'FAILED' | 'PENDING';

export default function MockPaymentPage() {
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("trans_id");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [processingStatus, setProcessingStatus] = React.useState<PaymentStatus | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [pendingMessage, setPendingMessage] = React.useState<string | null>(null);

  const handlePayment = async (status: PaymentStatus) => {
    setIsProcessing(true);
    setProcessingStatus(status);
    setError(null);
    setPendingMessage(null);

    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      const response = await fetch(`${API_URL}/api/checkout/mock-process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process payment');
      }

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else if (status === 'PENDING') {
        setPendingMessage(`Заказ #${data.orderNumber} оставлен в статусе "Ожидает оплаты"`);
        setIsProcessing(false);
        setProcessingStatus(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsProcessing(false);
      setProcessingStatus(null);
    }
  };

  if (!transactionId) {
    return (
      <main className="min-h-screen bg-muted/30 pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-md text-center">
          <XCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
          <h1 className="text-2xl font-bold">Неверная транзакция</h1>
          <p className="text-muted-foreground mt-2">ID транзакции не указан</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/30 pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-md">
        <Card>
          <CardHeader className="text-center">
            <Badge variant="outline" className="mx-auto mb-4 bg-yellow-100 text-yellow-800 border-yellow-300">
              Тестовый режим
            </Badge>
            <div className="mx-auto w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-4">
              <CreditCard className="h-8 w-8 text-yellow-600" />
            </div>
            <CardTitle>Симуляция оплаты MAIB</CardTitle>
            <CardDescription>
              Это тестовая страница оплаты. Выберите результат для симуляции.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-lg bg-muted text-center">
              <p className="text-xs text-muted-foreground">ID транзакции</p>
              <p className="font-mono text-sm break-all">{transactionId}</p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Номер карты</Label>
                <Input placeholder="4111 1111 1111 1111" defaultValue="4111 1111 1111 1111" disabled={isProcessing} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Срок</Label>
                  <Input placeholder="12/26" defaultValue="12/26" disabled={isProcessing} />
                </div>
                <div className="space-y-1.5">
                  <Label>CVV</Label>
                  <Input placeholder="123" defaultValue="123" type="password" disabled={isProcessing} />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {pendingMessage && (
              <div className="p-3 rounded-lg bg-yellow-100 text-yellow-800 flex items-center gap-2">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <p className="text-sm">{pendingMessage}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex-col gap-3">
            <Button
              className="w-full gap-2 bg-green-600 hover:bg-green-700"
              onClick={() => handlePayment('OK')}
              disabled={isProcessing}
            >
              {isProcessing && processingStatus === 'OK' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Обработка...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Успешная оплата (PAID)
                </>
              )}
            </Button>

            <Button
              variant="outline"
              className="w-full gap-2 border-yellow-500 text-yellow-700 hover:bg-yellow-50"
              onClick={() => handlePayment('PENDING')}
              disabled={isProcessing}
            >
              {isProcessing && processingStatus === 'PENDING' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Обработка...
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4" />
                  Оставить в ожидании (PENDING)
                </>
              )}
            </Button>

            <Button
              variant="outline"
              className="w-full gap-2 border-destructive text-destructive hover:bg-destructive/10"
              onClick={() => handlePayment('FAILED')}
              disabled={isProcessing}
            >
              {isProcessing && processingStatus === 'FAILED' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Обработка...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" />
                  Неудачная оплата (FAILED)
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-4">
          🧪 Тестовый режим — Реальная оплата не производится
        </p>
      </div>
    </main>
  );
}
