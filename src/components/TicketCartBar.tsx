"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  Ticket,
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

function getTicketName(item: CartItem, locale: string) {
  return locale === "ru" ? item.ticket.nameRu : item.ticket.nameRo;
}

function getOptionName(item: CartItem, locale: string) {
  if (!item.selectedOption) return null;
  return locale === "ru"
    ? item.selectedOption.nameRu
    : item.selectedOption.nameRo;
}

function getItemPrice(item: CartItem) {
  return item.ticket.price + (item.selectedOption?.priceModifier ?? 0);
}

// #3 — Badge pulse animation on totalItems change
function PulseBadge({ count }: { count: number }) {
  const [pulse, setPulse] = React.useState(false);
  const prevCount = React.useRef(count);

  React.useEffect(() => {
    if (count !== prevCount.current) {
      setPulse(true);
      prevCount.current = count;
      const timer = setTimeout(() => setPulse(false), 300);
      return () => clearTimeout(timer);
    }
  }, [count]);

  return (
    <Badge
      className={`absolute -top-1.5 -right-1.5 h-5 w-5 p-0 flex items-center justify-center text-[10px] font-bold shadow-sm transition-transform duration-300 ${pulse ? "scale-125" : "scale-100"}`}
    >
      {count}
    </Badge>
  );
}

// Desktop: Compact inline cart item row
function InlineCartItem({
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
  const t = useTranslations("Cart");
  const ticketName = getTicketName(item, locale);
  const optionName = getOptionName(item, locale);
  const itemPrice = getItemPrice(item);
  const maxPerOrder = item.ticket.maxPerOrder ?? 10;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, transition: { duration: 0.15 } }}
      className="flex items-center gap-3 py-2.5 group"
    >
      {/* Ticket info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground truncate">
            {ticketName}
          </p>
          {optionName && (
            <>
              <span className="text-muted-foreground/40">·</span>
              <p className="text-xs text-muted-foreground truncate">
                {optionName}
              </p>
            </>
          )}
        </div>
      </div>

      {/* #6 — Quantity stepper with aria-labels */}
      <div
        className="flex items-center gap-0.5 rounded-full border border-border bg-muted/50 p-0.5"
        role="group"
        aria-label={`${ticketName} ${t("quantity")}`}
      >
        <button
          onClick={() => onUpdateQuantity(item.quantity - 1)}
          aria-label={item.quantity <= 1 ? t("remove") : `${t("decrease")} ${ticketName}`}
          className="h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
        >
          <Minus className="h-3 w-3" />
        </button>
        <span
          className="w-6 text-center text-xs font-semibold tabular-nums"
          aria-live="polite"
        >
          {item.quantity}
        </span>
        <button
          onClick={() =>
            onUpdateQuantity(Math.min(maxPerOrder, item.quantity + 1))
          }
          disabled={item.quantity >= maxPerOrder}
          aria-label={`${t("increase")} ${ticketName}`}
          className="h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background transition-colors disabled:opacity-30"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>

      {/* Price */}
      <div className="text-right min-w-[72px]">
        <p className="text-sm font-semibold tabular-nums">
          {itemPrice * item.quantity}{" "}
          <span className="text-xs font-normal text-muted-foreground">
            MDL
          </span>
        </p>
      </div>

      {/* Remove */}
      <button
        onClick={onRemove}
        aria-label={`${t("remove")} ${ticketName}`}
        className="h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground/0 group-hover:text-muted-foreground hover:!text-destructive hover:bg-destructive/10 transition-all"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
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
  const t = useTranslations("Cart");
  const ticketName = getTicketName(item, locale);
  const optionName = getOptionName(item, locale);
  const itemPrice = getItemPrice(item);
  const maxPerOrder = item.ticket.maxPerOrder ?? 10;

  return (
    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{ticketName}</p>
        {optionName && (
          <p className="text-xs text-muted-foreground truncate">
            {optionName}
          </p>
        )}
        <p className="text-sm font-semibold mt-0.5 tabular-nums">
          {itemPrice * item.quantity}{" "}
          <span className="text-xs font-normal text-muted-foreground">
            {item.ticket.currency || "MDL"}
          </span>
        </p>
      </div>

      {/* #6 — Quantity controls with aria-labels */}
      <div
        className="flex items-center gap-0.5 rounded-full border border-border bg-background p-0.5"
        role="group"
        aria-label={`${ticketName} ${t("quantity")}`}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-full"
          onClick={() => onUpdateQuantity(item.quantity - 1)}
          aria-label={item.quantity <= 1 ? t("remove") : `${t("decrease")} ${ticketName}`}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span
          className="w-7 text-center font-semibold text-sm tabular-nums"
          aria-live="polite"
        >
          {item.quantity}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-full"
          onClick={() =>
            onUpdateQuantity(Math.min(maxPerOrder, item.quantity + 1))
          }
          disabled={item.quantity >= maxPerOrder}
          aria-label={`${t("increase")} ${ticketName}`}
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
        aria-label={`${t("remove")} ${ticketName}`}
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
  const { items, totalPrice, totalItems, removeItem, updateQuantity } =
    useCart();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const barRef = React.useRef<HTMLDivElement>(null);

  // #4 — Close expanded panel on route change
  React.useEffect(() => {
    setExpanded(false);
  }, [pathname]);

  // #2 — Click outside closes expanded panel
  React.useEffect(() => {
    if (!expanded) return;

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        barRef.current &&
        !barRef.current.contains(target)
      ) {
        setExpanded(false);
      }
    }

    // Use timeout so the opening click doesn't immediately close
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [expanded]);

  // Hide on checkout and b2b pages
  if (pathname.includes("/checkout")) return null;
  if (pathname.includes("/b2b")) return null;
  if (items.length === 0) return null;

  // Spacer to prevent content from being hidden behind fixed bar
  const spacer = <div className="h-20 md:h-16" />;

  // Mobile version with drawer
  if (!isDesktop) {
    return (
      <>
      {spacer}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50"
        >
          {/* #5 — Dark mode shadow fix */}
          <div className="bg-background/95 backdrop-blur-xl border-t shadow-[0_-4px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.4)]">
            <div className="container mx-auto px-4 py-2.5">
              <div className="flex items-center gap-3">
                {/* Left: Ticket icon + summary — tap opens drawer */}
                <DrawerTrigger asChild>
                  <button className="flex items-center gap-2.5 flex-1 min-w-0 text-left">
                    <div className="relative flex-shrink-0">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Ticket className="h-[18px] w-[18px] text-primary" />
                      </div>
                      <PulseBadge count={totalItems} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-foreground truncate leading-tight">
                        {items.map((item, i) => {
                          const name = getTicketName(item, locale);
                          return (
                            <React.Fragment key={`${item.ticket.id}:${item.selectedOption?.id ?? ""}`}>
                              {i > 0 && (
                                <span className="text-muted-foreground/40 mx-1">·</span>
                              )}
                              <span className="font-medium">{name}</span>
                              <span className="text-muted-foreground ml-0.5">×{item.quantity}</span>
                            </React.Fragment>
                          );
                        })}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-0.5">
                        <span className="font-semibold text-foreground tabular-nums">{totalPrice.toLocaleString()} MDL</span>
                        <ChevronUp className="h-3 w-3 text-muted-foreground" />
                      </p>
                    </div>
                  </button>
                </DrawerTrigger>

                {/* Right: Checkout */}
                <Button size="lg" className="gap-2 px-5 rounded-xl flex-shrink-0" asChild>
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
          <DrawerHeader className="flex flex-row items-center justify-between">
            <DrawerTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5 text-primary" />
              {t("yourTickets")}
              <Badge variant="secondary">{totalItems}</Badge>
            </DrawerTitle>
            <DrawerClose asChild>
              <button
                aria-label={t("close")}
                className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </DrawerClose>
          </DrawerHeader>

          <div className="px-4 pb-4 space-y-2.5 max-h-[50vh] overflow-y-auto">
            {items.map((item) => (
              <DrawerCartItem
                key={`${item.ticket.id}:${item.selectedOption?.id ?? ""}`}
                item={item}
                locale={locale}
                onRemove={() =>
                  removeItem(item.ticket.id, item.selectedOption?.id)
                }
                onUpdateQuantity={(qty) =>
                  updateQuantity(
                    item.ticket.id,
                    qty,
                    item.selectedOption?.id
                  )
                }
              />
            ))}
          </div>

          <Separator />

          <DrawerFooter>
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground">{t("total")}</span>
              <span className="text-xl font-bold">
                {totalPrice}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  MDL
                </span>
              </span>
            </div>
            <Button size="lg" className="w-full gap-2 rounded-xl" asChild>
              <Link href="/checkout" onClick={() => setDrawerOpen(false)}>
                <CreditCard className="h-5 w-5" />
                {t("checkout")}
              </Link>
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      </>
    );
  }

  // Desktop version — clean expandable bar
  return (
    <>
    {spacer}
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50"
      >
        {/* Expandable items panel */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              ref={panelRef}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="overflow-hidden"
            >
              {/* #5 — Dark mode shadow */}
              <div className="bg-background border-t border-x border-border rounded-t-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.4)] mx-4 lg:mx-auto lg:max-w-3xl">
                <div className="px-5 pt-4 pb-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Ticket className="h-4 w-4 text-primary" />
                      {t("yourTickets")}
                    </h3>
                    <button
                      onClick={() => setExpanded(false)}
                      aria-label={t("close")}
                      className="h-7 w-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="divide-y divide-border/50">
                    <AnimatePresence mode="popLayout">
                      {items.map((item) => (
                        <InlineCartItem
                          key={`${item.ticket.id}:${item.selectedOption?.id ?? ""}`}
                          item={item}
                          locale={locale}
                          onRemove={() =>
                            removeItem(
                              item.ticket.id,
                              item.selectedOption?.id
                            )
                          }
                          onUpdateQuantity={(qty) =>
                            updateQuantity(
                              item.ticket.id,
                              qty,
                              item.selectedOption?.id
                            )
                          }
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom bar */}
        {/* #5 — Dark mode shadow */}
        <div
          ref={barRef}
          className="bg-background/95 backdrop-blur-xl border-t shadow-[0_-4px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.4)]"
        >
          <div className="container mx-auto px-4">
            <div className="flex items-center h-16 gap-5">
              {/* Left: Cart toggle */}
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-3 group cursor-pointer flex-shrink-0"
                aria-expanded={expanded}
                aria-controls="cart-panel"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                    <Ticket className="h-5 w-5 text-primary" />
                  </div>
                  <PulseBadge count={totalItems} />
                </div>
                <motion.span
                  animate={{ rotate: expanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-muted-foreground group-hover:text-foreground transition-colors"
                >
                  <ChevronUp className="h-4 w-4" />
                </motion.span>
              </button>

              {/* Center: Inline ticket summary — visible at a glance */}
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex-1 min-w-0 text-left cursor-pointer group"
              >
                <p className="text-sm text-foreground truncate">
                  {items.map((item, i) => {
                    const name = getTicketName(item, locale);
                    return (
                      <React.Fragment key={`${item.ticket.id}:${item.selectedOption?.id ?? ""}`}>
                        {i > 0 && (
                          <span className="text-muted-foreground/40 mx-1.5">·</span>
                        )}
                        <span className="font-medium">{name}</span>
                        <span className="text-muted-foreground ml-1">×{item.quantity}</span>
                      </React.Fragment>
                    );
                  })}
                </p>
                <p className="text-xs text-muted-foreground group-hover:text-primary transition-colors mt-0.5">
                  {t("yourTickets")}
                </p>
              </button>

              {/* Right: Total + Checkout */}
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground leading-none mb-0.5">
                    {t("total")}
                  </p>
                  <p className="text-xl font-bold tabular-nums leading-tight">
                    {totalPrice.toLocaleString()}{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      MDL
                    </span>
                  </p>
                </div>

                <Button
                  size="lg"
                  className="gap-2 px-7 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-shadow"
                  asChild
                >
                  <Link href="/checkout">
                    <CreditCard className="h-4 w-4" />
                    {t("checkout")}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
    </>
  );
}
