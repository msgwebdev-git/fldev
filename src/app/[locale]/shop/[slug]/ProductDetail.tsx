"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  ArrowLeft,
  Check,
  Minus,
  Plus,
  ShoppingBag,
  Ruler,
  ShieldCheck,
  Truck,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MerchProductCard } from "@/components/MerchProductCard";
import { ProductGallery } from "@/components/ProductGallery";
import { useMerchCart } from "@/context/MerchCartContext";
import { trackAddToCart } from "@/lib/analytics";
import type { ProductData } from "@/lib/data/merch";

interface ProductDetailProps {
  product: ProductData;
  categoryName?: string | null;
  related?: ProductData[];
}

export function ProductDetail({ product, categoryName, related = [] }: ProductDetailProps) {
  const t = useTranslations("Shop");
  const locale = useLocale();
  const isRussian = locale === "ru";

  const name = isRussian ? product.nameRu : product.nameRo;
  const description = isRussian ? product.descriptionRu : product.descriptionRo;
  const sizeChart = isRussian ? product.sizeChartRu : product.sizeChartRo;
  const colorName = isRussian ? product.colorRu : product.colorRo;

  const { addItem, getItemQuantity } = useMerchCart();

  const firstAvailable = product.variants.find((v) => v.stockQuantity > 0);
  const [selectedVariantId, setSelectedVariantId] = React.useState<string | undefined>(firstAvailable?.id);
  const [qty, setQty] = React.useState(1);

  // Reset chosen quantity when the size changes
  React.useEffect(() => setQty(1), [selectedVariantId]);

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId);
  const inCart = selectedVariant ? getItemQuantity(product.id, selectedVariant.id) : 0;
  const maxForVariant = selectedVariant ? Math.min(product.maxPerOrder, selectedVariant.stockQuantity) : 0;

  const unitPrice = product.price + (selectedVariant?.priceModifier ?? 0);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAdd = () => {
    if (!selectedVariant) return;
    addItem(product, selectedVariant, qty);
    trackAddToCart({ id: product.id, name, price: unitPrice, quantity: qty });
  };

  return (
    <main className="min-h-screen bg-background pt-24 pb-24">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/shop" className="inline-flex items-center gap-1 transition-colors hover:text-primary">
            <ArrowLeft className="h-3.5 w-3.5" />
            {t("badge")}
          </Link>
          {categoryName && (
            <>
              <ChevronRight className="h-3.5 w-3.5" />
              <span>{categoryName}</span>
            </>
          )}
        </nav>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
          {/* ── Gallery ─────────────────────────────── */}
          <ProductGallery images={product.images} alt={name} />

          {/* ── Buy panel ───────────────────────────── */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            {categoryName && (
              <span className="mb-3 inline-block rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                {categoryName}
              </span>
            )}

            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{name}</h1>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">
                {unitPrice} {product.currency}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  {product.originalPrice} {product.currency}
                </span>
              )}
              {discount > 0 && (
                <Badge variant="secondary" className="text-primary">−{discount}%</Badge>
              )}
            </div>

            {description && (
              <p className="mt-5 leading-relaxed text-muted-foreground whitespace-pre-line">{description}</p>
            )}

            {colorName && (
              <div className="mt-5 flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">{t("color")}:</span>
                {product.colorHex && (
                  <span
                    className="h-4 w-4 rounded-full border border-border"
                    style={{ backgroundColor: product.colorHex }}
                  />
                )}
                <span className="font-medium">{colorName}</span>
              </div>
            )}

            <Separator className="my-6" />

            {/* Size selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{t("selectSize")}</span>
                {sizeChart && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
                        <Ruler className="h-3.5 w-3.5" />
                        {t("sizeChart")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>{t("sizeChart")}</DialogTitle>
                      </DialogHeader>
                      <p className="whitespace-pre-line text-sm text-muted-foreground">{sizeChart}</p>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => {
                  const soldOut = variant.stockQuantity <= 0;
                  const selected = variant.id === selectedVariantId;
                  return (
                    <button
                      key={variant.id}
                      disabled={soldOut}
                      onClick={() => setSelectedVariantId(variant.id)}
                      className={`relative min-w-[3.25rem] rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition-all ${
                        selected
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:border-primary/40"
                      } ${soldOut ? "cursor-not-allowed opacity-40 line-through" : ""}`}
                    >
                      {variant.size}
                    </button>
                  );
                })}
              </div>

              {selectedVariant && selectedVariant.stockQuantity > 0 && selectedVariant.stockQuantity <= 5 && (
                <p className="text-xs font-medium text-amber-600 dark:text-amber-500">
                  {t("lowStock", { count: selectedVariant.stockQuantity })}
                </p>
              )}
            </div>

            {/* Quantity + add to cart */}
            <div className="mt-6 flex items-stretch gap-3">
              <div className="flex items-center rounded-xl border border-border">
                <button
                  type="button"
                  aria-label="−"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1 || maxForVariant <= 0}
                  className="flex h-full w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center text-lg font-semibold tabular-nums">{qty}</span>
                <button
                  type="button"
                  aria-label="+"
                  onClick={() => setQty((q) => Math.min(maxForVariant, q + 1))}
                  disabled={qty >= maxForVariant}
                  className="flex h-full w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <Button
                size="lg"
                className="flex-1 gap-2 rounded-xl py-6 text-base"
                disabled={!selectedVariant || maxForVariant <= 0}
                onClick={handleAdd}
              >
                <ShoppingBag className="h-5 w-5" />
                {selectedVariant && maxForVariant > 0 ? t("addToCart") : t("outOfStock")}
              </Button>
            </div>

            {inCart > 0 && (
              <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-primary">
                <Check className="h-4 w-4" />
                {t("inCartCount", { count: inCart })}
              </p>
            )}

            {/* Trust badges */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2.5 rounded-xl bg-muted/60 px-3.5 py-3 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 flex-shrink-0 text-primary" />
                {t("trustPayment")}
              </div>
              <div className="flex items-center gap-2.5 rounded-xl bg-muted/60 px-3.5 py-3 text-xs text-muted-foreground">
                <Truck className="h-4 w-4 flex-shrink-0 text-primary" />
                {t("trustDelivery")}
              </div>
            </div>
          </div>
        </div>

        {/* ── Related ─────────────────────────────── */}
        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="mb-6 text-xl font-bold md:text-2xl">{t("related")}</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {related.map((p) => (
                <MerchProductCard key={p.id} product={p} categoryName={categoryName} />
              ))}
            </div>
          </section>
        )}

      </div>
    </main>
  );
}
