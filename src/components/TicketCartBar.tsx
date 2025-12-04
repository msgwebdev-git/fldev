"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { X, CreditCard, Ticket } from "lucide-react";
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
import { useCart, CartItem } from "@/context/CartContext";

// Mini ticket card for bottom bar
function MiniTicketCard({
  item,
  index,
  onRemove,
}: {
  item: CartItem;
  index: number;
  onRemove: () => void;
}) {
  const [isHovered, setIsHovered] = React.useState(false);

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
                    {item.ticket.name}
                  </p>
                </div>

                {/* Price */}
                <p className="font-bold text-sm text-primary">
                  {item.ticket.price * item.quantity}{" "}
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
            <p className="font-medium">{item.ticket.name}</p>
            <p className="text-xs text-muted-foreground">
              {item.quantity} × {item.ticket.price} {item.ticket.currency || "MDL"}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function TicketCartBar() {
  const t = useTranslations("Cart");
  const pathname = usePathname();
  const { items, totalPrice, totalItems, removeItem } = useCart();

  // Hide on checkout pages
  if (pathname.includes("/checkout")) return null;
  if (items.length === 0) return null;

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
                  {items.map((item, index) => (
                    <MiniTicketCard
                      key={item.ticket.id}
                      item={item}
                      index={index}
                      onRemove={() => removeItem(item.ticket.id)}
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
