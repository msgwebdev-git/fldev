"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { TicketCard, TicketData } from "@/components/TicketCard";

// Mock data - will be replaced with Supabase
const mockTickets: TicketData[] = [
  {
    id: "1",
    name: "Early Bird",
    description: "Bilet cu preț redus pentru primii cumpărători",
    price: 450,
    originalPrice: 600,
    dates: "7-9 August 2026",
    location: "Moldova, Chișinău",
    features: [
      "Acces 3 zile la festival",
      "Acces la toate scenele",
      "Parcare gratuită",
    ],
  },
  {
    id: "2",
    name: "Standard 1 zi",
    description: "Bilet pentru o singură zi de festival",
    price: 250,
    dates: "Alege ziua la cumpărare",
    location: "Moldova, Chișinău",
    features: [
      "Acces 1 zi la festival",
      "Acces la toate scenele",
    ],
  },
  {
    id: "3",
    name: "Standard 3 zile",
    description: "Bilet standard pentru toate cele 3 zile",
    price: 600,
    dates: "7-9 August 2026",
    location: "Moldova, Chișinău",
    features: [
      "Acces 3 zile la festival",
      "Acces la toate scenele",
      "Parcare gratuită",
      "Tricou oficial cadou",
    ],
  },
  {
    id: "4",
    name: "VIP 1 zi",
    description: "Experiență VIP pentru o zi",
    price: 500,
    dates: "Alege ziua la cumpărare",
    location: "Moldova, Chișinău",
    features: [
      "Acces 1 zi la festival",
      "Zona VIP exclusivă",
      "Parcare VIP",
      "Open bar în zona VIP",
    ],
  },
  {
    id: "5",
    name: "VIP 3 zile",
    description: "Experiența premium completă la festival",
    price: 1200,
    originalPrice: 1500,
    dates: "7-9 August 2026",
    location: "Moldova, Chișinău",
    features: [
      "Acces 3 zile la festival",
      "Zona VIP exclusivă",
      "Parcare VIP",
      "Meet & Greet cu artiștii",
      "Open bar în zona VIP",
      "Tricou și merchandise exclusiv",
    ],
  },
  {
    id: "6",
    name: "Camping Pass",
    description: "Acces la zona de camping",
    price: 150,
    dates: "6-10 August 2026",
    location: "Zona camping - lângă festival",
    features: [
      "Loc de cort rezervat",
      "Acces la dușuri și toalete",
      "Acces Wi-Fi în zona camping",
      "Acces anticipat (6 August)",
    ],
  },
];

export function TicketsSection() {
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
          {mockTickets.map((ticket) => (
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
