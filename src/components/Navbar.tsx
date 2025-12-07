"use client";

import * as React from "react";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { Menu, ChevronDown, Ticket, Globe } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

const localeLabels: Record<string, string> = {
  ro: "RO",
  ru: "RU",
};

export function Navbar() {
  const t = useTranslations("Navbar");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);

  const navItems = [
    { href: "/lineup", label: t("lineup") },
    { href: "/about", label: t("about") },
    { href: "/program", label: t("program") },
    { href: "/partners", label: t("partners") },
    { href: "/contacts", label: t("contacts") },
  ];

  const moreItems = [
    { href: "/how-to-get", label: t("howToGet") },
    { href: "/perform", label: t("perform") },
    { href: "/activities", label: t("activities") },
    { href: "/b2b", label: t("b2b") },
    { href: "#news", label: t("news") },
    { href: "/rules", label: t("rules") },
    { href: "/faq", label: t("faq") },
  ];

  const otherLocale = locale === "ro" ? "ru" : "ro";

  const switchLocale = () => {
    const segments = pathname.split("/");
    segments[1] = otherLocale;
    router.push(segments.join("/"));
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-1 md:px-6 lg:px-8">
      <header className="mx-auto max-w-7xl rounded-2xl border bg-background/80 backdrop-blur-lg shadow-lg shadow-black/5 dark:shadow-black/20">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Logo"
            width={120}
            height={40}
            className="h-10 w-auto"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden lg:flex">
          <NavigationMenuList>
            {navItems.map((item) => (
              <NavigationMenuItem key={item.href}>
                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                  <Link href={item.href}>{item.label}</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
            {/* More Dropdown */}
            <NavigationMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={cn(navigationMenuTriggerStyle(), "gap-1")}>
                    {t("more")}
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {moreItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href}>{item.label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Desktop Right Section */}
        <div className="hidden lg:flex items-center gap-4">
          {/* Language Switcher */}
          <Button variant="ghost" size="sm" onClick={switchLocale} className="gap-1">
            <Globe className="h-4 w-4" />
            {localeLabels[otherLocale]}
          </Button>

          {/* Buy Tickets Button */}
          <Button asChild>
            <Link href="/tickets">
              <Ticket className="h-4 w-4" />
              {t("buyTickets")}
            </Link>
          </Button>
        </div>

        {/* Mobile Menu */}
        <div className="flex lg:hidden items-center gap-2">
          {/* Mobile Language Switcher */}
          <Button variant="ghost" size="sm" onClick={switchLocale}>
            {localeLabels[otherLocale]}
          </Button>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">{t("toggleMenu")}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] overflow-y-auto">
              <SheetTitle className="sr-only">{t("menu")}</SheetTitle>
              <nav className="flex flex-col gap-2 mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="text-lg font-medium transition-colors hover:text-primary py-2 border-b border-border"
                  >
                    {item.label}
                  </Link>
                ))}

                {/* More section */}
                <div className="mt-4 pt-2">
                  <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("more")}
                  </span>
                </div>
                {moreItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="text-base font-medium transition-colors hover:text-primary py-2 border-b border-border"
                  >
                    {item.label}
                  </Link>
                ))}

                <Button asChild className="mt-4 w-full">
                  <Link href="/tickets" onClick={() => setIsOpen(false)}>
                    <Ticket className="h-4 w-4" />
                    {t("buyTickets")}
                  </Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
        </div>
      </header>
    </div>
  );
}
