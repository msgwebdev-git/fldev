"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { CheckCircle2, Home, Loader2, Mail, Store, Truck, ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";
import { trackPurchase } from "@/lib/analytics";

type MerchStatus = NonNullable<Awaited<ReturnType<typeof api.getMerchOrderStatus>>["data"]>;

export default function MerchSuccessPage() {
  const t = useTranslations("MerchCheckoutSuccess");
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");

  const [order, setOrder] = React.useState<MerchStatus | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const purchaseTracked = React.useRef(false);

  React.useEffect(() => {
    if (!orderNumber) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await api.getMerchOrderStatus(orderNumber);
        if (!cancelled && res.success && res.data) {
          setOrder(res.data);
          if (!purchaseTracked.current) {
            purchaseTracked.current = true;
            trackPurchase({
              orderNumber,
              value: res.data.totalAmount,
              items: res.data.items.map((it) => ({
                id: it.productName,
                name: `${it.productName} (${it.size})`,
                price: it.totalPrice,
                quantity: it.quantity,
              })),
            });
          }
        }
      } catch {
        // silent
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderNumber]);

  const currency = "MDL";

  return (
    <main className="min-h-screen bg-muted/30 pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/40 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-9 w-9 text-green-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{t("title")}</h1>
            <p className="text-muted-foreground">{t("subtitle")}</p>
            {orderNumber && (
              <Badge variant="secondary" className="mt-3 font-mono text-sm">
                #{orderNumber}
              </Badge>
            )}
          </div>

          <Card>
            <CardContent className="p-6 space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : order ? (
                <>
                  <div className="space-y-2">
                    {order.items.map((it, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {it.productName} · {it.size} × {it.quantity}
                        </span>
                        <span className="font-medium tabular-nums">{it.totalPrice} {currency}</span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-1.5 text-sm">
                    {order.discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>{t("discount")}</span>
                        <span>-{order.discountAmount} {currency}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("shipping")}</span>
                      <span>{order.shippingAmount > 0 ? `${order.shippingAmount} ${currency}` : t("free")}</span>
                    </div>
                    <div className="flex justify-between text-base font-semibold pt-1">
                      <span>{t("total")}</span>
                      <span className="text-primary">{order.totalAmount} {currency}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-4">
                    {order.fulfillmentMethod === "delivery" ? (
                      <Truck className="h-5 w-5 text-primary mt-0.5" />
                    ) : (
                      <Store className="h-5 w-5 text-primary mt-0.5" />
                    )}
                    <div className="text-sm">
                      <p className="font-medium">
                        {order.fulfillmentMethod === "delivery" ? t("deliveryTitle") : t("pickupTitle")}
                      </p>
                      <p className="text-muted-foreground mt-0.5">
                        {order.fulfillmentMethod === "delivery" ? t("deliveryDesc") : t("pickupDesc")}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3 text-sm text-muted-foreground py-4">
                  <ShoppingBag className="h-5 w-5" />
                  {t("noOrder")}
                </div>
              )}

              <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground pt-2">
                <Mail className="h-4 w-4" />
                {t("emailSent")}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <Button variant="outline" asChild>
              <Link href="/shop">
                <ShoppingBag className="mr-2 h-4 w-4" />
                {t("backToShop")}
              </Link>
            </Button>
            <Button asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                {t("backToHome")}
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
