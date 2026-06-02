"use client";

import { useTranslations } from "next-intl";
import { useConsent } from "@/context/ConsentContext";

/**
 * Footer link to reopen the consent settings dialog — lets users review or
 * withdraw consent at any time (GDPR requirement).
 */
export function CookieSettingsLink({ className }: { className?: string }) {
  const t = useTranslations("CookieConsent");
  const { openSettings } = useConsent();

  return (
    <button type="button" onClick={openSettings} className={className}>
      {t("manageLink")}
    </button>
  );
}
