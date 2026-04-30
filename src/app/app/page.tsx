import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";

const APP_STORE_URL =
  "https://apps.apple.com/md/app/festivalul-lupilor/id6746709793";
const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.mycompany.festivalullupilorv2";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Festivalul Lupilor — Aplicația mobilă",
  description:
    "Descarcă aplicația oficială Festivalul Lupilor pentru iOS și Android.",
  robots: { index: false, follow: false },
};

function detectPlatform(userAgent: string): "ios" | "android" | "other" {
  const ua = userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  // iPadOS 13+ маскируется под Mac, но имеет touch
  if (/macintosh/.test(ua) && /mobile/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  return "other";
}

export default async function AppRedirectPage() {
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") ?? "";
  const platform = detectPlatform(userAgent);

  if (platform === "ios") redirect(APP_STORE_URL);
  if (platform === "android") redirect(PLAY_STORE_URL);

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <Image
            src="/logo-fl.png"
            alt="Festivalul Lupilor"
            width={120}
            height={120}
            priority
          />
        </div>
        <h1 className="mb-3 text-3xl font-bold">Festivalul Lupilor</h1>
        <p className="mb-10 text-muted-foreground">
          Descarcă aplicația oficială pentru a primi notificări despre program,
          artiști și surprize de la festival.
        </p>

        <div className="flex flex-col items-center gap-3">
          <a
            href={APP_STORE_URL}
            aria-label="Descarcă din App Store"
            className="inline-block transition hover:opacity-90"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
              alt="Download on the App Store"
              className="h-14 w-auto"
            />
          </a>

          <a
            href={PLAY_STORE_URL}
            aria-label="Descarcă din Google Play"
            className="inline-block transition hover:opacity-90"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
              alt="Get it on Google Play"
              className="h-20 w-auto -my-3"
            />
          </a>
        </div>
      </div>
    </main>
  );
}
