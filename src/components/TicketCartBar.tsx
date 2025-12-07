"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { X, CreditCard, Ticket, ShoppingCart, Minus, Plus, Trash2, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { useCart, CartItem } from "@/context/CartContext";
import { useMediaQuery } from "@/hooks/use-media-query";

// Get localized ticket name
function getTicketName(item: CartItem, locale: string) {
  return locale === "ru" ? item.ticket.nameRu : item.ticket.nameRo;
}

// Get localized option name
function getOptionName(item: CartItem, locale: string) {
  if (!item.selectedOption) return null;
  return locale === "ru" ? item.selectedOption.nameRu : item.selectedOption.nameRo;
}

// Get item price including option modifier
function getItemPrice(item: CartItem) {
  return item.ticket.price + (item.selectedOption?.priceModifier ?? 0);
}

// Desktop: Mini ticket card for bottom bar
function MiniTicketCard({
  item,
  onRemove,
  locale,
}: {
  item: CartItem;
  onRemove: () => void;
  locale: string;
}) {
  const [isHovered, setIsHovered] = React.useState(false);

  const ticketName = getTicketName(item, locale);
  const optionName = getOptionName(item, locale);

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.8, x: -20 }}
            animate={{
              opacity: 1,
              scale: 1,
              x: 0,
            }}
            exit={{ opacity: 0, scale: 0.8, x: -20 }}
            whileHover={{
              scale: 1.03,
              y: -4,
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="relative flex-shrink-0 cursor-pointer group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Quantity badge */}
            {item.quantity > 1 && (
              <Badge
                className="absolute -top-2 -right-2 z-20 h-5 w-5 p-0 flex items-center justify-center text-[10px] font-bold shadow-md"
                variant="default"
              >
                {item.quantity}
              </Badge>
            )}

            {/* Remove button */}
            <AnimatePresence>
              {isHovered && (
                <motion.button
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                  }}
                  className="absolute -top-1.5 -left-1.5 z-30 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 transition-colors shadow-md"
                >
                  <X className="h-3 w-3" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Ticket Card */}
            <div className="relative overflow-hidden rounded-lg bg-background shadow-md border border-border transition-all duration-200 group-hover:shadow-lg group-hover:border-primary/20">
              {/* Left accent stripe */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />

              {/* Content */}
              <div className="pl-3.5 pr-3 py-2 min-w-[90px]">
                {/* Ticket icon + name */}
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Ticket className="h-3 w-3 text-primary flex-shrink-0" />
                  <p className="text-[11px] font-medium text-foreground leading-tight truncate max-w-[65px]">
                    {ticketName}
                  </p>
                </div>

                {/* Option name if exists */}
                {optionName && (
                  <p className="text-[9px] text-muted-foreground truncate max-w-[80px] -mt-0.5 mb-0.5">
                    {optionName}
                  </p>
                )}

                {/* Price */}
                <p className="font-bold text-sm text-primary">
                  {getItemPrice(item) * item.quantity}{" "}
                  <span className="text-[10px] font-normal text-muted-foreground">
                    {item.ticket.currency || "MDL"}
                  </span>
                </p>
              </div>
            </div>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[200px]">
          <div className="space-y-1">
            <p className="font-medium">{ticketName}</p>
            {optionName && (
              <p className="text-xs text-primary">{optionName}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {item.quantity} × {getItemPrice(item)} {item.ticket.currency || "MDL"}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Mobile: Cart item in drawer
function DrawerCartItem({
  item,
  locale,
  onRemove,
  onUpdateQuantity,
}: {
  item: CartItem;
  locale: string;
  onRemove: () => void;
  onUpdateQuantity: (quantity: number) => void;
}) {
  const ticketName = getTicketName(item, locale);
  const optionName = getOptionName(item, locale);
  const itemPrice = getItemPrice(item);
  const maxPerOrder = item.ticket.maxPerOrder ?? 10;

  return (
    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
      {/* Ticket icon */}
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Ticket className="h-5 w-5 text-primary" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{ticketName}</p>
        {optionName && (
          <p className="text-xs text-muted-foreground truncate">{optionName}</p>
        )}
        <p className="text-sm font-bold text-primary mt-0.5">
          {itemPrice * item.quantity} {item.ticket.currency || "MDL"}
        </p>
      </div>

      {/* Quantity controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onUpdateQuantity(item.quantity - 1)}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onUpdateQuantity(Math.min(maxPerOrder, item.quantity + 1))}
          disabled={item.quantity >= maxPerOrder}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {/* Remove button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
        onClick={onRemove}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function TicketCartBar() {
  const t = useTranslations("Cart");
  const locale = useLocale();
  const pathname = usePathname();
  const { items, totalPrice, totalItems, removeItem, updateQuantity } = useCart();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  // Hide on checkout and b2b pages
  if (pathname.includes("/checkout")) return null;
  if (pathname.includes("/b2b")) return null;
  if (items.length === 0) return null;

  // Mobile version with drawer
  if (!isDesktop) {
    return (
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50"
        >
          <div className="bg-background/95 backdrop-blur-xl border-t shadow-lg">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                {/* Cart info - tap to open drawer */}
                <DrawerTrigger asChild>
                  <button className="flex items-center gap-3 flex-1 min-w-0 group">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <ShoppingCart className="h-5 w-5 text-primary" />
                      </div>
                      <Badge
                        className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] font-bold"
                        variant="default"
                      >
                        {totalItems}
                      </Badge>
                    </div>
                    <div className="text-left min-w-0">
                      <p className="text-xs text-muted-foreground">
                        {totalItems} {totalItems === 1 ? t("ticket") : t("tickets")}
                      </p>
                      <p className="font-bold text-lg leading-tight">
                        {totalPrice} <span className="text-sm font-normal text-muted-foreground">MDL</span>
                      </p>
                    </div>
                    {/* Chevron indicator */}
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted group-active:bg-muted/80 transition-colors">
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </button>
                </DrawerTrigger>

                {/* Checkout button */}
                <Button size="lg" className="gap-2 px-6" asChild>
                  <Link href="/checkout">
                    <CreditCard className="h-4 w-4" />
                    {t("checkout")}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5 text-primary" />
              {t("yourTickets")}
              <Badge variant="secondary">{totalItems}</Badge>
            </DrawerTitle>
          </DrawerHeader>

          <div className="px-4 pb-4 space-y-3 max-h-[50vh] overflow-y-auto">
            {items.map((item) => (
              <DrawerCartItem
                key={`${item.ticket.id}:${item.selectedOption?.id ?? ''}`}
                item={item}
                locale={locale}
                onRemove={() => removeItem(item.ticket.id, item.selectedOption?.id)}
                onUpdateQuantity={(qty) => updateQuantity(item.ticket.id, qty, item.selectedOption?.id)}
              />
            ))}
          </div>

          <Separator />

          <DrawerFooter>
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground">{t("total")}</span>
              <span className="text-xl font-bold">
                {totalPrice} <span className="text-sm font-normal text-muted-foreground">MDL</span>
              </span>
            </div>
            <Button size="lg" className="w-full gap-2" asChild>
              <Link href="/checkout" onClick={() => setDrawerOpen(false)}>
                <CreditCard className="h-5 w-5" />
                {t("checkout")}
              </Link>
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">
                {t("continueShopping")}
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop version with inline cards
  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50"
      >
        {/* Bottom bar background */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-background/95 backdrop-blur-xl border-t shadow-lg" />

        {/* Content */}
        <div className="relative container mx-auto px-4">
          <div className="flex items-end justify-between gap-4">
            {/* Cards stack - positioned to overlap the bar */}
            <div className="flex-1 overflow-visible pb-2 pt-6 -mt-2">
              <div className="flex items-end gap-3 pl-2 pr-4 pt-4 pb-2">
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <MiniTicketCard
                      key={`${item.ticket.id}:${item.selectedOption?.id ?? ''}`}
                      item={item}
                      locale={locale}
                      onRemove={() => removeItem(item.ticket.id, item.selectedOption?.id)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Total and checkout */}
            <div className="flex items-center gap-4 pb-2 h-20">
              {/* Total */}
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end text-muted-foreground text-sm">
                  <span>{t("total")}</span>
                  <Badge variant="secondary" className="text-xs">
                    {totalItems}
                  </Badge>
                </div>
                <p className="text-xl font-bold">
                  {totalPrice} <span className="text-sm font-normal text-muted-foreground">MDL</span>
                </p>
              </div>

              {/* Checkout button */}
              <Button size="lg" className="gap-2 px-8 py-6 text-base shadow-lg" asChild>
                <Link href="/checkout">
                  <CreditCard className="h-5 w-5" />
                  <span className="hidden sm:inline">{t("checkout")}</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
