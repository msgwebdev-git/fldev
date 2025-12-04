"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  MapPin,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Youtube,
  Send,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// Иконка TikTok (нет в lucide)
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

// Иконка Telegram
function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

const socialLinks = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/festivalullupilor/",
    icon: Instagram,
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/festivalullupilor/",
    icon: Facebook,
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@festivalullupilor",
    icon: TikTokIcon,
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@festivalullupilor",
    icon: Youtube,
  },
  {
    name: "Telegram",
    href: "https://t.me/festivalullupilor",
    icon: TelegramIcon,
  },
];

export function Footer() {
  const t = useTranslations("Footer");
  const currentYear = new Date().getFullYear();

  const navigationLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/lineup", label: t("nav.lineup") },
    { href: "/program", label: t("nav.program") },
    { href: "/gallery", label: t("nav.gallery") },
    { href: "/news", label: t("nav.news") },
  ];

  const infoLinks = [
    { href: "/about", label: t("info.about") },
    { href: "/rules", label: t("info.rules") },
    { href: "/faq", label: t("info.faq") },
    { href: "/how-to-get", label: t("info.howToGet") },
    { href: "/contacts", label: t("info.contacts") },
  ];

  const partnerLinks = [
    { href: "/partners", label: t("partners.ourPartners") },
    { href: "/become-partner", label: t("partners.becomePartner") },
    { href: "/perform", label: t("partners.perform") },
  ];

  return (
    <footer className="bg-zinc-950 text-zinc-300">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand & Description */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <h3 className="text-2xl font-bold text-white">
                FESTIVALUL LUPILOR
              </h3>
            </Link>
            <p className="text-zinc-400 mb-6 max-w-sm leading-relaxed">
              {t("description")}
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-primary hover:text-white flex items-center justify-center transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t("navTitle")}</h4>
            <ul className="space-y-3">
              {navigationLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t("infoTitle")}</h4>
            <ul className="space-y-3">
              {infoLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t("contactTitle")}</h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="https://maps.google.com/?q=Saharna,Moldova"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-zinc-400 hover:text-white transition-colors"
                >
                  <MapPin className="h-5 w-5 mt-0.5 shrink-0" />
                  <span>Saharna, Rezina, Moldova</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+37360000000"
                  className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors"
                >
                  <Phone className="h-5 w-5 shrink-0" />
                  <span>+373 60 000 000</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@festivalullupilor.md"
                  className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors"
                >
                  <Mail className="h-5 w-5 shrink-0" />
                  <span>info@festivalullupilor.md</span>
                </a>
              </li>
            </ul>

            {/* CTA Button */}
            <Button className="mt-6 w-full" size="lg" asChild>
              <Link href="/tickets">
                {t("buyTickets")}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <Separator className="bg-zinc-800" />

      {/* Bottom Bar */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-zinc-500 text-sm text-center md:text-left">
            © {currentYear} Festivalul Lupilor. {t("rights")}
          </p>

          <div className="flex items-center gap-6 text-sm">
            <Link
              href="/privacy"
              className="text-zinc-500 hover:text-white transition-colors"
            >
              {t("privacy")}
            </Link>
            <Link
              href="/terms"
              className="text-zinc-500 hover:text-white transition-colors"
            >
              {t("terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
