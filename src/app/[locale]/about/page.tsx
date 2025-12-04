"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  ArrowLeft,
  Mountain,
  Music,
  Users,
  Calendar,
  MapPin,
  Tent,
  Utensils,
  Palette,
  Baby,
  Sparkles,
  Heart,
} from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const stats = [
  { value: "5", labelKey: "stats.years" },
  { value: "150+", labelKey: "stats.artists" },
  { value: "5000+", labelKey: "stats.visitors" },
  { value: "2", labelKey: "stats.stages" },
];

const features = [
  { icon: Palette, labelKey: "features.crafts" },
  { icon: Music, labelKey: "features.workshops" },
  { icon: Sparkles, labelKey: "features.artInstallations" },
  { icon: Utensils, labelKey: "features.foodCourt" },
  { icon: Tent, labelKey: "features.camping" },
  { icon: Baby, labelKey: "features.familyZone" },
];

const headliners = [
  "Dubioza Kolektiv",
  "Zdob și Zdub",
  "Subcarpați",
  "Shantel",
  "La Caravane Passe",
  "Lupii lui Calancea",
  "Vali Boghean Band",
  "Gândul Mâței",
];

export default function AboutPage() {
  const t = useTranslations("About");

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
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            <Mountain className="h-3 w-3 mr-1" />
            {t("badge")}
          </Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {t("pageTitle")}
          </h1>
          <p className="text-muted-foreground max-w-3xl mx-auto text-lg leading-relaxed">
            {t("heroDescription")}
          </p>
        </div>

        {/* Main Image */}
        <div className="relative aspect-[21/9] rounded-2xl overflow-hidden mb-16">
          <Image
            src="/279cc82299d526a60d1d9f51a53ab1cd.jpg"
            alt="Festivalul Lupilor"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="flex items-center gap-2 text-white">
              <MapPin className="h-5 w-5" />
              <span className="text-lg font-medium">Orheiul Vechi, Moldova</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6 text-center gap-0">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                {stat.value}
              </div>
              <div className="text-muted-foreground">{t(stat.labelKey)}</div>
            </Card>
          ))}
        </div>

        {/* About Content */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary" />
              {t("historyTitle")}
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>{t("historyP1")}</p>
              <p>{t("historyP2")}</p>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Music className="h-6 w-6 text-primary" />
              {t("musicTitle")}
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>{t("musicP1")}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {headliners.map((artist) => (
                  <Badge key={artist} variant="secondary">
                    {artist}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Separator className="mb-16" />

        {/* Features */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">{t("featuresTitle")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="p-6 text-center gap-0 hover:border-primary/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-sm font-medium">{t(feature.labelKey)}</div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Location Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="relative aspect-square md:aspect-auto rounded-2xl overflow-hidden">
            <Image
              src="/orheiul-vechi2.jpg"
              alt="Orheiul Vechi"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <MapPin className="h-6 w-6 text-primary" />
              {t("locationTitle")}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t("locationDescription")}
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span>{t("dates")}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Orheiul Vechi, Trebujeni, Moldova</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span>{t("distance")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">{t("faqTitle")}</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>{t("faq.q1")}</AccordionTrigger>
              <AccordionContent>{t("faq.a1")}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>{t("faq.q2")}</AccordionTrigger>
              <AccordionContent>{t("faq.a2")}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>{t("faq.q3")}</AccordionTrigger>
              <AccordionContent>{t("faq.a3")}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>{t("faq.q4")}</AccordionTrigger>
              <AccordionContent>{t("faq.a4")}</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* CTA */}
        <div className="text-center mt-16 p-8 rounded-2xl bg-primary/5 border border-primary/20">
          <h2 className="text-2xl font-bold mb-4">{t("ctaTitle")}</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            {t("ctaDescription")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/tickets">{t("ctaBuyTickets")}</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/lineup">{t("ctaViewLineup")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
