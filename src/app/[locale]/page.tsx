import { HeroSection } from "@/components/HeroSection";
import { TicketsSection } from "@/components/TicketsSection";
import { AftermovieSection } from "@/components/AftermovieSection";
import { GallerySection } from "@/components/GallerySection";
import { AppSection } from "@/components/AppSection";
import { NewsSection } from "@/components/NewsSection";
import { getActiveTickets } from "@/lib/data/tickets";
import { getSiteSettingBool } from "@/lib/data/site-settings";
import { generatePageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

// ISR: cached HTML, regenerated at most every 5 min — covers ticket/availability changes.
export const revalidate = 300;

export async function generateMetadata({ params }: Props) {
  return generatePageMetadata({ params, page: "home", path: "" });
}

export default async function Home() {
  const [tickets, showMobileApp] = await Promise.all([
    getActiveTickets(),
    getSiteSettingBool("show_mobile_app"),
  ]);

  return (
    <>
      <HeroSection />
      <TicketsSection tickets={tickets} />
      <AftermovieSection />
      <GallerySection />
      {showMobileApp && <AppSection />}
      <NewsSection />
    </>
  );
}
