"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { X, ChevronLeft, ChevronRight, ZoomIn, Camera, ArrowRight } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface GalleryImage {
  id: number;
  filename: string;
  thumbnailSrc: string;
  fullSrc: string;
  alt: string;
  width: number;
  height: number;
}

interface YearGallery {
  year: string;
  images: GalleryImage[];
}

interface GalleryDbRow {
  id: number;
  year: string;
  filename: string;
  alt_text: string | null;
  width: number;
  height: number;
  display_order: number;
}

// Helper function to get Supabase Storage URL
function getStorageUrl(bucketName: string, path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${path}`;
}

// Fetch gallery data from Supabase
async function fetchGalleryData(): Promise<YearGallery[]> {
  try {
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .order('year', { ascending: false })
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching gallery:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Group by year
    const galleryByYear = new Map<string, GalleryImage[]>();

    (data as GalleryDbRow[]).forEach((row) => {
      const thumbnailSrc = getStorageUrl('gallery', `${row.year}/thumbnails/${row.filename}.webp`);
      const fullSrc = getStorageUrl('gallery', `${row.year}/full/${row.filename}.webp`);

      const image: GalleryImage = {
        id: row.id,
        filename: row.filename,
        thumbnailSrc,
        fullSrc,
        alt: row.alt_text || `Festival ${row.year}`,
        width: row.width,
        height: row.height,
      };

      if (!galleryByYear.has(row.year)) {
        galleryByYear.set(row.year, []);
      }
      galleryByYear.get(row.year)!.push(image);
    });

    // Convert to array
    const result: YearGallery[] = Array.from(galleryByYear.entries()).map(([year, images]) => ({
      year,
      images,
    }));

    return result;
  } catch (error) {
    console.error('Error in fetchGalleryData:', error);
    return [];
  }
}

const VISIBLE_COUNT = 7;

export function GallerySection() {
  const t = useTranslations("Gallery");
  const [galleryData, setGalleryData] = React.useState<YearGallery[]>([]);
  const [selectedYear, setSelectedYear] = React.useState("");
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [imageLoading, setImageLoading] = React.useState(true);

  // Load gallery data
  React.useEffect(() => {
    async function loadGallery() {
      setIsLoading(true);
      const data = await fetchGalleryData();
      setGalleryData(data);

      // Set initial year
      if (data.length > 0) {
        setSelectedYear(data[0].year);
      }

      setIsLoading(false);
    }

    loadGallery();
  }, []);

  const currentGallery = galleryData.find((g) => g.year === selectedYear);
  const visibleImages = currentGallery?.images.slice(0, VISIBLE_COUNT) || [];
  const hasMore = currentGallery ? currentGallery.images.length > VISIBLE_COUNT : false;

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
  };

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setImageLoading(true);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const goToPrevious = () => {
    setImageLoading(true);
    setCurrentImageIndex((prev) =>
      prev === 0 ? (currentGallery?.images.length || 1) - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setImageLoading(true);
    setCurrentImageIndex((prev) =>
      prev === (currentGallery?.images.length || 1) - 1 ? 0 : prev + 1
    );
  };

  // Preload adjacent images
  React.useEffect(() => {
    if (!lightboxOpen || !currentGallery) return;

    const preloadImage = (src: string) => {
      const img = new window.Image();
      img.src = src;
    };

    const totalImages = currentGallery.images.length;
    const prevIndex = currentImageIndex === 0 ? totalImages - 1 : currentImageIndex - 1;
    const nextIndex = currentImageIndex === totalImages - 1 ? 0 : currentImageIndex + 1;

    // Preload previous and next images
    if (currentGallery.images[prevIndex]) {
      preloadImage(currentGallery.images[prevIndex].fullSrc);
    }
    if (currentGallery.images[nextIndex]) {
      preloadImage(currentGallery.images[nextIndex].fullSrc);
    }
  }, [lightboxOpen, currentImageIndex, currentGallery]);

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

  // Show loading state
  if (isLoading) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          </div>
        </div>
      </section>
    );
  }

  // Show empty state or hide section if no data
  if (galleryData.length === 0) {
    return null; // Don't show the section if there's no gallery data
  }

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <Camera className="h-3 w-3 mr-1" />
            {t("badge")}
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {t("title")}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {t("subtitle")}
          </p>
        </div>

        {/* Year Tabs */}
        <Tabs value={selectedYear} onValueChange={handleYearChange} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className={cn(
              "h-auto p-1",
              galleryData.length <= 3 ? "grid grid-cols-3" : "grid",
              galleryData.length === 4 && "grid-cols-4",
              galleryData.length >= 5 && "grid-cols-5"
            )}>
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
                {visibleImages.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => openLightbox(index)}
                    className={cn(
                      "group relative overflow-hidden rounded-xl bg-muted aspect-square cursor-pointer",
                      "transition-all duration-300 hover:shadow-xl hover:scale-[1.02]",
                      // Make only first image span 2 rows for visual interest
                      index === 0 && "md:row-span-2 md:aspect-auto md:h-full"
                    )}
                  >
                    <Image
                      src={image.thumbnailSrc}
                      alt={image.alt}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      loading="lazy"
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

              {/* View All Button */}
              {hasMore && (
                <div className="text-center mt-8">
                  <Button
                    variant="outline"
                    size="lg"
                    className="px-8"
                    asChild
                  >
                    <Link href={`/gallery?year=${selectedYear}`}>
                      {t("viewAll")}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Custom Lightbox */}
        {lightboxOpen && (
          <div className="fixed inset-0 z-50 bg-black">
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="fixed top-4 right-4 md:top-6 md:right-6 z-50 p-2 md:p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm"
              aria-label="Close"
            >
              <X className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </button>

            {/* Main Content Area with Flexbox Layout */}
            <div className="fixed inset-0 flex items-center">
              {/* Previous Button */}
              <button
                onClick={goToPrevious}
                className="flex-shrink-0 p-2 md:p-4 mx-2 md:mx-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm"
                aria-label="Previous"
              >
                <ChevronLeft className="h-6 w-6 md:h-8 md:w-8 text-white" />
              </button>

              {/* Image Container */}
              <div className="flex-1 flex items-center justify-center h-full py-16 relative">
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-white border-r-transparent"></div>
                  </div>
                )}
                {currentGallery?.images[currentImageIndex] && (
                  <img
                    key={currentGallery.images[currentImageIndex].id}
                    src={currentGallery.images[currentImageIndex].fullSrc}
                    alt={currentGallery.images[currentImageIndex].alt}
                    className="max-w-full max-h-full w-auto h-auto object-contain transition-opacity duration-200"
                    style={{ opacity: imageLoading ? 0 : 1 }}
                    loading="eager"
                    onLoad={() => setImageLoading(false)}
                  />
                )}
              </div>

              {/* Next Button */}
              <button
                onClick={goToNext}
                className="flex-shrink-0 p-2 md:p-4 mx-2 md:mx-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm"
                aria-label="Next"
              >
                <ChevronRight className="h-6 w-6 md:h-8 md:w-8 text-white" />
              </button>
            </div>

            {/* Counter */}
            <div className="fixed bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 px-4 md:px-6 py-2 md:py-3 rounded-full bg-white/10 backdrop-blur-sm">
              <span className="text-white text-sm md:text-base font-medium">
                {currentImageIndex + 1} / {currentGallery?.images.length}
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
