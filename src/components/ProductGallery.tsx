"use client";

import * as React from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Expand, ShoppingBag } from "lucide-react";

import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import "yet-another-react-lightbox/plugins/counter.css";

interface ProductGalleryProps {
  images: string[];
  alt: string;
}

export function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [selected, setSelected] = React.useState(0);
  const [open, setOpen] = React.useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: images.length > 1 });
  const [thumbRef, thumbApi] = useEmblaCarousel({ containScroll: "keepSnaps", dragFree: true });

  const onSelect = React.useCallback(() => {
    if (!emblaApi) return;
    const i = emblaApi.selectedScrollSnap();
    setSelected(i);
    thumbApi?.scrollTo(i);
  }, [emblaApi, thumbApi]);

  React.useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollTo = React.useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/5] w-full items-center justify-center rounded-3xl border border-border bg-muted text-muted-foreground/40">
        <ShoppingBag className="h-16 w-16" />
      </div>
    );
  }

  const slides = images.map((src) => ({ src }));

  return (
    <div className="space-y-3">
      {/* Main carousel */}
      <div className="group relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-border bg-muted">
        <div className="h-full overflow-hidden" ref={emblaRef}>
          <div className="flex h-full">
            {images.map((src, i) => (
              <div key={i} className="relative h-full min-w-0 flex-[0_0_100%]">
                <Image
                  src={src}
                  alt={alt}
                  fill
                  priority={i === 0}
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="cursor-zoom-in object-cover"
                  onClick={() => setOpen(true)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Arrows (desktop hover) */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Prev"
              onClick={() => emblaApi?.scrollPrev()}
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/85 text-foreground shadow-sm backdrop-blur-sm transition-opacity hover:bg-background md:opacity-0 md:group-hover:opacity-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={() => emblaApi?.scrollNext()}
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/85 text-foreground shadow-sm backdrop-blur-sm transition-opacity hover:bg-background md:opacity-0 md:group-hover:opacity-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Expand → lightbox */}
        <button
          type="button"
          aria-label="Zoom"
          onClick={() => setOpen(true)}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/85 text-foreground shadow-sm backdrop-blur-sm transition-opacity hover:bg-background md:opacity-0 md:group-hover:opacity-100"
        >
          <Expand className="h-4 w-4" />
        </button>

        {/* dots (mobile) */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 md:hidden">
            {images.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${i === selected ? "w-4 bg-primary" : "w-1.5 bg-background/70"}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="overflow-hidden" ref={thumbRef}>
          <div className="flex gap-2.5">
            {images.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollTo(i)}
                className={`relative h-20 w-20 flex-[0_0_auto] overflow-hidden rounded-2xl border-2 transition-all ${
                  i === selected ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <Image src={src} alt={`${alt} ${i + 1}`} fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Fullscreen lightbox with zoom */}
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={selected}
        on={{
          view: ({ index }) => {
            setSelected(index);
            emblaApi?.scrollTo(index, true);
          },
        }}
        slides={slides}
        plugins={[Zoom, Thumbnails, Counter, Fullscreen]}
        counter={{ container: { style: { top: "unset", bottom: 0 } } }}
        thumbnails={{ border: 0, gap: 8, imageFit: "cover" }}
        zoom={{ maxZoomPixelRatio: 3, doubleTapDelay: 250 }}
        carousel={{ finite: images.length <= 1 }}
        styles={{ container: { backgroundColor: "rgba(0, 0, 0, 0.92)" } }}
      />
    </div>
  );
}
