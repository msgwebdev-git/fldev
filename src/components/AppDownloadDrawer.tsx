"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Smartphone, Download } from "lucide-react";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

const DISMISS_KEY = "fl_app_drawer_dismissed_at";
const DISMISS_FOREVER_KEY = "fl_app_drawer_dismissed_forever";
// Если временно закрыли — не показывать 7 дней
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000;
// Задержка показа после загрузки страницы (мс)
const SHOW_DELAY_MS = 2500;

// Не показывать на этих путях (без учёта префикса локали)
const EXCLUDED_PATHS = [
  "/app",
  "/admin",
  "/checkout",
  "/reset-password",
  "/delete-account",
];

function stripLocale(pathname: string): string {
  // /ro/foo -> /foo, /ru -> /, иначе как есть
  const m = pathname.match(/^\/(ro|ru)(\/.*)?$/);
  if (!m) return pathname;
  return m[2] ?? "/";
}

function isMobileUserAgent(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipod/.test(ua)) return true;
  if (/android/.test(ua) && /mobile/.test(ua)) return true;
  // iPadOS 13+ маскируется под Mac, но имеет touch
  if (/macintosh/.test(ua) && navigator.maxTouchPoints > 1) return true;
  return false;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  // PWA/standalone — пользователь уже «установил»
  // @ts-expect-error legacy iOS
  if (window.navigator.standalone) return true;
  if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
  // Webview / TWA — не показываем
  const ua = navigator.userAgent;
  if (/wv\)|; wv\)/i.test(ua)) return true;
  return false;
}

export function AppDownloadDrawer() {
  const pathname = usePathname();
  const t = useTranslations("App");
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const path = stripLocale(pathname);
    if (EXCLUDED_PATHS.some((p) => path === p || path.startsWith(p + "/"))) {
      return;
    }
    if (!isMobileUserAgent()) return;
    if (isStandalone()) return;

    try {
      if (localStorage.getItem(DISMISS_FOREVER_KEY) === "1") return;
      const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) ?? 0);
      if (dismissedAt && Date.now() - dismissedAt < DISMISS_TTL_MS) return;
    } catch {
      // localStorage недоступен — покажем один раз
    }

    const timer = window.setTimeout(() => setOpen(true), SHOW_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      try {
        localStorage.setItem(DISMISS_KEY, String(Date.now()));
      } catch {
        // ignore
      }
    }
  };

  const handleAlreadyInstalled = () => {
    try {
      localStorage.setItem(DISMISS_FOREVER_KEY, "1");
    } catch {
      // ignore
    }
    setOpen(false);
  };

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md px-4 pb-6">
          <DrawerHeader className="px-0 text-center">
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Smartphone className="h-7 w-7 text-primary" />
            </div>
            <DrawerTitle className="text-xl">
              {t("drawer.title")}
            </DrawerTitle>
            <DrawerDescription>{t("drawer.subtitle")}</DrawerDescription>
          </DrawerHeader>

          <div className="mt-2 flex flex-col gap-2">
            <Button
              size="lg"
              className="h-12 w-full"
              asChild
            >
              <a href="/app" onClick={() => setOpen(false)}>
                <Download className="mr-2 h-5 w-5" />
                {t("downloadApp")}
              </a>
            </Button>
            <Button
              variant="ghost"
              className="h-10 w-full text-muted-foreground"
              onClick={handleAlreadyInstalled}
            >
              {t("drawer.alreadyInstalled")}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
