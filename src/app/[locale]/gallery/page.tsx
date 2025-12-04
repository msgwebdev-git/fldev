"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { X, ChevronLeft, ChevronRight, ZoomIn, Camera, ArrowLeft } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
}

interface YearGallery {
  year: string;
  images: GalleryImage[];
}

// Mock data - will be replaced with Supabase
const generateMockImages = (year: string, count: number): GalleryImage[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `${year}-${i + 1}`,
    src: `https://picsum.photos/seed/${year}${i}/800/600`,
    alt: `Festival ${year} - Photo ${i + 1}`,
    width: 800,
    height: 600,
  }));
};

const galleryData: YearGallery[] = [
  { year: "2025", images: generateMockImages("2025", 24) },
  { year: "2024", images: generateMockImages("2024", 24) },
  { year: "2023", images: generateMockImages("2023", 24) },
  { year: "2022", images: generateMockImages("2022", 24) },
  { year: "2021", images: generateMockImages("2021", 24) },
];

export default function GalleryPage() {
  const t = useTranslations("Gallery");
  const searchParams = useSearchParams();
  const yearParam = searchParams.get("year");

  const [selectedYear, setSelectedYear] = React.useState(
    yearParam && galleryData.some(g => g.year === yearParam)
      ? yearParam
      : galleryData[0].year
  );
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  const currentGallery = galleryData.find((g) => g.year === selectedYear);

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
  };

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const goToPrevious = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? (currentGallery?.images.length || 1) - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) =>
      prev === (currentGallery?.images.length || 1) - 1 ? 0 : prev + 1
    );
  };

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === "ArrowLeft") goToPrevious();
      if (e.key === "ArrowRight") goToNext();
      if (e.key === "Escape") closeLightbox();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen]);

  return (
    <main className="min-h-screen bg-background pt-24 pb-20">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <div className="mb-8">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("backToHome")}
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <Camera className="h-3 w-3 mr-1" />
            {t("badge")}
          </Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {t("pageTitle")}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {t("pageSubtitle")}
          </p>
        </div>

        {/* Year Tabs */}
        <Tabs value={selectedYear} onValueChange={handleYearChange} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid grid-cols-5 h-auto p-1">
              {galleryData.map((gallery) => (
                <TabsTrigger
                  key={gallery.year}
                  value={gallery.year}
                  className="px-6 py-2.5 text-sm font-medium"
                >
                  {gallery.year}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {galleryData.map((gallery) => (
            <TabsContent key={gallery.year} value={gallery.year} className="mt-0">
              {/* Masonry-style Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {gallery.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => openLightbox(index)}
                    className={cn(
                      "group relative overflow-hidden rounded-xl bg-muted aspect-square cursor-pointer",
                      "transition-all duration-300 hover:shadow-xl hover:scale-[1.02]",
                      // Make some images span 2 rows for visual interest
                      index % 5 === 0 && "md:row-span-2 md:aspect-auto md:h-full"
                    )}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <ZoomIn className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Photo count */}
              <div className="text-center mt-8 text-muted-foreground">
                {gallery.images.length} {t("badge").toLowerCase()}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Lightbox */}
        <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none">
            <DialogTitle className="sr-only">
              {currentGallery?.images[currentImageIndex]?.alt}
            </DialogTitle>

            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label={t("close")}
            >
              <X className="h-6 w-6 text-white" />
            </button>

            {/* Navigation Buttons */}
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label={t("previous")}
            >
              <ChevronLeft className="h-8 w-8 text-white" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label={t("next")}
            >
              <ChevronRight className="h-8 w-8 text-white" />
            </button>

            {/* Image */}
            <div className="relative w-full h-[85vh] flex items-center justify-center p-8">
              {currentGallery?.images[currentImageIndex] && (
                <Image
                  src={currentGallery.images[currentImageIndex].src}
                  alt={currentGallery.images[currentImageIndex].alt}
                  fill
                  className="object-contain"
                  priority
                />
              )}
            </div>

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm">
              <span className="text-white text-sm">
                {currentImageIndex + 1} / {currentGallery?.images.length}
              </span>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
