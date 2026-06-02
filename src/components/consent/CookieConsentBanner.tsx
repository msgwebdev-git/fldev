"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useConsent } from "@/context/ConsentContext";
import { TOGGLEABLE_CATEGORIES, type ConsentCategories } from "@/lib/consent";

function CategoryRow({
  title,
  description,
  checked,
  disabled,
  badge,
  onCheckedChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  badge?: string;
  onCheckedChange?: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground">{title}</p>
          {badge && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      <Switch
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
        className="mt-1"
      />
    </div>
  );
}

export function CookieConsentBanner() {
  const t = useTranslations("CookieConsent");
  const {
    ready,
    hasChoice,
    categories,
    settingsOpen,
    acceptAll,
    rejectAll,
    save,
    openSettings,
    closeSettings,
  } = useConsent();

  // Draft toggles for the settings dialog.
  const [draft, setDraft] = React.useState<ConsentCategories>(categories);

  // Sync draft with current consent whenever the dialog opens.
  React.useEffect(() => {
    if (settingsOpen) setDraft(categories);
  }, [settingsOpen, categories]);

  const labels: Record<string, { label: string; desc: string }> = {
    analytics: { label: t("analyticsLabel"), desc: t("analyticsDesc") },
    marketing: { label: t("marketingLabel"), desc: t("marketingDesc") },
  };

  return (
    <>
      {/* Bottom banner — only before an explicit choice and only after mount */}
      {ready && !hasChoice && !settingsOpen && (
        <div
          role="dialog"
          aria-live="polite"
          aria-label={t("title")}
          className="fixed inset-x-0 bottom-0 z-[100] border-t border-border bg-background/95 p-4 shadow-[0_-4px_24px_rgba(0,0,0,0.12)] backdrop-blur supports-[backdrop-filter]:bg-background/80"
        >
          <div className="container mx-auto flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl space-y-1">
              <p className="text-sm font-semibold text-foreground">
                {t("title")}
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {t("description")}{" "}
                <Link
                  href="/privacy"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  {t("privacyLink")}
                </Link>
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap md:shrink-0">
              <Button variant="outline" size="sm" onClick={rejectAll}>
                {t("rejectAll")}
              </Button>
              <Button variant="outline" size="sm" onClick={openSettings}>
                {t("customize")}
              </Button>
              <Button size="sm" onClick={acceptAll}>
                {t("acceptAll")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Settings dialog — reachable from the banner and from the footer link */}
      <Dialog
        open={settingsOpen}
        onOpenChange={(open) => (open ? openSettings() : closeSettings())}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("settingsTitle")}</DialogTitle>
            <DialogDescription>{t("settingsDescription")}</DialogDescription>
          </DialogHeader>

          <div className="divide-y divide-border">
            <CategoryRow
              title={t("necessaryLabel")}
              description={t("necessaryDesc")}
              checked
              disabled
              badge={t("alwaysActive")}
            />
            {TOGGLEABLE_CATEGORIES.map((key) => (
              <CategoryRow
                key={key}
                title={labels[key].label}
                description={labels[key].desc}
                checked={draft[key]}
                onCheckedChange={(v) =>
                  setDraft((prev) => ({ ...prev, [key]: v }))
                }
              />
            ))}
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            <Button variant="outline" onClick={() => save(draft)}>
              {t("save")}
            </Button>
            <Button onClick={acceptAll}>{t("acceptAll")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
