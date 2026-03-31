"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import {
  MapPin,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Youtube,
  ChevronDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Иконка TikTok (нет в lucide)
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}


const socialLinks = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/festivalul.lupilor/",
    icon: Instagram,
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/festivalullupilor/",
    icon: Facebook,
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@festivalul_lupilor",
    icon: TikTokIcon,
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@festivalullupilor",
    icon: Youtube,
  },
];

// Collapsible section for mobile
function FooterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="md:hidden border-b border-zinc-800">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-4 text-left"
      >
        <h4 className="text-white font-semibold text-sm">{title}</h4>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-zinc-500 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-200 ease-out",
          open ? "grid-rows-[1fr] pb-4" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  );
}

export function Footer() {
  const t = useTranslations("Footer");
  const currentYear = new Date().getFullYear();

  const navigationLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/lineup", label: t("nav.lineup") },
    { href: "/program", label: t("nav.program") },
    { href: "/gallery", label: t("nav.gallery") },
  ];

  const infoLinks = [
    { href: "/about", label: t("info.about") },
    { href: "/rules", label: t("info.rules") },
    { href: "/faq", label: t("info.faq") },
    { href: "/how-to-get", label: t("info.howToGet") },
    { href: "/contacts", label: t("info.contacts") },
  ];

  const linkList = (links: { href: string; label: string }[]) => (
    <ul className="space-y-3">
      {links.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className="text-zinc-400 hover:text-white transition-colors text-sm"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );

  const contactContent = (
    <ul className="space-y-4">
      <li>
        <a
          href="https://maps.google.com/?q=str.+Petricani+17,+Chisinau,+Moldova"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-3 text-zinc-400 hover:text-white transition-colors text-sm"
        >
          <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
          <span>
            GOQODE AGENCY S.R.L.
            <br />
            str. Petricani 17
          </span>
        </a>
      </li>
      <li>
        <a
          href="tel:+37379660101"
          className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors text-sm"
        >
          <Phone className="h-4 w-4 shrink-0" />
          <span>+373 796 60 101</span>
        </a>
      </li>
      <li>
        <a
          href="mailto:sales@festivalul-lupilor.md"
          className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors text-sm"
        >
          <Mail className="h-4 w-4 shrink-0" />
          <span>sales@festivalul-lupilor.md</span>
        </a>
      </li>
    </ul>
  );

  return (
    <footer className="bg-zinc-950 text-zinc-300">
      <div className="container mx-auto px-4 py-12 md:py-16">
        {/* Brand & Social — always visible */}
        <div className="mb-8 md:mb-0 md:grid md:grid-cols-2 lg:grid-cols-5 md:gap-10">
          <div className="lg:col-span-2 mb-8 md:mb-0">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/logo-fl.png"
                alt="Festivalul Lupilor"
                width={140}
                height={48}
                className="h-12 w-auto"
              />
            </Link>
            <p className="text-zinc-400 mb-6 max-w-sm leading-relaxed text-sm">
              {t("description")}
            </p>
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

          {/* Desktop: grid columns */}
          <div className="hidden md:block">
            <h4 className="text-white font-semibold mb-4">
              {t("navTitle")}
            </h4>
            {linkList(navigationLinks)}
          </div>

          <div className="hidden md:block">
            <h4 className="text-white font-semibold mb-4">
              {t("infoTitle")}
            </h4>
            {linkList(infoLinks)}
          </div>

          <div className="hidden md:block">
            <h4 className="text-white font-semibold mb-4">
              {t("contactTitle")}
            </h4>
            {contactContent}
            <Button className="mt-6 w-full" size="lg" asChild>
              <Link href="/tickets">{t("buyTickets")}</Link>
            </Button>
          </div>

          {/* Mobile: collapsible sections */}
          <div className="md:hidden col-span-full">
            <FooterSection title={t("navTitle")}>
              {linkList(navigationLinks)}
            </FooterSection>
            <FooterSection title={t("infoTitle")}>
              {linkList(infoLinks)}
            </FooterSection>
            <FooterSection title={t("contactTitle")}>
              {contactContent}
            </FooterSection>
          </div>
        </div>
      </div>

      <Separator className="bg-zinc-800" />

      {/* Bottom Bar */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center gap-3 text-sm text-zinc-500 md:flex-row md:justify-between md:gap-4">
          <p className="text-center md:text-left">
            © {currentYear} Festivalul Lupilor. {t("rights")}
          </p>
          <div className="flex items-center gap-4">
            <Image
              src="/visa-maib.webp"
              alt="Visa / maib"
              width={120}
              height={32}
              className="h-8 w-auto opacity-60"
            />
          </div>
          <div className="flex flex-col items-center gap-1.5 md:flex-row md:gap-4">
            <Link
              href="/privacy"
              className="hover:text-white transition-colors"
            >
              {t("privacy")}
            </Link>
            <Link
              href="/terms"
              className="hover:text-white transition-colors"
            >
              {t("terms")}
            </Link>
          </div>
          <a
            href="https://goqode.agency"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-zinc-500 text-sm">{t("developedBy")}</span>
            <Image
              src="/goqode.svg"
              alt="goQode"
              width={80}
              height={20}
              className="h-5 w-auto opacity-60"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
