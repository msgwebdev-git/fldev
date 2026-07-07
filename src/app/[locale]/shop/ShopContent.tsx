"use client";

import * as React from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion } from "motion/react";
import { ArrowRight, Gift, ShoppingBag } from "lucide-react";

import { MerchProductCard } from "@/components/MerchProductCard";
import type { ProductData, ActivePromotion, MerchCategory, MerchBanner } from "@/lib/data/merch";

interface ShopContentProps {
  products: ProductData[];
  promotions?: ActivePromotion[];
  categories?: MerchCategory[];
  banner?: MerchBanner;
}

const ALL = "__all__";

export function ShopContent({ products, promotions = [], categories = [], banner }: ShopContentProps) {
  const t = useTranslations("Shop");
  const locale = useLocale();
  const isRu = locale === "ru";

  const [active, setActive] = React.useState<string>(ALL);

  // Only surface categories that actually have products
  const usedCategoryIds = React.useMemo(
    () => new Set(products.map((p) => p.categoryId).filter(Boolean) as string[]),
    [products]
  );
  const visibleCategories = React.useMemo(
    () => categories.filter((c) => usedCategoryIds.has(c.id)),
    [categories, usedCategoryIds]
  );
  const categoryName = React.useCallback(
    (id: string | null) => {
      const c = categories.find((x) => x.id === id);
      return c ? (isRu ? c.nameRu : c.nameRo) : null;
    },
    [categories, isRu]
  );

  const filtered = React.useMemo(
    () => (active === ALL ? products : products.filter((p) => p.categoryId === active)),
    [products, active]
  );

  const topPromo = React.useMemo(
    () => (promotions.length ? [...promotions].sort((a, b) => a.minOrderAmount - b.minOrderAmount)[0] : null),
    [promotions]
  );

  return (
    <main className="min-h-screen bg-background pb-24">
      <div className="container mx-auto px-4">
        <h1 className="sr-only">{t("pageTitle")}</h1>

        {/* ── Photo banner ────────────────────────────── */}
        <section className="mt-20">
          {banner?.url ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative w-full overflow-hidden rounded-[2rem]"
            >
              {/* mobile */}
              <div className="relative aspect-[16/10] w-full sm:hidden">
                <Image
                  src={banner.urlMobile || banner.url}
                  alt=""
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
              {/* desktop */}
              <div className="relative hidden aspect-[21/8] w-full sm:block">
                <Image src={banner.url} alt="" fill priority sizes="100vw" className="object-cover" />
              </div>
            </motion.div>
          ) : (
            <div className="flex aspect-[16/10] w-full items-center justify-center rounded-[2rem] bg-muted sm:aspect-[21/8]">
              <ShoppingBag className="h-12 w-12 text-muted-foreground/30" />
            </div>
          )}
        </section>

        {/* ── Promo strip ─────────────────────────────── */}
        {topPromo && (
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-primary/25 bg-primary/5 px-4 py-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Gift className="h-5 w-5" />
            </div>
            <p className="text-sm text-foreground">
              <span className="font-semibold">{t("promo.title")}.</span>{" "}
              {t("promo.spend", { amount: topPromo.minOrderAmount })}
              {topPromo.remaining != null && (
                <span className="text-muted-foreground"> · {t("promo.remaining", { count: topPromo.remaining, max: topPromo.maxRedemptions ?? topPromo.remaining })}</span>
              )}
            </p>
          </div>
        )}

        {/* ── Category filter ─────────────────────────── */}
        {visibleCategories.length > 0 && (
          <div className="sticky top-[76px] z-30 -mx-4 mt-8 mb-2 bg-background/80 px-4 py-3 backdrop-blur-md">
            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <FilterPill label={t("allCategories")} count={products.length} active={active === ALL} onClick={() => setActive(ALL)} />
              {visibleCategories.map((c) => {
                const count = products.filter((p) => p.categoryId === c.id).length;
                return (
                  <FilterPill
                    key={c.id}
                    label={isRu ? c.nameRu : c.nameRo}
                    count={count}
                    active={active === c.id}
                    onClick={() => setActive(c.id)}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* ── Grid ────────────────────────────────────── */}
        <div className="mt-6">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-24 text-muted-foreground">
              <ShoppingBag className="h-12 w-12 text-muted-foreground/40" />
              <p>{t("empty")}</p>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
              {filtered.map((product) => (
                <MerchProductCard key={product.id} product={product} categoryName={categoryName(product.categoryId)} />
              ))}
            </motion.div>
          )}
        </div>

        {/* subtle footer CTA */}
        <div className="mt-16 flex items-center justify-center">
          <Link
            href="/tickets"
            className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            {t("ticketsCta")}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </main>
  );
}

function FilterPill({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
        active
          ? "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/20"
          : "border-border bg-background text-foreground hover:border-primary/40"
      }`}
    >
      {label}
      <span className={`text-xs ${active ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{count}</span>
    </button>
  );
}
