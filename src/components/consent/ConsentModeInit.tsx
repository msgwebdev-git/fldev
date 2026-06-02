import Script from "next/script";

/**
 * Google Consent Mode v2 default state.
 *
 * MUST render in <head> BEFORE any Google tag (GA4 / GTM / gtag). It defines
 * window.dataLayer + gtag (so consent updates from ConsentContext never throw,
 * even when no GA id is configured) and sets every non-essential signal to
 * "denied" by default. Google tags then run in cookieless-ping mode until the
 * user grants consent via the banner.
 */
export function ConsentModeInit() {
  return (
    <Script id="consent-mode-init" strategy="beforeInteractive">
      {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'denied',
  personalization_storage: 'denied',
  security_storage: 'granted',
  wait_for_update: 500
});
window.gtag = gtag;`}
    </Script>
  );
}
