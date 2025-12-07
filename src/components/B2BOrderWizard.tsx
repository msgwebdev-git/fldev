"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Check,
  ChevronRight,
  ShoppingCart,
  Building2,
  ArrowLeft,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { B2BPackageCalculator } from "@/components/B2BPackageCalculator";
import { B2BOrderForm, type B2BOrderFormData } from "@/components/B2BOrderForm";

interface TicketSelection {
  ticketId: string;
  optionId?: string;
  quantity: number;
  unitPrice: number;
}

interface B2BOrderWizardProps {
  tickets: any[];
  locale: "ro" | "ru";
  onSubmit: (data: B2BOrderFormData, selections: TicketSelection[]) => void;
  isSubmitting: boolean;
}

const MIN_QUANTITY = 50;

const DISCOUNT_TIERS = [
  { minQuantity: 50, maxQuantity: 99, discountPercent: 10, label: "50-99" },
  { minQuantity: 100, maxQuantity: 149, discountPercent: 12, label: "100-149" },
  { minQuantity: 150, maxQuantity: 199, discountPercent: 15, label: "150-199" },
  { minQuantity: 200, maxQuantity: null, discountPercent: 20, label: "200+" },
];

type Step = "tickets" | "info";

export function B2BOrderWizard({ tickets, locale, onSubmit, isSubmitting }: B2BOrderWizardProps) {
  const t = useTranslations("B2B");
  const tCalc = useTranslations("B2BCalculator");
  const [currentStep, setCurrentStep] = React.useState<Step>("tickets");
  const [selections, setSelections] = React.useState<TicketSelection[]>([]);

  // Calculate totals
  const totalQuantity = selections.reduce((sum, s) => sum + s.quantity, 0);
  const isValidQuantity = totalQuantity >= MIN_QUANTITY;

  const currentTier = DISCOUNT_TIERS.find(
    (tier) =>
      totalQuantity >= tier.minQuantity &&
      (tier.maxQuantity === null || totalQuantity <= tier.maxQuantity)
  );

  const discountPercent = currentTier?.discountPercent || 0;

  const subtotal = selections.reduce((sum, s) => sum + s.unitPrice * s.quantity, 0);
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const finalAmount = subtotal - discountAmount;

  const nextTier = DISCOUNT_TIERS.find((tier) => tier.minQuantity > totalQuantity);
  const ticketsToNextTier = nextTier ? nextTier.minQuantity - totalQuantity : 0;

  const handleSelectionChange = React.useCallback((newSelections: TicketSelection[]) => {
    setSelections(newSelections);
  }, []);

  const handleContinue = () => {
    if (isValidQuantity) {
      setCurrentStep("info");
    }
  };

  const handleBack = () => {
    setCurrentStep("tickets");
  };

  const handleFormSubmit = (data: B2BOrderFormData) => {
    onSubmit(data, selections);
  };

  const steps = [
    {
      id: "tickets" as const,
      title: t("stepTickets"),
      description: t("stepTicketsDesc"),
      icon: ShoppingCart,
    },
    {
      id: "info" as const,
      title: t("stepInfo"),
      description: t("stepInfoDesc"),
      icon: Building2,
    },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  // Summary Component
  const SummaryCard = ({ compact = false }: { compact?: boolean }) => (
    <Card className={compact ? "" : "sticky top-24"}>
      <CardHeader className={compact ? "pb-3" : ""}>
        <CardTitle className={compact ? "text-base" : ""}>{tCalc("summary")}</CardTitle>
        {!compact && isValidQuantity && (
          <CardDescription>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span>{tCalc("discountApplied", { percent: discountPercent })}</span>
            </div>
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Next Tier Upsell */}
        {!compact && isValidQuantity && nextTier && (
          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertDescription className="text-xs">
              {tCalc("nextTierMessage", {
                needed: ticketsToNextTier,
                discount: nextTier.discountPercent,
              })}
            </AlertDescription>
          </Alert>
        )}

        {/* Amounts */}
        <div className={compact ? "space-y-2" : "space-y-3"}>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{tCalc("totalTickets")}</span>
            <span className="font-medium">{totalQuantity}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{tCalc("subtotal")}</span>
            <span className="font-medium">{subtotal.toFixed(2)} MDL</span>
          </div>

          {discountPercent > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {tCalc("discount")} ({discountPercent}%)
              </span>
              <span className="font-medium text-green-600">
                -{discountAmount.toFixed(2)} MDL
              </span>
            </div>
          )}

          <Separator />

          <div className="flex justify-between items-center">
            <span className={compact ? "font-bold" : "text-lg font-bold"}>{tCalc("total")}</span>
            <span className={compact ? "text-xl font-bold text-primary" : "text-2xl font-bold text-primary"}>
              {finalAmount.toFixed(2)} MDL
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Stepper Header */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="relative">
          {/* Steps */}
          <div className="flex justify-between items-start">
            {steps.map((step, index) => {
              const isActive = step.id === currentStep;
              const isCompleted = index < currentStepIndex;
              const StepIcon = step.icon;

              return (
                <div key={step.id} className="relative flex flex-col items-center gap-3 flex-1 group">
                  {/* Step Number Label */}
                  <div className="text-center">
                    <p className={`text-xs font-medium uppercase tracking-wide ${
                      isActive ? "text-primary" : isCompleted ? "text-primary" : "text-muted-foreground"
                    }`}>
                      {t("step")} {index + 1}
                    </p>
                  </div>

                  {/* Step Indicator */}
                  <div className="relative z-10 bg-background px-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all shadow-sm ${
                        isCompleted
                          ? "bg-primary border-primary text-primary-foreground shadow-primary/20"
                          : isActive
                          ? "bg-primary border-primary text-primary-foreground shadow-primary/20 ring-4 ring-primary/10"
                          : "bg-muted border-border text-muted-foreground"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="h-6 w-6" />
                      ) : (
                        <StepIcon className="h-6 w-6" />
                      )}
                    </div>
                  </div>

                  {/* Step Info */}
                  <div className="text-center space-y-1">
                    <p className={`text-sm font-semibold ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                      {step.title}
                    </p>
                    <p className={`text-xs hidden md:block ${isActive ? "text-muted-foreground" : "text-muted-foreground/70"}`}>
                      {step.description}
                    </p>
                  </div>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="absolute top-6 left-[calc(50%+32px)] right-[calc(-50%+32px)] h-0.5 -z-0">
                      <div className="h-full bg-border" />
                      <div
                        className={`h-full bg-primary transition-all duration-500 absolute top-0 left-0 ${
                          isCompleted ? "w-full" : "w-0"
                        }`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-7xl mx-auto">
        {currentStep === "tickets" ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Ticket Selection - Takes 2 columns */}
              <div className="lg:col-span-2 space-y-6 pb-32 lg:pb-0">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{t("stepTickets")}</h2>
                  <p className="text-muted-foreground">{t("stepTicketsDesc")}</p>
                </div>

                <B2BPackageCalculator
                  tickets={tickets}
                  locale={locale}
                  onSelectionChange={handleSelectionChange}
                />

                {/* Validation Alert */}
                {!isValidQuantity && totalQuantity > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {tCalc("minimumRequired", { min: MIN_QUANTITY, current: totalQuantity })}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Summary Sidebar - Desktop Only */}
              <div className="hidden lg:block lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                  <SummaryCard compact />

                  <div>
                    <Button
                      size="lg"
                      className="w-full"
                      onClick={handleContinue}
                      disabled={!isValidQuantity}
                    >
                      {t("continue")}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                    {!isValidQuantity && (
                      <p className="text-xs text-muted-foreground text-center mt-2">
                        {totalQuantity === 0 ? t("selectMinimum") : tCalc("minimumRequired", { min: MIN_QUANTITY, current: totalQuantity })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bar - Mobile Only */}
            <Drawer>
              <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-50">
                <div className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <DrawerTrigger asChild>
                      <button className="flex-1 flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent transition-colors">
                        <div className="text-left">
                          <p className="text-xs text-muted-foreground">{tCalc("total")}</p>
                          <div className="flex items-baseline gap-2">
                            <p className="text-xl font-bold text-primary">{finalAmount.toFixed(2)} MDL</p>
                            {discountPercent > 0 && (
                              <Badge variant="secondary" className="text-xs">-{discountPercent}%</Badge>
                            )}
                          </div>
                        </div>
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      </button>
                    </DrawerTrigger>
                    <Button
                      size="lg"
                      onClick={handleContinue}
                      disabled={!isValidQuantity}
                      className="shrink-0"
                    >
                      {t("continue")}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>{tCalc("summary")}</DrawerTitle>
                  <DrawerDescription>
                    {isValidQuantity && discountPercent > 0
                      ? tCalc("discountApplied", { percent: discountPercent })
                      : tCalc("selectTicketsDescription")}
                  </DrawerDescription>
                </DrawerHeader>

                <div className="px-4 pb-4">
                  {/* Next Tier Upsell */}
                  {isValidQuantity && nextTier && (
                    <Alert className="mb-4">
                      <TrendingUp className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        {tCalc("nextTierMessage", {
                          needed: ticketsToNextTier,
                          discount: nextTier.discountPercent,
                        })}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Summary Details */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b">
                      <span className="text-sm text-muted-foreground">{tCalc("totalTickets")}</span>
                      <span className="text-lg font-semibold">{totalQuantity}</span>
                    </div>

                    <div className="flex justify-between items-center py-3 border-b">
                      <span className="text-sm text-muted-foreground">{tCalc("subtotal")}</span>
                      <span className="text-lg font-medium">{subtotal.toFixed(2)} MDL</span>
                    </div>

                    {discountPercent > 0 && (
                      <div className="flex justify-between items-center py-3 border-b">
                        <span className="text-sm text-muted-foreground">
                          {tCalc("discount")} ({discountPercent}%)
                        </span>
                        <span className="text-lg font-medium text-green-600">
                          -{discountAmount.toFixed(2)} MDL
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center py-4 bg-primary/5 rounded-lg px-4">
                      <span className="text-lg font-bold">{tCalc("total")}</span>
                      <span className="text-2xl font-bold text-primary">
                        {finalAmount.toFixed(2)} MDL
                      </span>
                    </div>
                  </div>
                </div>

                <DrawerFooter>
                  <Button
                    size="lg"
                    onClick={handleContinue}
                    disabled={!isValidQuantity}
                    className="w-full"
                  >
                    {t("continue")}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                  <DrawerClose asChild>
                    <Button variant="outline" size="lg">
                      {t("close")}
                    </Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Form - Takes 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="mb-2"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t("back")}
                </Button>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold">{t("stepInfo")}</h2>
                  <p className="text-sm md:text-base text-muted-foreground">{t("stepInfoDesc")}</p>
                </div>
              </div>

              <B2BOrderForm onSubmit={handleFormSubmit} isLoading={isSubmitting} />
            </div>

            {/* Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <SummaryCard compact />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
