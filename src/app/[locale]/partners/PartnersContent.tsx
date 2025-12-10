"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { ArrowLeft, Handshake, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PartnerApplicationForm } from "./PartnerApplicationForm";

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
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

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
      if (count === 1) return "grid-cols-1 max-w-xs mx-auto";
      if (count === 2) return "grid-cols-2 max-w-lg mx-auto";
      return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 max-w-3xl mx-auto";
    }
    return "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6";
  };

  const getLogoSize = (key: string) => {
    if (key === "patronage" || key === "generalPartner" || key === "generalMediaPartner") {
      return "h-24 md:h-32";
    }
    return "h-20 md:h-24";
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

        {/* Hero Content */}
        <div className="text-center mb-16 space-y-6">
          <Badge variant="outline" className="mb-4">
            <Handshake className="h-3 w-3 mr-1" />
            {t("badge")}
          </Badge>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            {t("hero.title")}
          </h1>

          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {t("hero.subtitle")}
          </p>

          {/* CTA Button */}
          <div className="flex justify-center pt-4">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg">
                  {t("hero.ctaButton")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl">{t("form.title")}</DialogTitle>
                  <DialogDescription>{t("form.description")}</DialogDescription>
                </DialogHeader>
                <PartnerApplicationForm onSuccess={() => setIsDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Partners Section */}
        {categories.length === 0 ? (
          <div className="text-center py-20">
            <Handshake className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">{t("noPartnersYet")}</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {t("noPartnersDescription")}
            </p>
          </div>
        ) : (
          /* Partner Categories */
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
                <div className={`grid gap-4 ${getGridCols(category.partners.length, isMainCategory)}`}>
                  {category.partners.map((partner) => (
                    <Card
                      key={partner.id}
                      className="group transition-all hover:shadow-lg hover:border-primary/30 overflow-hidden"
                    >
                      <CardContent className="p-6 flex items-center justify-center min-h-[140px]">
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
        )}

        {/* Thank you message */}
        {categories.length > 0 && (
          <div className="mt-12 text-center">
            <p className="text-muted-foreground italic">
              {t("thankYou")}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
