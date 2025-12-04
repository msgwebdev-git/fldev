"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
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
import { useMediaQuery } from "@/hooks/use-media-query";
import { useCart } from "@/context/CartContext";

export interface TicketData {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  currency?: string;
  features?: string[];
  dates?: string;
  location?: string;
  maxPerOrder?: number;
}

interface TicketCardProps {
  ticket: TicketData;
}

export function TicketCard({ ticket }: TicketCardProps) {
  const t = useTranslations("Tickets");
  const [infoOpen, setInfoOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { setItemQuantity, getItemQuantity } = useCart();

  const {
    id,
    name,
    description,
    price,
    originalPrice,
    currency = "MDL",
    features = [],
    dates,
    location,
    maxPerOrder = 10,
  } = ticket;

  const quantity = getItemQuantity(id);

  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const decreaseQty = () => {
    setItemQuantity(ticket, quantity - 1);
  };

  const increaseQty = () => {
    setItemQuantity(ticket, Math.min(maxPerOrder, quantity + 1));
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
          <DialogTitle>{name}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
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
          <DrawerTitle>{name}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
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

  return (
    <Card className="relative flex flex-col h-full transition-all hover:shadow-lg">
      {/* Discount Badge */}
      {discount > 0 && (
        <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground z-10">
          -{discount}%
        </Badge>
      )}

      <CardHeader className="pb-2 text-center">
        <CardTitle className="text-lg">{name}</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 space-y-4 flex flex-col items-center">
        {/* Price */}
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

        {/* Info Button */}
        {InfoTrigger}
      </CardContent>

      <CardFooter className="flex-col gap-3 pt-0">
        {/* Quantity Controls - directly updates cart */}
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
  );
}
