"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { ArrowLeft, Handshake, Mail, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Types for partners data
interface Partner {
  id: number;
  name: string;
  logo_url: string | null;
  website: string | null;
  category: string;
  year: string;
  sort_order: number;
}

interface PartnerCategory {
  key: string;
  partners: Partner[];
}

interface PartnersContentProps {
  partners: Partner[];
}

// Порядок категорий
const categoryOrder = ["patronage", "generalPartner", "partners", "generalMediaPartner", "mediaPartners"];

export function PartnersContent({ partners }: PartnersContentProps) {
  const t = useTranslations("Partners");

  // Группируем партнёров по категориям
  const partnersByCategory = partners.reduce((acc, partner) => {
    if (!acc[partner.category]) {
      acc[partner.category] = [];
    }
    acc[partner.category].push(partner);
    return acc;
  }, {} as Record<string, Partner[]>);

  // Создаём массив категорий в правильном порядке
  const categories: PartnerCategory[] = categoryOrder
    .filter((key) => partnersByCategory[key]?.length > 0)
    .map((key) => ({
      key,
      partners: partnersByCategory[key].sort((a, b) => a.sort_order - b.sort_order),
    }));

  const getGridCols = (count: number, isMain: boolean) => {
    if (isMain) {
      if (count === 1) return "grid-cols-1 max-w-md mx-auto";
      if (count === 2) return "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto";
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto";
    }
    return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6";
  };

  const getLogoSize = (key: string) => {
    if (key === "patronage" || key === "generalPartner" || key === "generalMediaPartner") {
      return "h-24 md:h-32";
    }
    return "h-16 md:h-20";
  };

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

        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            <Handshake className="h-3 w-3 mr-1" />
            {t("badge")}
          </Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {t("title")}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {t("subtitle")}
          </p>
        </div>

        {/* Partner Categories */}
        <div className="space-y-16">
          {categories.map((category) => {
            const isMainCategory = ["patronage", "generalPartner", "generalMediaPartner"].includes(category.key);

            return (
              <section key={category.key}>
                {/* Category Title */}
                <div className="text-center mb-8">
                  <h2 className={`font-bold ${isMainCategory ? "text-2xl md:text-3xl" : "text-xl md:text-2xl"}`}>
                    {t(`categories.${category.key}`)}
                  </h2>
                  <Separator className="mt-4 max-w-xs mx-auto" />
                </div>

                {/* Partners Grid */}
                <div className={`grid gap-6 ${getGridCols(category.partners.length, isMainCategory)}`}>
                  {category.partners.map((partner) => (
                    <Card
                      key={partner.id}
                      className="group transition-all hover:shadow-lg hover:border-primary/30 overflow-hidden"
                    >
                      <CardContent className="p-6 flex items-center justify-center">
                        {partner.website ? (
                          <a
                            href={partner.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative block w-full"
                          >
                            <div className={`relative w-full ${getLogoSize(category.key)}`}>
                              {partner.logo_url ? (
                                <Image
                                  src={partner.logo_url}
                                  alt={partner.name}
                                  fill
                                  className="object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-muted rounded">
                                  <span className="text-muted-foreground text-sm">{partner.name}</span>
                                </div>
                              )}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/80">
                              <span className="text-sm font-medium flex items-center gap-1">
                                {partner.name}
                                <ExternalLink className="h-3 w-3" />
                              </span>
                            </div>
                          </a>
                        ) : (
                          <div className={`relative w-full ${getLogoSize(category.key)}`}>
                            {partner.logo_url ? (
                              <Image
                                src={partner.logo_url}
                                alt={partner.name}
                                fill
                                className="object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-muted rounded">
                                <span className="text-muted-foreground text-sm">{partner.name}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* Become a Partner CTA */}
        <div className="mt-20 text-center">
          <Card className="max-w-2xl mx-auto bg-primary/5 border-primary/20">
            <CardContent className="p-8 md:p-12">
              <Handshake className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                {t("cta.title")}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {t("cta.description")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <a href="mailto:partners@festivalullupilor.md">
                    <Mail className="mr-2 h-5 w-5" />
                    {t("cta.button")}
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="tel:+37360123456">
                    {t("cta.callUs")}
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Thank you message */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground italic">
            {t("thankYou")}
          </p>
        </div>
      </div>
    </main>
  );
}
