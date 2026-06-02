import { cache } from "react";
import Script from "next/script";
import { createPublicClient } from "@/lib/supabase/public";
import { SanitizedHtml } from "@/components/SanitizedHtml";
import { ConsentModeInit } from "@/components/consent/ConsentModeInit";
import {
  GatedTrackers,
  type GatedTrackerIds,
} from "@/components/consent/GatedTrackers";

// Hardcoded GA4 id that previously loaded unconditionally. Google tags respect
// Consent Mode v2 (default = denied), so they may load before consent — they
// run in cookieless-ping mode until the user grants the analytics category.
const HARDCODED_GA4_ID = "G-2CR43QPEEW";

interface MarketingSettings {
  ga4_id?: string;
  gtm_id?: string;
  facebook_pixel_id?: string;
  tiktok_pixel_id?: string;
  yandex_metrica_id?: string;
  custom_head_scripts?: string;
  custom_body_scripts?: string;
}

// Deduped within a single render: Head + Body invoke this once each per page.
const getMarketingSettings = cache(async (): Promise<MarketingSettings> => {
  const supabase = createPublicClient();

  const { data: settings } = await supabase
    .from("site_settings")
    .select("key, value")
    .eq("category", "marketing");

  const settingsMap: MarketingSettings = {};
  settings?.forEach((setting) => {
    if (setting.value) {
      settingsMap[setting.key as keyof MarketingSettings] = setting.value;
    }
  });

  return settingsMap;
});

function toGatedIds(settings: MarketingSettings): GatedTrackerIds {
  return {
    facebookPixelId: settings.facebook_pixel_id,
    tiktokPixelId: settings.tiktok_pixel_id,
    yandexMetricaId: settings.yandex_metrica_id,
  };
}

/**
 * Head scripts. Order matters: ConsentModeInit MUST come first so the
 * "everything denied" default is set before any Google tag initializes.
 * Google tags (GA4 / GTM) are Consent-Mode-aware and load unconditionally.
 * Consent-unaware trackers (FB / TikTok / Yandex / Clarity) are NOT here —
 * they are gated client-side in <MarketingTrackers />.
 */
export async function MarketingScriptsHead() {
  const settings = await getMarketingSettings();

  return (
    <>
      <ConsentModeInit />

      {/* Google Tag Manager - Head */}
      {settings.gtm_id && (
        <Script id="gtm-head" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${settings.gtm_id}');`}
        </Script>
      )}

      {/* Google Analytics 4 (configured id) */}
      {settings.ga4_id && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${settings.ga4_id}`}
            strategy="afterInteractive"
          />
          <Script id="ga4" strategy="afterInteractive">
            {`gtag('js', new Date());
            gtag('config', '${settings.ga4_id}');`}
          </Script>
        </>
      )}

      {/* Google Analytics 4 (default site id) */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${HARDCODED_GA4_ID}`}
        strategy="afterInteractive"
      />
      <Script id="gtag" strategy="afterInteractive">
        {`gtag('js', new Date());
        gtag('config', '${HARDCODED_GA4_ID}');`}
      </Script>

      {/* Custom Head Scripts */}
      {settings.custom_head_scripts && (
        <SanitizedHtml html={settings.custom_head_scripts} allowScripts />
      )}
    </>
  );
}

/**
 * Body scripts. The previous <noscript> tracking pixels (Facebook, Yandex,
 * GTM) were removed: a no-JS visitor cannot give consent, so firing those
 * pixels would set tracking without a legal basis. Only consent-safe custom
 * markup remains here.
 */
export async function MarketingScriptsBody() {
  const settings = await getMarketingSettings();

  return (
    <>
      {/* Custom Body Scripts */}
      {settings.custom_body_scripts && (
        <SanitizedHtml html={settings.custom_body_scripts} allowScripts />
      )}
    </>
  );
}

/**
 * Consent-gated trackers (client-side). Fetches the marketing ids on the server
 * and hands them to the client gate, which only injects each tracker after the
 * matching consent category is granted. Render inside <ConsentProvider />.
 */
export async function MarketingTrackers() {
  const settings = await getMarketingSettings();
  return <GatedTrackers ids={toGatedIds(settings)} />;
}
