"use client";

import * as React from "react";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Ticket, Globe } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { Button } from "@/components/ui/button";
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

// Animated hamburger → X
function MenuToggle({
  isOpen,
  toggle,
  label,
}: {
  isOpen: boolean;
  toggle: () => void;
  label: string;
}) {
  return (
    <button
      onClick={toggle}
      className="relative z-[60] h-10 w-10 flex items-center justify-center"
      aria-label={label}
      aria-expanded={isOpen}
    >
      <div className="w-[18px] h-3.5 relative">
        <motion.span
          animate={
            isOpen
              ? { rotate: 45, y: 0, top: "50%", translateY: "-50%" }
              : { rotate: 0, y: 0, top: 0, translateY: "0%" }
          }
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="absolute left-0 right-0 h-[1.5px] bg-foreground rounded-full"
        />
        <motion.span
          animate={isOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.2 }}
          className="absolute left-0 w-3 top-1/2 -translate-y-1/2 h-[1.5px] bg-foreground rounded-full"
        />
        <motion.span
          animate={
            isOpen
              ? { rotate: -45, y: 0, bottom: "50%", translateY: "50%" }
              : { rotate: 0, y: 0, bottom: 0, translateY: "0%" }
          }
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="absolute left-0 right-0 h-[1.5px] bg-foreground rounded-full"
        />
      </div>
    </button>
  );
}

export function Navbar() {
  const t = useTranslations("Navbar");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);

  const primaryItems = [
    { href: "/lineup", label: t("lineup") },
    { href: "/about", label: t("about") },
    { href: "/program", label: t("program") },
    { href: "/tickets", label: t("buyTickets") },
  ];

  const secondaryItems = [
    { href: "/partners", label: t("partners") },
    { href: "/contacts", label: t("contacts") },
    { href: "/how-to-get", label: t("howToGet") },
    { href: "/activities", label: t("activities") },
    { href: "/b2b", label: t("b2b") },
    { href: "#news", label: t("news") },
    { href: "/rules", label: t("rules") },
    { href: "/faq", label: t("faq") },
  ];

  // Desktop nav uses the old grouping
  const navItems = [
    { href: "/lineup", label: t("lineup") },
    { href: "/about", label: t("about") },
    { href: "/program", label: t("program") },
    { href: "/partners", label: t("partners") },
    { href: "/contacts", label: t("contacts") },
  ];

  const moreItems = [
    { href: "/how-to-get", label: t("howToGet") },
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

  // Lock body scroll
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on route change
  React.useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-1 md:px-6 lg:px-8">
        <header className="mx-auto max-w-7xl rounded-2xl border bg-background/80 backdrop-blur-lg shadow-lg shadow-black/5 dark:shadow-black/20">
          <div className="flex h-16 items-center justify-between px-4 md:px-6">
            {/* Logo */}
            <Link href="/" className="relative z-[60] flex items-center gap-2">
              <Image
                src="/logo-fl.png"
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
                    <NavigationMenuLink
                      asChild
                      className={navigationMenuTriggerStyle()}
                    >
                      <Link href={item.href}>{item.label}</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
                <NavigationMenuItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={cn(navigationMenuTriggerStyle(), "gap-1")}
                      >
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
              <Button
                variant="ghost"
                size="sm"
                onClick={switchLocale}
                className="gap-1"
              >
                <Globe className="h-4 w-4" />
                {localeLabels[otherLocale]}
              </Button>
              <Button asChild>
                <Link href="/tickets">
                  <Ticket className="h-4 w-4" />
                  {t("buyTickets")}
                </Link>
              </Button>
            </div>

            {/* Mobile controls */}
            <div className="flex lg:hidden items-center gap-0.5">
              <button
                onClick={() => {
                  setIsOpen(false);
                  switchLocale();
                }}
                className="relative z-[60] h-10 px-2.5 flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {localeLabels[otherLocale]}
              </button>
              <MenuToggle
                isOpen={isOpen}
                toggle={() => setIsOpen(!isOpen)}
                label={t("toggleMenu")}
              />
            </div>
          </div>
        </header>
      </div>

      {/* Full-screen mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-background lg:hidden"
          >
            <div className="h-full flex flex-col pt-20 overflow-y-auto">
              {/* Primary nav — large type */}
              <div className="px-6 py-4">
                {primaryItems.map((item, i) => {
                  const isActive = pathname.endsWith(item.href);
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.04 * i,
                        duration: 0.3,
                        ease: [0.25, 0.46, 0.45, 0.94],
                      }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "block text-[28px] font-semibold leading-tight py-3 transition-colors",
                          isActive
                            ? "text-primary"
                            : "text-foreground active:text-primary"
                        )}
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Divider */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.15, duration: 0.4, ease: "easeOut" }}
                className="h-px bg-border mx-6 origin-left"
              />

              {/* Secondary nav — compact grid */}
              <div className="px-6 py-4">
                <div className="flex flex-col">
                  {secondaryItems.map((item, i) => {
                    const isActive =
                      pathname.endsWith(item.href) ||
                      (item.href === "#news" && pathname.includes("news"));
                    return (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{
                          delay: 0.18 + 0.025 * i,
                          duration: 0.25,
                        }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "block text-[15px] py-2 transition-colors",
                            isActive
                              ? "text-primary font-medium"
                              : "text-muted-foreground active:text-foreground"
                          )}
                        >
                          {item.label}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
