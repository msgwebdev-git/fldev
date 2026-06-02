"use client";

import Script from "next/script";
import { useConsent } from "@/context/ConsentContext";

// Hardcoded IDs that previously loaded unconditionally in MarketingScripts.
// Kept here so they pass through the same consent gate.
const HARDCODED_FACEBOOK_PIXEL_ID = "5131761063570173";
const HARDCODED_CLARITY_ID = "wx52z62zrc";

export interface GatedTrackerIds {
  facebookPixelId?: string;
  tiktokPixelId?: string;
  yandexMetricaId?: string;
}

/**
 * Trackers that do NOT understand Google Consent Mode (Facebook, TikTok, Yandex,
 * Microsoft Clarity). Their <script> is only injected into the DOM AFTER the user
 * grants the matching consent category — never before. Toggling consent at runtime
 * mounts/unmounts these reactively via the consent context.
 *
 *   analytics → Yandex Metrica, Microsoft Clarity (incl. session recording)
 *   marketing → Facebook Pixel, TikTok Pixel
 */
export function GatedTrackers({ ids }: { ids: GatedTrackerIds }) {
  const { categories, ready } = useConsent();

  // Avoid injecting anything during SSR / before localStorage is read.
  if (!ready) return null;

  const analytics = categories.analytics;
  const marketing = categories.marketing;

  return (
    <>
      {/* ---- Marketing ---- */}
      {marketing && (
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${ids.facebookPixelId || HARDCODED_FACEBOOK_PIXEL_ID}');
          fbq('track', 'PageView');`}
        </Script>
      )}

      {marketing && ids.tiktokPixelId && (
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`!function (w, d, t) {
          w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
          ttq.load('${ids.tiktokPixelId}');
          ttq.page();
          }(window, document, 'ttq');`}
        </Script>
      )}

      {/* ---- Analytics ---- */}
      {analytics && ids.yandexMetricaId && (
        <Script id="yandex-metrica" strategy="afterInteractive">
          {`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
          m[i].l=1*new Date();
          for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
          k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
          (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
          ym(${ids.yandexMetricaId}, "init", {
               clickmap:true,
               trackLinks:true,
               accurateTrackBounce:true,
               webvisor:true
          });`}
        </Script>
      )}

      {analytics && (
        <Script id="ms-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "${HARDCODED_CLARITY_ID}");`}
        </Script>
      )}
    </>
  );
}
