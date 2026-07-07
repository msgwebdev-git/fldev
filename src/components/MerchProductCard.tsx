"use client";

import * as React from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ShoppingBag, ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { ProductData } from "@/lib/data/merch";

interface MerchProductCardProps {
  product: ProductData;
  categoryName?: string | null;
}

export function MerchProductCard({ product, categoryName }: MerchProductCardProps) {
  const t = useTranslations("Shop");
  const locale = useLocale();
  const isRussian = locale === "ru";

  const name = isRussian ? product.nameRu : product.nameRo;
  const cover = product.images[0];
  const inStock = product.variants.some((v) => v.stockQuantity > 0);
  const availableSizes = product.variants.filter((v) => v.stockQuantity > 0).map((v) => v.size);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Link href={`/shop/${product.slug}`} className="group block">
      <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.25)]">
        {/* Image */}
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
          {cover ? (
            <Image
              src={cover}
              alt={name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              className={`object-cover transition-transform duration-500 group-hover:scale-[1.06] ${!inStock ? "opacity-60 grayscale" : ""}`}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
              <ShoppingBag className="h-12 w-12" />
            </div>
          )}

          {/* top-left tags */}
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {categoryName && (
              <span className="rounded-full bg-background/85 px-2.5 py-1 text-[11px] font-medium text-foreground backdrop-blur-sm">
                {categoryName}
              </span>
            )}
          </div>

          {/* top-right badges */}
          <div className="absolute right-3 top-3 flex flex-col items-end gap-1.5">
            {discount > 0 && inStock && (
              <Badge className="bg-primary text-primary-foreground shadow-sm">-{discount}%</Badge>
            )}
          </div>

          {/* sold out overlay */}
          {!inStock && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="rounded-full bg-background/90 px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm">
                {t("outOfStock")}
              </span>
            </div>
          )}

          {/* hover: available sizes + open arrow */}
          {inStock && (
            <>
              <div className="absolute bottom-3 left-3 flex flex-wrap gap-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {availableSizes.slice(0, 5).map((s) => (
                  <span key={s} className="rounded-md bg-background/90 px-1.5 py-0.5 text-[10px] font-semibold text-foreground backdrop-blur-sm">
                    {s}
                  </span>
                ))}
              </div>
              <div className="absolute bottom-3 right-3 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col gap-1 p-3.5">
          <div className="flex items-center gap-1.5">
            {product.colorHex && (
              <span
                className="h-3 w-3 flex-shrink-0 rounded-full border border-border"
                style={{ backgroundColor: product.colorHex }}
              />
            )}
            <h3 className="line-clamp-1 text-sm font-medium leading-snug transition-colors group-hover:text-primary">
              {name}
            </h3>
          </div>
          <div className="mt-auto flex items-baseline gap-2 pt-1">
            <span className="text-base font-bold text-foreground">
              {product.price} {product.currency}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {product.originalPrice} {product.currency}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
