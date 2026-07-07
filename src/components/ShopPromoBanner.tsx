"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { Gift, Ticket } from "lucide-react";
import type { ActivePromotion } from "@/lib/data/merch";

export function ShopPromoBanner({ promotions }: { promotions: ActivePromotion[] }) {
  const t = useTranslations("Shop");
  const locale = useLocale();

  if (!promotions || promotions.length === 0) return null;

  // Show the most valuable single campaign (lowest threshold = easiest to hit).
  const promo = [...promotions].sort((a, b) => a.minOrderAmount - b.minOrderAmount)[0];

  const deadline = promo.endsAt
    ? new Date(promo.endsAt).toLocaleDateString(locale === "ru" ? "ru-RU" : "ro-RO", {
        day: "numeric",
        month: "long",
      })
    : null;

  return (
    <div className="mb-8 overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Gift className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-foreground flex items-center gap-2">
            <Ticket className="h-4 w-4 text-primary" />
            {t("promo.title")}
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("promo.spend", { amount: promo.minOrderAmount })}
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            {promo.remaining != null && (
              <span className="rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary">
                {t("promo.remaining", { count: promo.remaining, max: promo.maxRedemptions ?? promo.remaining })}
              </span>
            )}
            {deadline && (
              <span className="rounded-full bg-muted px-2.5 py-1 font-medium text-muted-foreground">
                {t("promo.until", { date: deadline })}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
