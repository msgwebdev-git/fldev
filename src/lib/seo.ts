import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

const SITE_URL = "https://www.festivalul-lupilor.md";

/**
 * Generate page-specific metadata with locale support.
 * Uses translations from Metadata namespace.
 *
 * Usage in page.tsx:
 *   export async function generateMetadata({ params }: Props) {
 *     return generatePageMetadata({ params, page: "tickets" });
 *   }
 */
export async function generatePageMetadata({
  params,
  page,
  path,
  noindex = false,
}: {
  params: Promise<{ locale: string }>;
  page: string;
  path?: string;
  noindex?: boolean;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  const pagePath = path || `/${page}`;
  const title = t(`${page}.title`);
  const description = t(`${page}.description`);

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${locale}${pagePath}`,
      languages: {
        ro: `${SITE_URL}/ro${pagePath}`,
        ru: `${SITE_URL}/ru${pagePath}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${locale}${pagePath}`,
      images: [`${SITE_URL}/og.png`],
    },
    ...(noindex && {
      robots: { index: false, follow: false },
    }),
  };
}
