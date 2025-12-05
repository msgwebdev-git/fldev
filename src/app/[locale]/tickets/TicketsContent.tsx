"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, Ticket, Shield, CreditCard, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { TicketCard, TicketData } from "@/components/TicketCard";

const paymentFeatures = [
  { icon: Shield, labelKey: "payment.secure" },
  { icon: CreditCard, labelKey: "payment.cards" },
  { icon: Mail, labelKey: "payment.email" },
];

interface TicketsContentProps {
  tickets: TicketData[];
}

export function TicketsContent({ tickets }: TicketsContentProps) {
  const t = useTranslations("TicketsPage");
  const tCommon = useTranslations("Tickets");

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
            <Ticket className="h-3 w-3 mr-1" />
            {t("badge")}
          </Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {t("pageTitle")}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {t("pageSubtitle")}
          </p>
        </div>

        {/* Tickets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>

        {/* Payment Info */}
        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <h2 className="text-xl font-bold mb-6 text-center">{t("paymentTitle")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {paymentFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {t(feature.labelKey)}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground mb-4">
            {tCommon("securePayment")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" asChild>
              <Link href="/faq">{t("viewFaq")}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/contacts">{t("contactUs")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
