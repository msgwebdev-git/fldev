"use client";

import * as React from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Ticket, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function HeroSection() {
  const t = useTranslations("Hero");

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/festival-video.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white">
        {/* Badge */}
        <Badge
          variant="outline"
          className="mb-6 border-white/30 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm"
        >
          {t("badge")}
        </Badge>

        {/* Main Title */}
        <h1 className="mb-4 text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
          FESTIVALUL LUPILOR
        </h1>

        {/* Year */}
        <div className="mb-6 text-3xl font-light tracking-widest sm:text-4xl md:text-5xl">
          2026
        </div>

        {/* Date */}
        <div className="mb-10 flex items-center gap-3 text-xl font-medium sm:text-2xl md:text-3xl">
          <span>7</span>
          <span className="text-primary">|</span>
          <span>8</span>
          <span className="text-primary">|</span>
          <span>9</span>
          <span className="ml-2">{t("august")}</span>
        </div>

        {/* CTA Buttons */}
        <div className="flex w-full max-w-md flex-col gap-4 sm:w-auto sm:max-w-none sm:flex-row">
          <Button size="lg" asChild className="h-14 w-full text-lg px-10 sm:h-12 sm:w-auto sm:text-base sm:px-8">
            <Link href="/tickets">
              <Ticket className="h-5 w-5" />
              {t("buyTickets")}
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-14 w-full border-white/30 bg-white/10 text-lg px-10 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white sm:h-12 sm:w-auto sm:text-base sm:px-8"
            asChild
          >
            <Link href="/lineup">{t("viewLineup")}</Link>
          </Button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <button
        onClick={scrollToContent}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-white/70 hover:text-white transition-colors"
        aria-label={t("scrollDown")}
      >
        <ChevronDown className="h-8 w-8" />
      </button>
    </section>
  );
}
