import { HeroSection } from "@/components/HeroSection";
import { TicketsSection } from "@/components/TicketsSection";
import { AftermovieSection } from "@/components/AftermovieSection";
import { GallerySection } from "@/components/GallerySection";
import { AppSection } from "@/components/AppSection";
import { NewsSection } from "@/components/NewsSection";
import { getActiveTickets } from "@/lib/data/tickets";
import { getSiteSettingBool } from "@/lib/data/site-settings";
import { generatePageMetadata } from "@/lib/seo";
import { createPublicClient } from "@/lib/supabase/public";
import { JsonLd } from "@/components/JsonLd";
import { buildMusicEventSchema, EVENT } from "@/lib/schema";

type Props = { params: Promise<{ locale: string }> };

// ISR: cached HTML, regenerated at most every 5 min — covers ticket/availability changes.
export const revalidate = 300;

export async function generateMetadata({ params }: Props) {
  return generatePageMetadata({ params, page: "home", path: "" });
}

export default async function Home({ params }: Props) {
  const { locale } = await params;
  const supabase = createPublicClient();
  const [tickets, showMobileApp, { data: artists }] = await Promise.all([
    getActiveTickets(),
    getSiteSettingBool("show_mobile_app"),
    supabase
      .from("artists")
      .select("name, image_url")
      .eq("year", EVENT.year)
      .order("is_headliner", { ascending: false }),
  ]);

  const eventSchema = buildMusicEventSchema({
    locale: locale === "ru" ? "ru" : "ro",
    tickets,
    artists: artists ?? [],
  });

  return (
    <>
      <JsonLd data={eventSchema} />
      <HeroSection />
      <TicketsSection tickets={tickets} />
      <AftermovieSection />
      <GallerySection />
      {showMobileApp && <AppSection />}
      <NewsSection />
    </>
  );
}
