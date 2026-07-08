"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { XCircle, Home, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function BusFailedPage() {
  const t = useTranslations("BusFailed");
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");

  return (
    <main className="min-h-screen bg-muted/30 pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-xl">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-9 w-9 text-destructive" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{t("title")}</h1>
            <p className="text-muted-foreground">{t("subtitle")}</p>
            {orderNumber && <Badge variant="secondary" className="mt-3 font-mono text-sm">#{orderNumber}</Badge>}
          </div>

          <Card>
            <CardContent className="p-6">
              <p className="text-center text-sm text-muted-foreground">{t("hint")}</p>
            </CardContent>
          </Card>

          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
            <Button asChild>
              <Link href="/bus"><RefreshCw className="mr-2 h-4 w-4" />{t("tryAgain")}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/"><Home className="mr-2 h-4 w-4" />{t("backToHome")}</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
