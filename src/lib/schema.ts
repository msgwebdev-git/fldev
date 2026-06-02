/**
 * schema.org JSON-LD builders for rich results in Google Search.
 * Rendered via the <JsonLd> component (src/components/JsonLd.tsx).
 */

const SITE_URL = "https://www.festivalul-lupilor.md";

/** Festival edition constants — update per edition. */
export const EVENT = {
  year: "2026",
  // Moldova is EEST (+03:00) in August.
  startDate: "2026-08-07T12:00:00+03:00",
  endDate: "2026-08-09T23:59:00+03:00",
  venue: {
    name: "Rezervația Cultural-Naturală Orheiul Vechi",
    streetAddress: "Orheiul Vechi",
    addressLocality: "Trebujeni",
    addressRegion: "Orhei",
    addressCountry: "MD",
    latitude: 47.3076377,
    longitude: 28.9878523,
  },
} as const;

const ORG = {
  name: "Festivalul Lupilor",
  url: SITE_URL,
  logo: `${SITE_URL}/og.png`,
} as const;

type Locale = "ro" | "ru";

const COPY: Record<Locale, { name: string; description: string }> = {
  ro: {
    name: "Festivalul Lupilor 2026",
    description:
      "Cel mai mare festival de muzică și camping din Moldova. 7-9 August 2026, Orheiul Vechi. Line-up cu artiști din Moldova și România, camping, activități.",
  },
  ru: {
    name: "Festivalul Lupilor 2026",
    description:
      "Крупнейший музыкальный и кемпинг-фестиваль Молдовы. 7-9 августа 2026, Orheiul Vechi. Артисты из Молдовы и Румынии, кемпинг, активности.",
  },
};

export type SchemaTicket = {
  nameRo: string;
  nameRu: string;
  price: number;
  currency?: string;
};

export type SchemaArtist = {
  name: string;
  image_url: string | null;
};

function place() {
  const v = EVENT.venue;
  return {
    "@type": "Place",
    name: v.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: v.streetAddress,
      addressLocality: v.addressLocality,
      addressRegion: v.addressRegion,
      addressCountry: v.addressCountry,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: v.latitude,
      longitude: v.longitude,
    },
  };
}

export function buildMusicEventSchema({
  locale,
  tickets,
  artists,
}: {
  locale: Locale;
  tickets: SchemaTicket[];
  artists: SchemaArtist[];
}) {
  const copy = COPY[locale];
  const ticketsUrl = `${SITE_URL}/${locale}/tickets`;

  const offers = tickets.map((t) => ({
    "@type": "Offer",
    name: locale === "ru" ? t.nameRu : t.nameRo,
    price: t.price,
    priceCurrency: t.currency || "MDL",
    availability: "https://schema.org/InStock",
    url: ticketsUrl,
    validThrough: EVENT.endDate,
  }));

  const performer = artists.map((a) => ({
    "@type": "MusicGroup",
    name: a.name,
    ...(a.image_url ? { image: a.image_url } : {}),
  }));

  return {
    "@context": "https://schema.org",
    "@type": "MusicEvent",
    name: copy.name,
    description: copy.description,
    startDate: EVENT.startDate,
    endDate: EVENT.endDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    image: [`${SITE_URL}/og.png`],
    url: `${SITE_URL}/${locale}`,
    location: place(),
    organizer: { "@type": "Organization", name: ORG.name, url: ORG.url },
    ...(offers.length ? { offers } : {}),
    ...(performer.length ? { performer } : {}),
  };
}

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: ORG.name,
    url: ORG.url,
    logo: ORG.logo,
    description:
      "Festivalul Lupilor — cel mai mare festival de muzică și camping din Moldova, la Orheiul Vechi.",
    sameAs: [
      "https://www.facebook.com/festivalullupilor/",
      "https://www.instagram.com/festivalul.lupilor/",
      "https://www.tiktok.com/@festivalul_lupilor",
      "https://www.youtube.com/@festivalullupilor",
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        availableLanguage: ["Romanian", "Russian", "English"],
      },
    ],
  };
}

export function buildFaqSchema(
  items: { question: string; answer: string }[]
) {
  if (!items.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.question,
      acceptedAnswer: { "@type": "Answer", text: i.answer },
    })),
  };
}
