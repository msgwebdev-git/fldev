"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Info, Minus, Plus, Check, Calendar, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useCart } from "@/context/CartContext";

export interface TicketOption {
  id: string;
  name: string;
  nameRo: string;
  nameRu: string;
  descriptionRo?: string;
  descriptionRu?: string;
  priceModifier?: number;
  isDefault?: boolean;
}

export interface TicketData {
  id: string;
  name: string;
  nameRo: string;
  nameRu: string;
  descriptionRo?: string;
  descriptionRu?: string;
  featuresRo?: string[];
  featuresRu?: string[];
  price: number;
  originalPrice?: number;
  currency?: string;
  dates?: string;
  location?: string;
  maxPerOrder?: number;
  hasOptions?: boolean;
  options?: TicketOption[];
}

interface TicketCardProps {
  ticket: TicketData;
}

export function TicketCard({ ticket }: TicketCardProps) {
  const t = useTranslations("Tickets");
  const locale = useLocale();
  const [infoOpen, setInfoOpen] = React.useState(false);
  const [optionsOpen, setOptionsOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { setItemQuantity, getItemQuantity, getSelectedOption } = useCart();

  const {
    id,
    name,
    nameRo,
    nameRu,
    descriptionRo,
    descriptionRu,
    featuresRo = [],
    featuresRu = [],
    price,
    originalPrice,
    currency = "MDL",
    dates,
    location,
    maxPerOrder = 10,
    hasOptions = false,
    options = [],
  } = ticket;

  const isRussian = locale === "ru";

  // Выбираем тексты на основе локали
  const ticketName = isRussian ? nameRu : nameRo;
  const ticketDescription = isRussian ? (descriptionRu ?? "") : (descriptionRo ?? "");
  const features = isRussian ? featuresRu : featuresRo;

  const getOptionName = (option: TicketOption) => {
    return isRussian ? option.nameRu : option.nameRo;
  };

  const getOptionDescription = (option: TicketOption) => {
    return isRussian ? (option.descriptionRu ?? "") : (option.descriptionRo ?? "");
  };

  const defaultOption = options.find((o) => o.isDefault) || options[0];
  const cartOption = getSelectedOption(id);
  const [tempSelectedOptionId, setTempSelectedOptionId] = React.useState<string | undefined>(
    defaultOption?.id
  );
  const selectedOption = cartOption;
  const quantity = getItemQuantity(id, selectedOption?.id);

  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const decreaseQty = () => {
    if (hasOptions && selectedOption) {
      setItemQuantity(ticket, quantity - 1, selectedOption);
    } else {
      setItemQuantity(ticket, quantity - 1);
    }
  };

  const increaseQty = () => {
    if (hasOptions && quantity === 0) {
      setTempSelectedOptionId(defaultOption?.id);
      setOptionsOpen(true);
      return;
    }

    if (hasOptions && selectedOption) {
      setItemQuantity(ticket, Math.min(maxPerOrder, quantity + 1), selectedOption);
    } else {
      setItemQuantity(ticket, Math.min(maxPerOrder, quantity + 1));
    }
  };

  const handleAddWithOption = () => {
    const option = options.find((o) => o.id === tempSelectedOptionId);
    if (option) {
      setItemQuantity(ticket, 1, option);
      setOptionsOpen(false);
    }
  };

  const InfoContent = () => (
    <div className="space-y-4">
      {(dates || location) && (
        <div className="flex flex-col gap-2">
          {dates && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{dates}</span>
            </div>
          )}
          {location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{location}</span>
            </div>
          )}
        </div>
      )}

      {features.length > 0 && (
        <>
          <Separator />
          <div>
            <h4 className="font-medium mb-3">{t("included")}</h4>
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      <Separator />

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{t("price")}</span>
        <div className="flex items-center gap-2">
          {originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {originalPrice} {currency}
            </span>
          )}
          <span className="text-lg font-bold text-primary">
            {price} {currency}
          </span>
        </div>
      </div>
    </div>
  );

  const InfoTrigger = isDesktop ? (
    <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Info className="h-4 w-4" />
          {t("aboutTicket")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{ticketName}</DialogTitle>
          <DialogDescription>{ticketDescription}</DialogDescription>
        </DialogHeader>
        <InfoContent />
      </DialogContent>
    </Dialog>
  ) : (
    <Drawer open={infoOpen} onOpenChange={setInfoOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Info className="h-4 w-4" />
          {t("aboutTicket")}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{ticketName}</DrawerTitle>
          <DrawerDescription>{ticketDescription}</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4">
          <InfoContent />
        </div>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">{t("close")}</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );

  const OptionsDialogContent = () => (
    <div className="space-y-3">
      <RadioGroup
        value={tempSelectedOptionId}
        onValueChange={setTempSelectedOptionId}
        className="space-y-3"
      >
        {options.map((option) => {
          const isSelected = tempSelectedOptionId === option.id;
          return (
            <div
              key={option.id}
              className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/30 bg-background"
              }`}
              onClick={() => setTempSelectedOptionId(option.id)}
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
                      {getOptionName(option)}
                    </span>
                    {option.priceModifier !== undefined && option.priceModifier !== 0 && (
                      <span className="text-sm font-bold text-primary whitespace-nowrap">
                        {option.priceModifier > 0 ? "+" : ""}{option.priceModifier} {currency}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    {getOptionDescription(option)}
                  </p>
                </div>
              </div>
              {/* Hidden radio for accessibility */}
              <RadioGroupItem
                value={option.id}
                id={`modal-${id}-${option.id}`}
                className="sr-only"
              />
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );

  const OptionsModal = isDesktop ? (
    <Dialog open={optionsOpen} onOpenChange={setOptionsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{ticketName}</DialogTitle>
          <DialogDescription>{ticketDescription}</DialogDescription>
        </DialogHeader>
        <OptionsDialogContent />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOptionsOpen(false)}>
            {t("close")}
          </Button>
          <Button onClick={handleAddWithOption} disabled={!tempSelectedOptionId}>
            {t("addToCart")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ) : (
    <Drawer open={optionsOpen} onOpenChange={setOptionsOpen}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{ticketName}</DrawerTitle>
          <DrawerDescription>{ticketDescription}</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4">
          <OptionsDialogContent />
        </div>
        <DrawerFooter className="pt-2">
          <Button onClick={handleAddWithOption} disabled={!tempSelectedOptionId}>
            {t("addToCart")}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">{t("close")}</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );

  return (
    <>
      <Card className="relative flex flex-col h-full transition-all hover:shadow-lg">
        {discount > 0 && (
          <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground z-10">
            -{discount}%
          </Badge>
        )}

        <CardHeader className="pb-2 text-center">
          <CardTitle className="text-lg">{ticketName}</CardTitle>
        </CardHeader>

        <CardContent className="flex-1 space-y-4 flex flex-col items-center">
          <div className="flex items-baseline gap-2 justify-center">
            {originalPrice && (
              <span className="text-base text-muted-foreground line-through">
                {originalPrice} {currency}
              </span>
            )}
            <span className="text-2xl font-bold text-primary">
              {price} {currency}
            </span>
          </div>

          {InfoTrigger}

          {hasOptions && selectedOption && quantity > 0 && (
            <div className="w-full">
              <Separator className="mb-3" />
              <div className="text-center">
                <Badge variant="secondary" className="text-xs">
                  {getOptionName(selectedOption)}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex-col gap-3 pt-0">
          <div className="flex items-center justify-center gap-2 w-full">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={decreaseQty}
              disabled={quantity <= 0}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
            <Button
              variant="default"
              size="icon"
              className="h-9 w-9"
              onClick={increaseQty}
              disabled={quantity >= maxPerOrder}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      {hasOptions && OptionsModal}
    </>
  );
}
