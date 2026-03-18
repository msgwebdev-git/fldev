"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Minus, Plus, AlertCircle, TrendingUp, CheckCircle2, Info, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useMediaQuery } from "@/hooks/use-media-query";

interface TicketOption {
  id: string;
  name: string;
  name_ro: string;
  name_ru: string;
  description_ro?: string;
  description_ru?: string;
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
  features_ro?: string[];
  features_ru?: string[];
  price: number;
  original_price?: number;
  currency?: string;
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
  { minQuantity: 50, maxQuantity: 99, discountPercent: 5, label: "50-99" },
  { minQuantity: 100, maxQuantity: 149, discountPercent: 7, label: "100-149" },
  { minQuantity: 150, maxQuantity: 199, discountPercent: 10, label: "150-199" },
  { minQuantity: 200, maxQuantity: null, discountPercent: 15, label: "200+" },
];

const MIN_QUANTITY = 50;

export function B2BPackageCalculator({
  tickets,
  locale,
  onSelectionChange,
}: B2BPackageCalculatorProps) {
  const t = useTranslations("B2BCalculator");
  const tTickets = useTranslations("Tickets");
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [selections, setSelections] = React.useState<Record<string, number>>({});
  const [selectedOptions, setSelectedOptions] = React.useState<Record<string, string>>({});
  const [optionsModalOpen, setOptionsModalOpen] = React.useState<Record<string, boolean>>({});
  const [tempSelectedOptions, setTempSelectedOptions] = React.useState<Record<string, string>>({});
  const [infoModalOpen, setInfoModalOpen] = React.useState<Record<string, boolean>>({});

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

  const handleQuantityChange = (ticket: Ticket, delta: number) => {
    const current = selections[ticket.id] || 0;
    const newValue = Math.max(0, current + delta);

    // If ticket has options and we're increasing from 0, open options modal
    if (ticket.has_options && delta > 0 && current === 0) {
      const defaultOption = ticket.ticket_options?.find((o) => o.is_default) || ticket.ticket_options?.[0];
      setTempSelectedOptions((prev) => ({ ...prev, [ticket.id]: defaultOption?.id || "" }));
      setOptionsModalOpen((prev) => ({ ...prev, [ticket.id]: true }));
      return;
    }

    setSelections((prev) => ({ ...prev, [ticket.id]: newValue }));
  };

  const handleQuantityInput = (ticket: Ticket, value: string) => {
    const numValue = parseInt(value) || 0;
    const validValue = Math.max(0, numValue);

    // If ticket has options and setting quantity > 0 for the first time, open options modal
    if (ticket.has_options && validValue > 0 && (selections[ticket.id] || 0) === 0) {
      const defaultOption = ticket.ticket_options?.find((o) => o.is_default) || ticket.ticket_options?.[0];
      setTempSelectedOptions((prev) => ({ ...prev, [ticket.id]: defaultOption?.id || "" }));
      setOptionsModalOpen((prev) => ({ ...prev, [ticket.id]: true }));
      return;
    }

    setSelections((prev) => ({ ...prev, [ticket.id]: validValue }));
  };

  const handleConfirmOption = (ticketId: string) => {
    const optionId = tempSelectedOptions[ticketId];
    if (optionId) {
      setSelectedOptions((prev) => ({ ...prev, [ticketId]: optionId }));
      setSelections((prev) => ({ ...prev, [ticketId]: 1 }));
      setOptionsModalOpen((prev) => ({ ...prev, [ticketId]: false }));
    }
  };

  const handleCloseOptionsModal = (ticketId: string) => {
    setOptionsModalOpen((prev) => ({ ...prev, [ticketId]: false }));
  };

  return (
    <div className="space-y-4">
      {/* Discount Tiers — inline */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {DISCOUNT_TIERS.map((tier) => {
          const isActive =
            totalQuantity >= tier.minQuantity &&
            (tier.maxQuantity === null || totalQuantity <= tier.maxQuantity);

          return (
            <div
              key={tier.label}
              className={`flex-1 min-w-[72px] py-2 px-2 rounded-xl border text-center transition-all ${
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border"
              }`}
            >
              <div className={`text-[10px] ${isActive ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{tier.label}</div>
              <div className={`text-lg font-bold ${isActive ? "text-primary-foreground" : "text-primary"}`}>
                {tier.discountPercent}%
              </div>
            </div>
          );
        })}
      </div>

      {/* Tickets */}
      <div className="space-y-2">
            {tickets.map((ticket) => {
              const qty = selections[ticket.id] || 0;
              const ticketName = locale === "ro" ? ticket.name_ro : ticket.name_ru;

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
                <div
                  key={ticket.id}
                  className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border transition-all ${
                    qty > 0
                      ? "border-primary/30"
                      : "border-border"
                  }`}
                >
                  {/* Name + Price */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm sm:text-[15px] leading-tight">{ticketName}</p>
                    <p className="text-base sm:text-lg font-bold text-primary mt-0.5">
                      {Math.round(displayPrice).toLocaleString()} <span className="text-xs font-normal text-muted-foreground">MDL</span>
                    </p>
                    {/* Selected Option Badge */}
                    {ticket.has_options && selectedOptions[ticket.id] && qty > 0 && (
                      <Badge variant="secondary" className="text-[10px] mt-1">
                        {ticket.ticket_options?.find((o: any) => o.id === selectedOptions[ticket.id])
                          ? locale === "ro"
                            ? ticket.ticket_options.find((o: any) => o.id === selectedOptions[ticket.id])?.name_ro
                            : ticket.ticket_options.find((o: any) => o.id === selectedOptions[ticket.id])?.name_ru
                          : ""}
                      </Badge>
                    )}
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-full"
                      onClick={() => handleQuantityChange(ticket, -1)}
                      disabled={qty === 0}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <Input
                      type="number"
                      min="0"
                      value={qty}
                      onChange={(e) => handleQuantityInput(ticket, e.target.value)}
                      className="h-9 w-14 text-center font-semibold text-base rounded-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <Button
                      size="icon"
                      className="h-9 w-9 rounded-full"
                      onClick={() => handleQuantityChange(ticket, 1)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
      </div>

      {/* Options Modals */}
      {tickets.map((ticket) => {
        if (!ticket.has_options || !ticket.ticket_options) return null;

        const ticketName = locale === "ro" ? ticket.name_ro : ticket.name_ru;
        const ticketDesc = locale === "ro" ? ticket.description_ro : ticket.description_ru;
        const isOpen = optionsModalOpen[ticket.id] || false;

        const OptionsContent = () => (
          <div className="space-y-3">
            <RadioGroup
              value={tempSelectedOptions[ticket.id] || ""}
              onValueChange={(value) => setTempSelectedOptions((prev) => ({ ...prev, [ticket.id]: value }))}
              className="space-y-3"
            >
              {ticket.ticket_options?.map((option) => {
                const optionName = locale === "ro" ? option.name_ro : option.name_ru;
                const optionDescription = locale === "ro" ? (option.description_ro ?? "") : (option.description_ru ?? "");
                const isSelected = tempSelectedOptions[ticket.id] === option.id;

                return (
                  <div
                    key={option.id}
                    className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30 bg-background"
                    }`}
                    onClick={() => setTempSelectedOptions((prev) => ({ ...prev, [ticket.id]: option.id }))}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected ? "border-primary" : "border-muted-foreground/30"
                      }`}>
                        {isSelected && (
                          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <span className={`font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}>
                            {optionName}
                          </span>
                          {option.price_modifier !== undefined && option.price_modifier !== 0 && (
                            <span className="text-sm font-bold text-primary whitespace-nowrap">
                              {option.price_modifier > 0 ? "+" : ""}{option.price_modifier} MDL
                            </span>
                          )}
                        </div>
                        {optionDescription && (
                          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                            {optionDescription}
                          </p>
                        )}
                      </div>
                    </div>
                    <RadioGroupItem
                      value={option.id}
                      id={`modal-${ticket.id}-${option.id}`}
                      className="sr-only"
                    />
                  </div>
                );
              })}
            </RadioGroup>
          </div>
        );

        if (isDesktop) {
          return (
            <Dialog key={ticket.id} open={isOpen} onOpenChange={(open) => !open && handleCloseOptionsModal(ticket.id)}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{ticketName}</DialogTitle>
                  {ticketDesc && <DialogDescription>{ticketDesc}</DialogDescription>}
                </DialogHeader>
                <OptionsContent />
                <DialogFooter>
                  <Button variant="outline" onClick={() => handleCloseOptionsModal(ticket.id)}>
                    {tTickets("close")}
                  </Button>
                  <Button onClick={() => handleConfirmOption(ticket.id)} disabled={!tempSelectedOptions[ticket.id]}>
                    {tTickets("addToCart")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          );
        }

        return (
          <Drawer key={ticket.id} open={isOpen} onOpenChange={(open) => !open && handleCloseOptionsModal(ticket.id)}>
            <DrawerContent>
              <DrawerHeader className="text-left">
                <DrawerTitle>{ticketName}</DrawerTitle>
                {ticketDesc && <DrawerDescription>{ticketDesc}</DrawerDescription>}
              </DrawerHeader>
              <div className="px-4 pb-4">
                <OptionsContent />
              </div>
              <DrawerFooter className="pt-2">
                <Button onClick={() => handleConfirmOption(ticket.id)} disabled={!tempSelectedOptions[ticket.id]}>
                  {tTickets("addToCart")}
                </Button>
                <DrawerClose asChild>
                  <Button variant="outline" onClick={() => handleCloseOptionsModal(ticket.id)}>
                    {tTickets("close")}
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        );
      })}
    </div>
  );
}
