"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Bus, ArrowRight } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function BusCtaSection() {
  const t = useTranslations("BusCta");

  return (
    <section className="container mx-auto px-4 py-12 sm:py-16">
      <div className="relative overflow-hidden rounded-[1.75rem] bg-neutral-900 px-6 py-12 text-white sm:px-12 sm:py-16">
        {/* Background photo + dark overlay for legibility */}
        <Image
          src="https://ybumbbtackrfdhijvfkz.supabase.co/storage/v1/object/public/gallery/bus-image.jpg"
          alt=""
          fill
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center" }}
          className="pointer-events-none select-none"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-neutral-950/85 via-neutral-950/65 to-neutral-950/40" />
        <div className="pointer-events-none absolute -bottom-24 left-1/2 h-64 w-[120%] -translate-x-1/2 rounded-[100%] bg-primary/20 blur-3xl" />

        <div className="relative max-w-2xl">
          <Badge variant="outline" className="mb-4 border-white/20 bg-white/5 text-white">
            <Bus className="mr-1 h-3.5 w-3.5" /> {t("badge")}
          </Badge>
          <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">{t("title")}</h2>
          <p className="mt-3 max-w-lg text-base text-white/70 sm:text-lg">{t("subtitle")}</p>
          <Button size="lg" className="mt-6" asChild>
            <Link href="/bus" className="inline-flex items-center gap-2">
              {t("cta")} <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
