"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";
import { B2BPackageCalculator } from "@/components/B2BPackageCalculator";
import { B2BOrderForm, type B2BOrderFormData } from "@/components/B2BOrderForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TicketSelection {
  ticketId: string;
  optionId?: string;
  quantity: number;
  unitPrice: number;
}

interface DiscountTier {
  minQuantity: number;
  maxQuantity: number | null;
  discountPercent: number;
  label: string;
}

const DISCOUNT_TIERS: DiscountTier[] = [
  { minQuantity: 50, maxQuantity: 99, discountPercent: 10, label: "50-99" },
  { minQuantity: 100, maxQuantity: 149, discountPercent: 12, label: "100-149" },
  { minQuantity: 150, maxQuantity: 199, discountPercent: 15, label: "150-199" },
  { minQuantity: 200, maxQuantity: null, discountPercent: 20, label: "200+" },
];

const MIN_QUANTITY = 50;

export function B2BOrderSection() {
  const t = useTranslations("B2B");
  const tCalc = useTranslations("B2BCalculator");
  const locale = useLocale() as "ro" | "ru";
  const supabase = createClient();

  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selections, setSelections] = useState<TicketSelection[]>([]);
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

  const handleSelectionChange = React.useCallback((newSelections: TicketSelection[]) => {
    setSelections(newSelections);
  }, []);

  const handleOrderSubmit = async (formData: B2BOrderFormData) => {
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

  const totalQuantity = selections.reduce((sum, s) => sum + s.quantity, 0);
  const hasValidSelection = totalQuantity >= 50;

  // Calculate summary values
  const isValidQuantity = totalQuantity >= MIN_QUANTITY;

  // Get current discount tier
  const currentTier = DISCOUNT_TIERS.find(
    (tier) =>
      totalQuantity >= tier.minQuantity &&
      (tier.maxQuantity === null || totalQuantity <= tier.maxQuantity)
  );

  const discountPercent = currentTier?.discountPercent || 0;

  // Calculate amounts
  const subtotal = selections.reduce((sum, s) => sum + s.unitPrice * s.quantity, 0);
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const finalAmount = subtotal - discountAmount;

  // Get next tier
  const nextTier = DISCOUNT_TIERS.find((tier) => tier.minQuantity > totalQuantity);
  const ticketsToNextTier = nextTier ? nextTier.minQuantity - totalQuantity : 0;

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
    <div className="py-20 bg-muted/20">
      <div className="container mx-auto px-4">
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
          <div className="max-w-4xl mx-auto mb-8">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Calculator */}
          <div>
            <B2BPackageCalculator
              tickets={tickets}
              locale={locale}
              onSelectionChange={handleSelectionChange}
            />
          </div>

          {/* Summary & Order Form */}
          <div className="space-y-6">
            {/* Summary */}
            <Card className={!hasValidSelection ? "sticky top-24" : ""}>
              <CardHeader>
                <CardTitle>{tCalc("summary")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Validation - always show if not valid */}
                {!isValidQuantity && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {totalQuantity === 0
                        ? t("selectMinimum")
                        : tCalc("minimumRequired", { min: MIN_QUANTITY, current: totalQuantity })
                      }
                    </AlertDescription>
                  </Alert>
                )}

                {/* Next Tier Upsell */}
                {isValidQuantity && nextTier && (
                  <Alert>
                    <TrendingUp className="h-4 w-4" />
                    <AlertDescription>
                      {tCalc("nextTierMessage", {
                        needed: ticketsToNextTier,
                        discount: nextTier.discountPercent,
                      })}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Amounts */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{tCalc("totalTickets")}</span>
                    <span className="font-medium">{totalQuantity}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{tCalc("subtotal")}</span>
                    <span className="font-medium">{subtotal.toFixed(2)} MDL</span>
                  </div>

                  {discountPercent > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {tCalc("discount")} ({discountPercent}%)
                      </span>
                      <span className="font-medium text-green-600">
                        -{discountAmount.toFixed(2)} MDL
                      </span>
                    </div>
                  )}

                  <div className="pt-3 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold">{tCalc("total")}</span>
                      <span className="text-2xl font-bold text-primary">
                        {finalAmount.toFixed(2)} MDL
                      </span>
                    </div>
                  </div>

                  {isValidQuantity && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{tCalc("discountApplied", { percent: discountPercent })}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Order Form */}
            {hasValidSelection && (
              <B2BOrderForm onSubmit={handleOrderSubmit} isLoading={isSubmitting} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
