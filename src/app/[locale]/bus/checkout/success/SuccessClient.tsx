"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { CheckCircle2, Home, Loader2, Mail, Bus, ArrowRight, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";
import { trackPurchase } from "@/lib/analytics";

type BusStatus = NonNullable<Awaited<ReturnType<typeof api.getBusOrderStatus>>["data"]>;

const MONTHS_RU = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
const MONTHS_RO = ["ian", "feb", "mar", "apr", "mai", "iun", "iul", "aug", "sep", "oct", "noi", "dec"];
function fmt(iso: string, isRu: boolean) {
  const [, m, d] = iso.split("-").map(Number);
  return `${d} ${(isRu ? MONTHS_RU : MONTHS_RO)[(m || 1) - 1]}`;
}

export default function BusSuccessPage() {
  const t = useTranslations("BusSuccess");
  const locale = useLocale();
  const isRu = locale === "ru";
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");

  const [order, setOrder] = React.useState<BusStatus | null>(null);
  const [loading, setLoading] = React.useState(true);
  const tracked = React.useRef(false);

  React.useEffect(() => {
    if (!orderNumber) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await api.getBusOrderStatus(orderNumber);
        if (!cancelled && res.success && res.data) {
          setOrder(res.data);
          if (!tracked.current) {
            tracked.current = true;
            trackPurchase({ orderNumber, value: res.data.totalAmount });
          }
        }
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderNumber]);

  return (
    <main className="min-h-screen bg-muted/30 pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/40">
              <CheckCircle2 className="h-9 w-9 text-green-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{t("title")}</h1>
            <p className="text-muted-foreground">{t("subtitle")}</p>
            {orderNumber && <Badge variant="secondary" className="mt-3 font-mono text-sm">#{orderNumber}</Badge>}
          </div>

          <Card>
            <CardContent className="p-6 space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : order ? (
                <>
                  <div className="space-y-2">
                    {order.tickets.map((tk, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        {tk.direction === "tur" ? <ArrowRight className="h-4 w-4 text-primary" /> : <ArrowLeft className="h-4 w-4 text-primary" />}
                        <span className="font-medium">{fmt(tk.travelDate, isRu)}</span>
                        <span className="text-muted-foreground">
                          {tk.direction === "tur"
                            ? isRu ? "· Туда (Кишинёв → Фестиваль)" : "· Tur (Chișinău → Festival)"
                            : isRu ? "· Обратно (Фестиваль → Кишинёв)" : "· Retur (Festival → Chișinău)"}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-base font-semibold">
                    <span>{t("total")}</span>
                    <span className="text-primary">{order.totalAmount} MDL</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3 py-4 text-sm text-muted-foreground">
                  <Bus className="h-5 w-5" />
                  {t("noOrder")}
                </div>
              )}

              <div className="flex items-center justify-center gap-2 pt-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                {t("emailSent")}
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 flex justify-center">
            <Button asChild>
              <Link href="/"><Home className="mr-2 h-4 w-4" />{t("backToHome")}</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
