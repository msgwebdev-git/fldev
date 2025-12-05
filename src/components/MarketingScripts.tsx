import Script from "next/script";
import { createClient } from "@/lib/supabase/server";

interface MarketingSettings {
  ga4_id?: string;
  gtm_id?: string;
  facebook_pixel_id?: string;
  tiktok_pixel_id?: string;
  yandex_metrica_id?: string;
  custom_head_scripts?: string;
  custom_body_scripts?: string;
}

async function getMarketingSettings(): Promise<MarketingSettings> {
  const supabase = await createClient();

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
}

export async function MarketingScriptsHead() {
  const settings = await getMarketingSettings();

  return (
    <>
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

      {/* Google Analytics 4 */}
      {settings.ga4_id && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${settings.ga4_id}`}
            strategy="afterInteractive"
          />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${settings.ga4_id}');`}
          </Script>
        </>
      )}

      {/* Facebook/Meta Pixel */}
      {settings.facebook_pixel_id && (
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${settings.facebook_pixel_id}');
          fbq('track', 'PageView');`}
        </Script>
      )}

      {/* TikTok Pixel */}
      {settings.tiktok_pixel_id && (
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`!function (w, d, t) {
          w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
          ttq.load('${settings.tiktok_pixel_id}');
          ttq.page();
          }(window, document, 'ttq');`}
        </Script>
      )}

      {/* Yandex Metrica */}
      {settings.yandex_metrica_id && (
        <Script id="yandex-metrica" strategy="afterInteractive">
          {`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
          m[i].l=1*new Date();
          for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
          k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
          (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
          ym(${settings.yandex_metrica_id}, "init", {
               clickmap:true,
               trackLinks:true,
               accurateTrackBounce:true,
               webvisor:true
          });`}
        </Script>
      )}

      {/* Custom Head Scripts */}
      {settings.custom_head_scripts && (
        <div dangerouslySetInnerHTML={{ __html: settings.custom_head_scripts }} />
      )}
    </>
  );
}

export async function MarketingScriptsBody() {
  const settings = await getMarketingSettings();

  return (
    <>
      {/* Google Tag Manager - NoScript */}
      {settings.gtm_id && (
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${settings.gtm_id}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
      )}

      {/* Facebook Pixel - NoScript */}
      {settings.facebook_pixel_id && (
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${settings.facebook_pixel_id}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
      )}

      {/* Yandex Metrica - NoScript */}
      {settings.yandex_metrica_id && (
        <noscript>
          <div>
            <img
              src={`https://mc.yandex.ru/watch/${settings.yandex_metrica_id}`}
              style={{ position: "absolute", left: "-9999px" }}
              alt=""
            />
          </div>
        </noscript>
      )}

      {/* Custom Body Scripts */}
      {settings.custom_body_scripts && (
        <div dangerouslySetInnerHTML={{ __html: settings.custom_body_scripts }} />
      )}
    </>
  );
}
