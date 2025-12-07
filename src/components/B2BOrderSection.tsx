"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, AlertCircle, CheckCircle2, Mail, ArrowRight } from "lucide-react";
import { B2BOrderWizard } from "@/components/B2BOrderWizard";
import type { B2BOrderFormData } from "@/components/B2BOrderForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TicketSelection {
  ticketId: string;
  optionId?: string;
  quantity: number;
  unitPrice: number;
}

export function B2BOrderSection() {
  const t = useTranslations("B2B");
  const locale = useLocale() as "ro" | "ru";
  const supabase = createClient();

  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load tickets
  React.useEffect(() => {
    async function loadTickets() {
      try {
        const { data, error } = await supabase
          .from("tickets")
          .select(`
            *,
            ticket_options(*)
          `)
          .eq("is_active", true)
          .order("sort_order");

        if (error) throw error;

        // Filter out family tickets for B2B
        const filteredTickets = (data || []).filter(
          (ticket: any) => !ticket.name.toLowerCase().includes("family")
        );

        setTickets(filteredTickets);
      } catch (err) {
        console.error("Error loading tickets:", err);
        setError(t("errorLoadingTickets"));
      } finally {
        setLoading(false);
      }
    }

    loadTickets();
  }, [supabase, t]);

  const handleOrderSubmit = async (formData: B2BOrderFormData, selections: TicketSelection[]) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const response = await fetch(`${apiUrl}/api/b2b/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company: formData.company,
          contact: formData.contact,
          items: selections.map((s) => ({
            ticketId: s.ticketId,
            ticketOptionId: s.optionId,
            quantity: s.quantity,
          })),
          paymentMethod: formData.paymentMethod,
          notes: formData.notes,
          language: locale,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create order");
      }

      const result = await response.json();

      // If online payment, redirect to payment page
      if (result.data.redirectUrl) {
        window.location.href = result.data.redirectUrl;
        return;
      }

      // If invoice, show success message
      setSuccess(true);
    } catch (err: any) {
      console.error("Error creating order:", err);
      setError(err.message || t("errorCreatingOrder"));
      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20">
        <div className="text-center">{t("loading")}</div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-20 px-4">
        <Card className="max-w-lg w-full border-green-200 shadow-xl">
          <CardContent className="pt-12 pb-8 px-6 text-center">
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500 rounded-full blur-2xl opacity-20 animate-pulse" />
                <div className="relative bg-gradient-to-br from-green-500 to-green-600 rounded-full p-6">
                  <CheckCircle2 className="h-12 w-12 text-white" strokeWidth={2.5} />
                </div>
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              {t("orderSuccess")}
            </h2>

            <div className="space-y-4 mb-8">
              <p className="text-base text-gray-600 leading-relaxed">
                {t("orderSuccessMessage")}
              </p>

              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg py-3 px-4">
                <Mail className="h-4 w-4" />
                <span>Проверьте вашу почту для получения деталей</span>
              </div>
            </div>

            <Button
              size="lg"
              onClick={() => setSuccess(false)}
              className="w-full group"
            >
              Создать новый заказ
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-20 bg-muted/20 -mx-4">
      <div className="px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <ShoppingCart className="h-3 w-3 mr-1" />
            {t("orderBadge")}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("orderTitle")}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("orderSubtitle")}
          </p>
        </div>

        {error && (
          <div className="max-w-4xl mx-auto mb-8 px-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        <B2BOrderWizard
          tickets={tickets}
          locale={locale}
          onSubmit={handleOrderSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
