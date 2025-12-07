"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Minus, Plus, AlertCircle, TrendingUp, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";

interface TicketOption {
  id: string;
  name: string;
  name_ro: string;
  name_ru: string;
  price_modifier: number;
  is_default: boolean;
}

interface Ticket {
  id: string;
  name: string;
  name_ro: string;
  name_ru: string;
  description_ro: string | null;
  description_ru: string | null;
  price: number;
  has_options: boolean;
  ticket_options?: TicketOption[];
}

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

interface B2BPackageCalculatorProps {
  tickets: Ticket[];
  locale: "ro" | "ru";
  onSelectionChange?: (selections: TicketSelection[]) => void;
}

const DISCOUNT_TIERS: DiscountTier[] = [
  { minQuantity: 50, maxQuantity: 99, discountPercent: 10, label: "50-99" },
  { minQuantity: 100, maxQuantity: 149, discountPercent: 12, label: "100-149" },
  { minQuantity: 150, maxQuantity: 199, discountPercent: 15, label: "150-199" },
  { minQuantity: 200, maxQuantity: null, discountPercent: 20, label: "200+" },
];

const MIN_QUANTITY = 50;

export function B2BPackageCalculator({
  tickets,
  locale,
  onSelectionChange,
}: B2BPackageCalculatorProps) {
  const t = useTranslations("B2BCalculator");
  const [selections, setSelections] = React.useState<Record<string, number>>({});
  const [selectedOptions, setSelectedOptions] = React.useState<Record<string, string>>({});

  // Calculate totals
  const totalQuantity = Object.values(selections).reduce((sum, qty) => sum + qty, 0);
  const isValidQuantity = totalQuantity >= MIN_QUANTITY;

  // Get current discount tier
  const currentTier = DISCOUNT_TIERS.find(
    (tier) =>
      totalQuantity >= tier.minQuantity &&
      (tier.maxQuantity === null || totalQuantity <= tier.maxQuantity)
  );

  const discountPercent = currentTier?.discountPercent || 0;

  // Calculate amounts
  const subtotal = tickets.reduce((sum, ticket) => {
    const qty = selections[ticket.id] || 0;
    if (qty === 0) return sum;

    let price = ticket.price;

    // Add option price modifier if applicable
    if (ticket.has_options && selectedOptions[ticket.id]) {
      const option = ticket.ticket_options?.find((o) => o.id === selectedOptions[ticket.id]);
      if (option) {
        price += option.price_modifier;
      }
    }

    return sum + price * qty;
  }, 0);

  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const finalAmount = subtotal - discountAmount;

  // Get next tier
  const nextTier = DISCOUNT_TIERS.find((tier) => tier.minQuantity > totalQuantity);
  const ticketsToNextTier = nextTier ? nextTier.minQuantity - totalQuantity : 0;

  // Update parent component
  React.useEffect(() => {
    if (onSelectionChange) {
      const selectionArray: TicketSelection[] = tickets
        .filter((ticket) => (selections[ticket.id] || 0) > 0)
        .map((ticket) => {
          let unitPrice = ticket.price;

          if (ticket.has_options && selectedOptions[ticket.id]) {
            const option = ticket.ticket_options?.find((o) => o.id === selectedOptions[ticket.id]);
            if (option) {
              unitPrice += option.price_modifier;
            }
          }

          return {
            ticketId: ticket.id,
            optionId: selectedOptions[ticket.id],
            quantity: selections[ticket.id] || 0,
            unitPrice,
          };
        });

      onSelectionChange(selectionArray);
    }
  }, [selections, selectedOptions, tickets, onSelectionChange]);

  const handleQuantityChange = (ticketId: string, delta: number) => {
    setSelections((prev) => {
      const current = prev[ticketId] || 0;
      const newValue = Math.max(0, current + delta);
      return { ...prev, [ticketId]: newValue };
    });
  };

  const handleQuantityInput = (ticketId: string, value: string) => {
    const numValue = parseInt(value) || 0;
    const validValue = Math.max(0, numValue);
    setSelections((prev) => ({ ...prev, [ticketId]: validValue }));
  };

  const handleOptionChange = (ticketId: string, optionId: string) => {
    setSelectedOptions((prev) => ({ ...prev, [ticketId]: optionId }));
  };

  return (
    <div className="space-y-6">
      {/* Discount Tiers Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            {t("discountTiers")}
          </CardTitle>
          <CardDescription>{t("discountTiersDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {DISCOUNT_TIERS.map((tier) => {
              const isActive =
                totalQuantity >= tier.minQuantity &&
                (tier.maxQuantity === null || totalQuantity <= tier.maxQuantity);

              return (
                <div
                  key={tier.label}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isActive
                      ? "border-primary bg-primary/5"
                      : "border-muted bg-muted/30"
                  }`}
                >
                  <div className="text-sm text-muted-foreground mb-1">{tier.label}</div>
                  <div className="text-2xl font-bold text-primary">
                    {tier.discountPercent}%
                  </div>
                  {isActive && (
                    <Badge variant="default" className="mt-2">
                      {t("active")}
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Ticket Selection */}
      <Card>
        <CardHeader>
          <CardTitle>{t("selectTickets")}</CardTitle>
          <CardDescription>{t("selectTicketsDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {tickets.map((ticket) => {
            const qty = selections[ticket.id] || 0;
            const ticketName = locale === "ro" ? ticket.name_ro : ticket.name_ru;
            const ticketDesc = locale === "ro" ? ticket.description_ro : ticket.description_ru;

            let displayPrice = ticket.price;
            if (ticket.has_options && selectedOptions[ticket.id]) {
              const option = ticket.ticket_options?.find(
                (o) => o.id === selectedOptions[ticket.id]
              );
              if (option) {
                displayPrice += option.price_modifier;
              }
            }

            return (
              <div key={ticket.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold">{ticketName}</h4>
                    {ticketDesc && (
                      <p className="text-sm text-muted-foreground mt-1">{ticketDesc}</p>
                    )}
                    <p className="text-lg font-bold text-primary mt-2">
                      {displayPrice.toFixed(2)} MDL
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(ticket.id, -1)}
                      disabled={qty === 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      min="0"
                      value={qty}
                      onChange={(e) => handleQuantityInput(ticket.id, e.target.value)}
                      className="w-20 text-center font-semibold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(ticket.id, 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Ticket Options */}
                {ticket.has_options && ticket.ticket_options && qty > 0 && (
                  <div className="pt-3 border-t">
                    <p className="text-sm font-medium mb-2">{t("selectOption")}</p>
                    <div className="space-y-2">
                      {ticket.ticket_options.map((option) => {
                        const optionName = locale === "ro" ? option.name_ro : option.name_ru;
                        const isSelected = selectedOptions[ticket.id] === option.id;

                        return (
                          <button
                            key={option.id}
                            onClick={() => handleOptionChange(ticket.id, option.id)}
                            className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                              isSelected
                                ? "border-primary bg-primary/5"
                                : "border-muted hover:border-primary/50"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{optionName}</span>
                              {option.price_modifier !== 0 && (
                                <span className="text-sm text-muted-foreground">
                                  +{option.price_modifier.toFixed(2)} MDL
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
