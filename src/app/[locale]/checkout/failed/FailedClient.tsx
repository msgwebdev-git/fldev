"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { XCircle, ArrowLeft, RefreshCw, HelpCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CheckoutFailedPage() {
  const t = useTranslations("Checkout");
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");
  const reason = searchParams.get("reason");

  return (
    <main className="min-h-screen bg-muted/30 pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-lg">
        <Card className="text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <XCircle className="h-10 w-10 text-destructive" />
            </div>
            <CardTitle className="text-2xl">{t("failed.title")}</CardTitle>
            <CardDescription className="text-base">
              {t("failed.subtitle")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {orderNumber && (
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">{t("failed.orderNumber")}</p>
                <p className="font-mono font-semibold text-lg">{orderNumber}</p>
              </div>
            )}
            {reason && (
              <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                <p className="text-sm text-destructive">
                  {t("failed.reason")}: {reason}
                </p>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              {t("failed.description")}
            </p>
          </CardContent>
          <CardFooter className="flex-col gap-3">
            <Button asChild className="w-full gap-2">
              <Link href="/tickets">
                <RefreshCw className="h-4 w-4" />
                {t("failed.tryAgain")}
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full gap-2">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                {t("failed.backHome")}
              </Link>
            </Button>
            <Button variant="ghost" asChild className="w-full gap-2">
              <Link href="/contacts">
                <HelpCircle className="h-4 w-4" />
                {t("failed.contactSupport")}
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
