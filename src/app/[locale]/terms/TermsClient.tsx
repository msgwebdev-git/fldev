"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  ArrowLeft,
  FileText,
  ShoppingCart,
  Ticket,
  RotateCcw,
  AlertTriangle,
  Receipt,
  Lock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const sections = [
  { key: "purchase", icon: ShoppingCart },
  { key: "tickets", icon: Ticket },
  { key: "refund", icon: RotateCcw },
  { key: "important", icon: AlertTriangle },
  { key: "adminFee", icon: Receipt },
  { key: "privacy", icon: Lock },
] as const;

export default function TermsPage() {
  const t = useTranslations("TermsPage");

  return (
    <main className="min-h-screen bg-background pt-24 pb-20">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <div className="mb-8">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("backToHome")}
            </Link>
          </Button>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <FileText className="h-3 w-3 mr-1" />
            {t("badge")}
          </Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {t("pageTitle")}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {t("pageSubtitle")}
          </p>
        </div>

        {/* Sections */}
        <div className="max-w-3xl mx-auto space-y-8">
          {sections.map((section) => {
            const Icon = section.icon;
            const rawItems = t.raw(`sections.${section.key}.items`) as Record<string, string>;
            const items = Object.values(rawItems);

            return (
              <Card key={section.key} className="p-6 md:p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold">
                      {t(`sections.${section.key}.title`)}
                    </h2>
                  </div>
                </div>
                <Separator className="mb-4" />
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <p
                      key={index}
                      className={`text-muted-foreground leading-relaxed ${
                        item.startsWith("•") || item.startsWith("–") ? "pl-4" : ""
                      }`}
                    >
                      {item}
                    </p>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-12 p-8 rounded-2xl border max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">{t("ctaTitle")}</h2>
          <p className="text-muted-foreground mb-6">{t("ctaDescription")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/tickets">{t("ctaBuyTickets")}</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contacts">{t("ctaContacts")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
