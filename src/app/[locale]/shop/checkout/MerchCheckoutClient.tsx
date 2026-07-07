"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import {
  ArrowLeft,
  ShoppingBag,
  Shield,
  Lock,
  Loader2,
  User,
  Mail,
  MapPin,
  Store,
  Truck,
  AlertCircle,
  CheckCircle2,
  Tag,
  X,
} from "lucide-react";
import { isValidPhoneNumber } from "react-phone-number-input";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { PhoneInput } from "@/components/ui/phone-input";
import { useMerchCart } from "@/context/MerchCartContext";
import { api } from "@/lib/api";
import type { MerchShippingSettings, ActivePromotion } from "@/lib/data/merch";
import { Gift } from "lucide-react";

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

type Fulfillment = "pickup" | "delivery";

export function MerchCheckoutClient({
  shipping,
  promotions = [],
}: {
  shipping: MerchShippingSettings;
  promotions?: ActivePromotion[];
}) {
  const t = useTranslations("MerchCheckout");
  const tShop = useTranslations("Shop");
  const tCart = useTranslations("ShopCart");
  const router = useRouter();
  const locale = useLocale() as "ro" | "ru";
  const { items, totalPrice, totalItems, clearCart, isHydrated } = useMerchCart();

  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    region: "",
    postalCode: "",
    notes: "",
  });
  const [fulfillment, setFulfillment] = React.useState<Fulfillment>("pickup");
  const [acceptTerms, setAcceptTerms] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitError, setSubmitError] = React.useState("");

  const [promoCode, setPromoCode] = React.useState("");
  const [promoApplied, setPromoApplied] = React.useState<{ code: string; discount: number; discountAmount?: number } | null>(null);
  const [promoError, setPromoError] = React.useState("");
  const [promoLoading, setPromoLoading] = React.useState(false);

  const currency = items[0]?.product.currency ?? "MDL";

  const discountAmount = promoApplied
    ? promoApplied.discount > 0
      ? Math.round((totalPrice * promoApplied.discount) / 100)
      : promoApplied.discountAmount ?? 0
    : 0;

  const shippingAmount = React.useMemo(() => {
    if (fulfillment === "pickup") return 0;
    const { shippingFee, freeShippingThreshold } = shipping;
    if (freeShippingThreshold != null && totalPrice >= freeShippingThreshold) return 0;
    return shippingFee;
  }, [fulfillment, shipping, totalPrice]);

  const finalPrice = Math.max(0, totalPrice - discountAmount) + shippingAmount;

  const promo = React.useMemo(
    () => (promotions.length ? [...promotions].sort((a, b) => a.minOrderAmount - b.minOrderAmount)[0] : null),
    [promotions]
  );
  const promoQualified = promo ? totalPrice >= promo.minOrderAmount : false;
  const promoRemaining = promo ? Math.max(0, promo.minOrderAmount - totalPrice) : 0;

  React.useEffect(() => {
    if (isHydrated && items.length === 0) router.push("/shop");
  }, [items.length, router, isHydrated]);

  const applyPromoCode = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoError("");
    try {
      const result = await api.validatePromo(promoCode, totalPrice);
      if (result.success && result.data) {
        setPromoApplied({
          code: result.data.code,
          discount: result.data.discountPercent || 0,
          discountAmount: result.data.discountAmount,
        });
        setPromoCode("");
      } else {
        setPromoError(result.error || t("orderSummary.promoError"));
      }
    } catch {
      setPromoError(t("orderSummary.promoError"));
    }
    setPromoLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const e: Record<string, string> = {};
    if (!formData.firstName.trim()) e.firstName = t("errors.required");
    if (!formData.lastName.trim()) e.lastName = t("errors.required");
    if (!formData.email.trim()) e.email = t("errors.required");
    else if (!validateEmail(formData.email)) e.email = t("errors.invalidEmail");
    if (!formData.phone) e.phone = t("errors.required");
    else if (!isValidPhoneNumber(formData.phone)) e.phone = t("errors.invalidPhone");
    if (fulfillment === "delivery") {
      if (!formData.address.trim()) e.address = t("errors.required");
      if (!formData.city.trim()) e.city = t("errors.required");
    }
    if (!acceptTerms) e.terms = t("errors.acceptTerms");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const result = await api.createMerchOrder({
        customer: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
        },
        items: items.map((item) => ({
          productId: item.product.id,
          variantId: item.variant.id,
          quantity: item.quantity,
        })),
        fulfillmentMethod: fulfillment,
        shippingAddress:
          fulfillment === "delivery"
            ? {
                address: formData.address,
                city: formData.city,
                region: formData.region || undefined,
                postalCode: formData.postalCode || undefined,
                notes: formData.notes || undefined,
              }
            : undefined,
        promoCode: promoApplied?.code,
        language: locale,
      });

      if (result.success && result.data) {
        clearCart();
        window.location.href = result.data.redirectUrl;
      } else {
        setSubmitError(result.error || t("errors.orderFailed"));
        setIsSubmitting(false);
      }
    } catch {
      setSubmitError(t("errors.orderFailed"));
      setIsSubmitting(false);
    }
  };

  if (!isHydrated) {
    return (
      <main className="min-h-screen bg-muted/30 pt-24 pb-20">
        <div className="container mx-auto px-4 text-center">
          <Loader2 className="h-8 w-8 mx-auto text-primary animate-spin" />
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-background pt-24 pb-20">
        <div className="container mx-auto px-4 text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">{tCart("empty")}</h1>
          <Button asChild className="mt-4">
            <Link href="/shop">{t("backToShop")}</Link>
          </Button>
        </div>
      </main>
    );
  }

  const fulfillmentOption = (value: Fulfillment, Icon: typeof Store, title: string, desc: string) => {
    const selected = fulfillment === value;
    return (
      <button
        type="button"
        onClick={() => setFulfillment(value)}
        className={`flex-1 flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all ${
          selected ? "border-primary" : "border-border hover:border-primary/40"
        }`}
      >
        <Icon className={`h-5 w-5 mt-0.5 ${selected ? "text-primary" : "text-muted-foreground"}`} />
        <div>
          <p className={`font-semibold ${selected ? "text-primary" : ""}`}>{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
        </div>
      </button>
    );
  };

  return (
    <main className="min-h-screen bg-muted/30 pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/shop">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("backToShop")}
            </Link>
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    {t("customerInfo.title")}
                  </CardTitle>
                  <CardDescription>{t("customerInfo.subtitle")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <InputGroup className={`h-12 ${errors.firstName ? "border-destructive" : ""}`}>
                        <InputGroupAddon><User className="h-4 w-4" /></InputGroupAddon>
                        <InputGroupInput name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder={t("customerInfo.firstName")} className="h-12 text-base" />
                      </InputGroup>
                      {errors.firstName && <p className="text-sm text-destructive pl-1">{errors.firstName}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <InputGroup className={`h-12 ${errors.lastName ? "border-destructive" : ""}`}>
                        <InputGroupAddon><User className="h-4 w-4" /></InputGroupAddon>
                        <InputGroupInput name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder={t("customerInfo.lastName")} className="h-12 text-base" />
                      </InputGroup>
                      {errors.lastName && <p className="text-sm text-destructive pl-1">{errors.lastName}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <InputGroup className={`h-12 ${errors.email ? "border-destructive" : validateEmail(formData.email) ? "border-green-500" : ""}`}>
                        <InputGroupAddon><Mail className="h-4 w-4" /></InputGroupAddon>
                        <InputGroupInput name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder={t("customerInfo.email")} className="h-12 text-base" />
                      </InputGroup>
                      {errors.email && <p className="text-sm text-destructive pl-1">{errors.email}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <div className={errors.phone ? "[&_button]:border-destructive [&_input]:border-destructive" : ""}>
                        <PhoneInput
                          value={formData.phone}
                          onChange={(value) => {
                            setFormData((prev) => ({ ...prev, phone: value }));
                            if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
                          }}
                        />
                      </div>
                      {errors.phone && <p className="text-sm text-destructive pl-1">{errors.phone}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Fulfillment */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("fulfillment.title")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    {fulfillmentOption("pickup", Store, t("fulfillment.pickup"), t("fulfillment.pickupDesc"))}
                    {fulfillmentOption("delivery", Truck, t("fulfillment.delivery"), t("fulfillment.deliveryDesc"))}
                  </div>

                  {fulfillment === "delivery" && (
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <MapPin className="h-4 w-4 text-primary" />
                        {t("address.title")}
                      </div>
                      <div className="space-y-1.5">
                        <Input name="address" value={formData.address} onChange={handleInputChange} placeholder={t("address.address")} className={`h-12 ${errors.address ? "border-destructive" : ""}`} />
                        {errors.address && <p className="text-sm text-destructive pl-1">{errors.address}</p>}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5 sm:col-span-1">
                          <Input name="city" value={formData.city} onChange={handleInputChange} placeholder={t("address.city")} className={`h-12 ${errors.city ? "border-destructive" : ""}`} />
                          {errors.city && <p className="text-sm text-destructive pl-1">{errors.city}</p>}
                        </div>
                        <Input name="region" value={formData.region} onChange={handleInputChange} placeholder={t("address.region")} className="h-12" />
                        <Input name="postalCode" value={formData.postalCode} onChange={handleInputChange} placeholder={t("address.postalCode")} className="h-12" />
                      </div>
                      <Textarea name="notes" value={formData.notes} onChange={handleInputChange} placeholder={t("address.notesPlaceholder")} className="min-h-[80px] resize-none" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right — summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5 text-primary" />
                        {t("orderSummary.title")}
                      </span>
                      <Badge variant="secondary">{totalItems}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {items.map((item) => (
                      <div key={`${item.product.id}:${item.variant.id}`} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{locale === "ru" ? item.product.nameRu : item.product.nameRo}</p>
                          <p className="text-sm text-muted-foreground">
                            {t("size")}: {item.variant.size} · {item.product.price + item.variant.priceModifier} {currency} × {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-semibold tabular-nums">
                          {(item.product.price + item.variant.priceModifier) * item.quantity} {currency}
                        </p>
                      </div>
                    ))}

                    {promo && (
                      <div className={`flex items-start gap-2 rounded-lg p-3 text-sm ${promoQualified ? "bg-primary/10 text-primary" : "bg-muted/60 text-muted-foreground"}`}>
                        <Gift className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>
                          {promoQualified
                            ? tShop("promo.qualified")
                            : tShop("promo.addMore", { amount: promoRemaining })}
                        </span>
                      </div>
                    )}

                    <Separator />

                    {/* Promo */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        {t("orderSummary.promoCode")}
                      </Label>
                      {promoApplied ? (
                        <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="font-mono font-medium text-green-700 dark:text-green-400">{promoApplied.code}</span>
                          </div>
                          <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => setPromoApplied(null)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <InputGroup className="flex-1 h-10">
                            <InputGroupInput
                              value={promoCode}
                              onChange={(e) => {
                                setPromoCode(e.target.value.toUpperCase());
                                setPromoError("");
                              }}
                              placeholder={t("orderSummary.promoPlaceholder")}
                              className="h-10 font-mono uppercase"
                            />
                          </InputGroup>
                          <Button type="button" variant="outline" onClick={applyPromoCode} disabled={promoLoading || !promoCode.trim()} className="h-10">
                            {promoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("orderSummary.apply")}
                          </Button>
                        </div>
                      )}
                      {promoError && <p className="text-xs text-destructive">{promoError}</p>}
                    </div>

                    <Separator />

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("orderSummary.subtotal")}</span>
                        <span>{totalPrice} {currency}</span>
                      </div>
                      {discountAmount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>{t("orderSummary.discount")}</span>
                          <span>-{discountAmount} {currency}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("orderSummary.shipping")}</span>
                        <span>{shippingAmount > 0 ? `${shippingAmount} ${currency}` : t("orderSummary.free")}</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">{t("orderSummary.total")}</span>
                      <span className="text-2xl font-bold text-primary">{finalPrice} {currency}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex-col gap-4">
                    {submitError && (
                      <div className="w-full p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                        <p className="text-sm text-destructive flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          {submitError}
                        </p>
                      </div>
                    )}
                    <Button type="submit" size="lg" className="w-full gap-2 text-base py-6" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          {t("processing")}
                        </>
                      ) : (
                        <>
                          <Lock className="h-5 w-5" />
                          {t("placeOrder")}
                        </>
                      )}
                    </Button>

                    <label htmlFor="terms" className="flex items-start gap-2.5 cursor-pointer w-full">
                      <Checkbox
                        id="terms"
                        checked={acceptTerms}
                        onCheckedChange={(checked) => {
                          setAcceptTerms(checked as boolean);
                          if (errors.terms) setErrors((prev) => ({ ...prev, terms: "" }));
                        }}
                        className={`mt-0.5 flex-shrink-0 ${errors.terms ? "border-destructive" : ""}`}
                      />
                      <span className="text-xs leading-relaxed">
                        {t("terms.accept")}{" "}
                        <Link href="/terms" className="text-primary hover:underline">{t("terms.termsLink")}</Link>{" "}
                        {t("terms.and")}{" "}
                        <Link href="/privacy" className="text-primary hover:underline">{t("terms.privacyLink")}</Link>
                        {errors.terms && <span className="block text-xs text-destructive mt-1">{errors.terms}</span>}
                      </span>
                    </label>

                    <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground pt-2">
                      <span className="flex items-center gap-1.5"><Shield className="h-4 w-4" />{t("security.secure")}</span>
                      <span className="flex items-center gap-1.5"><Lock className="h-4 w-4" />{t("security.encrypted")}</span>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
