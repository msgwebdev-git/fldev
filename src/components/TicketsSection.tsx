"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { TicketCard, TicketData } from "@/components/TicketCard";

interface TicketsSectionProps {
  tickets: TicketData[];
}

export function TicketsSection({ tickets }: TicketsSectionProps) {
  const t = useTranslations("Tickets");

  return (
    <section id="tickets" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("title")}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        {/* Tickets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            {t("securePayment")}
          </p>
        </div>
      </div>
    </section>
  );
}
