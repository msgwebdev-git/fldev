"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, AlertCircle, CheckCircle2 } from "lucide-react";
import { B2BOrderWizard } from "@/components/B2BOrderWizard";
import type { B2BOrderFormData } from "@/components/B2BOrderForm";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      console.error("Error creating order:", err);
      setError(err.message || t("errorCreatingOrder"));
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
      <div className="py-20">
        <div className="max-w-2xl mx-auto text-center">
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <AlertDescription className="text-green-900">
              <div className="space-y-3">
                <p className="font-semibold text-lg">{t("orderSuccess")}</p>
                <p>{t("orderSuccessMessage")}</p>
              </div>
            </AlertDescription>
          </Alert>
        </div>
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
