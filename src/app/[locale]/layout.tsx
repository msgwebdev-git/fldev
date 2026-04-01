import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import { TicketCartBar } from "@/components/TicketCartBar";
import { MarketingScriptsHead, MarketingScriptsBody } from "@/components/MarketingScripts";
import { Toaster } from "sonner";
import "../globals.css";

const SITE_URL = "https://festivalul-lupilor.md";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const otherLocale = locale === "ro" ? "ru" : "ro";

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      template: t("titleTemplate"),
      default: t("defaultTitle"),
    },
    description: t("defaultDescription"),
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: {
        ro: `${SITE_URL}/ro`,
        ru: `${SITE_URL}/ru`,
      },
    },
    openGraph: {
      type: "website",
      siteName: t("siteName"),
      locale: locale === "ro" ? "ro_RO" : "ru_RU",
      alternateLocale: otherLocale === "ro" ? "ro_RO" : "ru_RU",
      title: t("defaultTitle"),
      description: t("defaultDescription"),
      url: `${SITE_URL}/${locale}`,
      images: [
        {
          url: `${SITE_URL}/og.png`,
          width: 1200,
          height: 630,
          alt: t("siteName"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("defaultTitle"),
      description: t("defaultDescription"),
      images: [`${SITE_URL}/og.png`],
    },
    icons: {
      icon: "/favicon.ico",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale}>
      <head>
        <MarketingScriptsHead />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MarketingScriptsBody />
        <NextIntlClientProvider>
          <CartProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
            <TicketCartBar />
            <Toaster position="top-center" richColors />
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
