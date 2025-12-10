import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import { TicketCartBar } from "@/components/TicketCartBar";
import { MarketingScriptsHead, MarketingScriptsBody } from "@/components/MarketingScripts";
import { Toaster } from "sonner";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FL Site",
  description: "FL Site",
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

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
