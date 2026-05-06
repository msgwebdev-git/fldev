"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
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

interface PartnerCategoryRow {
  id: number;
  key: string;
  label_ro: string;
  label_ru: string;
  label_en: string | null;
  sort_order: number;
  badge_color: string;
}

interface RenderedCategory {
  key: string;
  label: string;
  partners: Partner[];
}

interface PartnersContentProps {
  partners: Partner[];
  categories: PartnerCategoryRow[];
}

const LOGO_SIZE = "h-24 md:h-32";
const CARD_WIDTH = "w-[calc(50%-0.5rem)] sm:w-56 md:w-64";

export function PartnersContent({ partners, categories }: PartnersContentProps) {
  const t = useTranslations("Partners");
  const locale = useLocale();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const labelFor = (c: PartnerCategoryRow) => {
    if (locale === "ru") return c.label_ru;
    if (locale === "en") return c.label_en ?? c.label_ro;
    return c.label_ro;
  };

  const partnersByCategory = partners.reduce((acc, partner) => {
    if (!acc[partner.category]) acc[partner.category] = [];
    acc[partner.category].push(partner);
    return acc;
  }, {} as Record<string, Partner[]>);

  const renderedCategories: RenderedCategory[] = categories
    .filter((c) => partnersByCategory[c.key]?.length > 0)
    .map((c) => ({
      key: c.key,
      label: labelFor(c),
      partners: partnersByCategory[c.key].sort((a, b) => a.sort_order - b.sort_order),
    }));

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
              <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
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
        {renderedCategories.length === 0 ? (
          <div className="text-center py-20">
            <Handshake className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">{t("noPartnersYet")}</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {t("noPartnersDescription")}
            </p>
          </div>
        ) : (
          <div className="space-y-16">
            {renderedCategories.map((category) => (
              <section key={category.key}>
                <div className="text-center mb-8">
                  <h2 className="font-bold text-2xl md:text-3xl">
                    {category.label}
                  </h2>
                  <Separator className="mt-4 max-w-xs mx-auto" />
                </div>

                <div className="flex flex-wrap justify-center gap-4">
                  {category.partners.map((partner) => (
                    <Card
                      key={partner.id}
                      className={`group transition-all hover:shadow-lg hover:border-primary/30 overflow-hidden ${CARD_WIDTH}`}
                    >
                      <CardContent className="p-6 flex items-center justify-center min-h-[140px]">
                        {partner.website ? (
                          <a
                            href={partner.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative block w-full"
                          >
                            <div className={`relative w-full ${LOGO_SIZE}`}>
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
                          <div className={`relative w-full ${LOGO_SIZE}`}>
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
            ))}
          </div>
        )}

        {renderedCategories.length > 0 && (
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
