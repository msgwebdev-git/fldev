import { HeroSection } from "@/components/HeroSection";
import { TicketsSection } from "@/components/TicketsSection";
import { AftermovieSection } from "@/components/AftermovieSection";
import { GallerySection } from "@/components/GallerySection";
import { AppSection } from "@/components/AppSection";
import { NewsSection } from "@/components/NewsSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <TicketsSection />
      <AftermovieSection />
      <GallerySection />
      <AppSection />
      <NewsSection />
    </>
  );
}
