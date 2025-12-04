"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Ticket,
  Shield,
  Lock,
  Loader2,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  User,
  Mail,
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PhoneInput } from "@/components/ui/phone-input";
import { useCart } from "@/context/CartContext";

// Form validation
function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function CheckoutPage() {
  const t = useTranslations("Checkout");
  const tCart = useTranslations("Cart");
  const router = useRouter();
  const { items, totalPrice, totalItems, removeItem, updateQuantity, clearCart, isHydrated } = useCart();

  // Form state
  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    comment: "",
    hearAbout: "",
  });
  const [acceptTerms, setAcceptTerms] = React.useState(false);
  const [acceptMarketing, setAcceptMarketing] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Promo code state
  const [promoCode, setPromoCode] = React.useState("");
  const [promoApplied, setPromoApplied] = React.useState<{ code: string; discount: number } | null>(null);
  const [promoError, setPromoError] = React.useState("");
  const [promoLoading, setPromoLoading] = React.useState(false);

  // Apply promo code
  const applyPromoCode = async () => {
    if (!promoCode.trim()) return;

    setPromoLoading(true);
    setPromoError("");

    // Simulate API call - replace with actual promo validation
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Demo promo codes
    const promoCodes: Record<string, number> = {
      "WOLF10": 10,
      "FESTIVAL20": 20,
      "VIP50": 50,
    };

    const discount = promoCodes[promoCode.toUpperCase()];
    if (discount) {
      setPromoApplied({ code: promoCode.toUpperCase(), discount });
      setPromoCode("");
    } else {
      setPromoError(t("orderSummary.promoError"));
    }

    setPromoLoading(false);
  };

  const removePromoCode = () => {
    setPromoApplied(null);
  };

  // Calculate discount
  const discountAmount = promoApplied ? Math.round(totalPrice * promoApplied.discount / 100) : 0;
  const finalPrice = totalPrice - discountAmount;

  // Redirect if cart is empty (only after hydration)
  React.useEffect(() => {
    if (isHydrated && items.length === 0) {
      router.push("/tickets");
    }
  }, [items.length, router, isHydrated]);

  // Handle form changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = t("errors.required");
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = t("errors.required");
    }
    if (!formData.email.trim()) {
      newErrors.email = t("errors.required");
    } else if (!validateEmail(formData.email)) {
      newErrors.email = t("errors.invalidEmail");
    }
    if (!formData.phone) {
      newErrors.phone = t("errors.required");
    } else if (!isValidPhoneNumber(formData.phone)) {
      newErrors.phone = t("errors.invalidPhone");
    }
    if (!acceptTerms) {
      newErrors.terms = t("errors.acceptTerms");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Here you would integrate with actual payment gateway
    // For now, we'll just simulate success
    clearCart();
    router.push("/checkout/success");
  };

  // Show loading while hydrating
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
            <Link href="/tickets">{t("backToTickets")}</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/30 pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/tickets">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("backToTickets")}
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Information */}
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
                      <InputGroup className={`h-12 ${errors.firstName ? "border-destructive ring-destructive/20" : ""}`}>
                        <InputGroupAddon>
                          <User className="h-4 w-4" />
                        </InputGroupAddon>
                        <InputGroupInput
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          placeholder={t("customerInfo.firstName")}
                          className="h-12 text-base"
                        />
                      </InputGroup>
                      {errors.firstName && (
                        <p className="text-sm text-destructive flex items-center gap-1 pl-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.firstName}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <InputGroup className={`h-12 ${errors.lastName ? "border-destructive ring-destructive/20" : ""}`}>
                        <InputGroupAddon>
                          <User className="h-4 w-4" />
                        </InputGroupAddon>
                        <InputGroupInput
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          placeholder={t("customerInfo.lastName")}
                          className="h-12 text-base"
                        />
                      </InputGroup>
                      {errors.lastName && (
                        <p className="text-sm text-destructive flex items-center gap-1 pl-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <InputGroup className={`h-12 ${errors.email ? "border-destructive ring-destructive/20" : validateEmail(formData.email) ? "border-green-500 ring-green-500/20" : ""}`}>
                        <InputGroupAddon>
                          <Mail className="h-4 w-4" />
                        </InputGroupAddon>
                        <InputGroupInput
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder={t("customerInfo.email")}
                          className="h-12 text-base"
                        />
                        {validateEmail(formData.email) && (
                          <InputGroupAddon align="inline-end">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          </InputGroupAddon>
                        )}
                      </InputGroup>
                      {errors.email && (
                        <p className="text-sm text-destructive flex items-center gap-1 pl-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.email}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <div className={`rounded-lg ${errors.phone ? "[&_button]:border-destructive [&_input]:border-destructive" : isValidPhoneNumber(formData.phone || "") ? "[&_button]:border-green-500 [&_input]:border-green-500" : ""}`}>
                        <PhoneInput
                          value={formData.phone}
                          onChange={(value) => {
                            setFormData((prev) => ({ ...prev, phone: value }));
                            if (errors.phone) {
                              setErrors((prev) => ({ ...prev, phone: "" }));
                            }
                          }}
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-sm text-destructive flex items-center gap-1 pl-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Information */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("additionalInfo.title")}</CardTitle>
                  <CardDescription>{t("additionalInfo.subtitle")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* How did you hear about us */}
                  <div className="space-y-2">
                    <Label htmlFor="hearAbout">{t("additionalInfo.hearAbout")}</Label>
                    <Select
                      value={formData.hearAbout}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, hearAbout: value }))}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder={t("additionalInfo.hearAboutPlaceholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="social">{t("additionalInfo.sources.social")}</SelectItem>
                        <SelectItem value="friends">{t("additionalInfo.sources.friends")}</SelectItem>
                        <SelectItem value="search">{t("additionalInfo.sources.search")}</SelectItem>
                        <SelectItem value="ads">{t("additionalInfo.sources.ads")}</SelectItem>
                        <SelectItem value="media">{t("additionalInfo.sources.media")}</SelectItem>
                        <SelectItem value="other">{t("additionalInfo.sources.other")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Comment */}
                  <div className="space-y-2">
                    <Label htmlFor="comment">{t("additionalInfo.comment")}</Label>
                    <Textarea
                      id="comment"
                      name="comment"
                      value={formData.comment}
                      onChange={(e) => setFormData((prev) => ({ ...prev, comment: e.target.value }))}
                      placeholder={t("additionalInfo.commentPlaceholder")}
                      className="min-h-[100px] resize-none"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Ticket className="h-5 w-5 text-primary" />
                        {t("orderSummary.title")}
                      </span>
                      <Badge variant="secondary">{totalItems}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <AnimatePresence mode="popLayout">
                      {items.map((item) => (
                        <motion.div
                          key={item.ticket.id}
                          layout
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{item.ticket.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.ticket.price} MDL × {item.quantity}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => updateQuantity(item.ticket.id, item.quantity - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-6 text-center text-sm font-medium">
                                {item.quantity}
                              </span>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => updateQuantity(item.ticket.id, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => removeItem(item.ticket.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    <Separator />

                    {/* Promo Code */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        {t("orderSummary.promoCode")}
                      </Label>
                      {promoApplied ? (
                        <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="font-mono font-medium text-green-700 dark:text-green-400">
                              {promoApplied.code}
                            </span>
                            <Badge variant="secondary" className="text-green-600">
                              -{promoApplied.discount}%
                            </Badge>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                            onClick={removePromoCode}
                          >
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
                          <Button
                            type="button"
                            variant="outline"
                            onClick={applyPromoCode}
                            disabled={promoLoading || !promoCode.trim()}
                            className="h-10"
                          >
                            {promoLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              t("orderSummary.apply")
                            )}
                          </Button>
                        </div>
                      )}
                      {promoError && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {promoError}
                        </p>
                      )}
                    </div>

                    <Separator />

                    {/* Subtotal */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t("orderSummary.subtotal")}</span>
                        <span>{totalPrice} MDL</span>
                      </div>
                      {promoApplied && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>{t("orderSummary.discount")} ({promoApplied.discount}%)</span>
                          <span>-{discountAmount} MDL</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t("orderSummary.serviceFee")}</span>
                        <span>0 MDL</span>
                      </div>
                    </div>

                    <Separator />

                    {/* Total */}
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">{t("orderSummary.total")}</span>
                      <span className="text-2xl font-bold text-primary">{finalPrice} MDL</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex-col gap-4">
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full gap-2 text-base py-6"
                      disabled={isSubmitting}
                    >
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

                    {/* Terms checkboxes */}
                    <div className="w-full space-y-2.5">
                      <label htmlFor="terms" className="flex items-start gap-2.5 cursor-pointer">
                        <Checkbox
                          id="terms"
                          checked={acceptTerms}
                          onCheckedChange={(checked) => {
                            setAcceptTerms(checked as boolean);
                            if (errors.terms) {
                              setErrors((prev) => ({ ...prev, terms: "" }));
                            }
                          }}
                          className={`mt-0.5 flex-shrink-0 ${errors.terms ? "border-destructive" : ""}`}
                        />
                        <span className="text-xs leading-relaxed">
                          {t("terms.accept")}{" "}
                          <Link href="/rules" className="text-primary hover:underline">
                            {t("terms.termsLink")}
                          </Link>{" "}
                          {t("terms.and")}{" "}
                          <Link href="/rules" className="text-primary hover:underline">
                            {t("terms.privacyLink")}
                          </Link>
                          {errors.terms && (
                            <span className="block text-xs text-destructive mt-1">
                              {errors.terms}
                            </span>
                          )}
                        </span>
                      </label>

                      <label htmlFor="marketing" className="flex items-start gap-2.5 cursor-pointer">
                        <Checkbox
                          id="marketing"
                          checked={acceptMarketing}
                          onCheckedChange={(checked) => setAcceptMarketing(checked as boolean)}
                          className="mt-0.5 flex-shrink-0"
                        />
                        <span className="text-xs leading-relaxed text-muted-foreground">
                          {t("terms.marketing")}
                        </span>
                      </label>
                    </div>

                    {/* Security badges */}
                    <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground pt-2">
                      <span className="flex items-center gap-1.5">
                        <Shield className="h-4 w-4" />
                        {t("security.secure")}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Lock className="h-4 w-4" />
                        {t("security.encrypted")}
                      </span>
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
