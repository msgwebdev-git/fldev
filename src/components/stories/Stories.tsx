"use client";

import * as React from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { Film, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { StoryViewer } from "./StoryViewer";
import type { StoryData } from "@/lib/stories-utils";

const SEEN_KEY = "fl-stories-seen";

export function Stories({ stories }: { stories: StoryData[] }) {
  const locale = useLocale();
  const isRu = locale === "ru";
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);
  const [seen, setSeen] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(SEEN_KEY);
      if (raw) setSeen(new Set(JSON.parse(raw)));
    } catch {
      // ignore
    }
  }, []);

  const markSeen = React.useCallback((id: string) => {
    setSeen((prev) => {
      if (prev.has(id)) return prev;
      const nextSet = new Set(prev);
      nextSet.add(id);
      try {
        localStorage.setItem(SEEN_KEY, JSON.stringify([...nextSet]));
      } catch {
        // ignore
      }
      return nextSet;
    });
  }, []);

  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const [canLeft, setCanLeft] = React.useState(false);
  const [canRight, setCanRight] = React.useState(false);
  const [overflowing, setOverflowing] = React.useState(false);

  const updateArrows = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
    setOverflowing(el.scrollWidth - el.clientWidth > 8);
  }, []);

  React.useEffect(() => {
    updateArrows();
    window.addEventListener("resize", updateArrows);
    return () => window.removeEventListener("resize", updateArrows);
  }, [updateArrows, stories.length]);

  const scrollByDir = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * scrollRef.current.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <>
      <div className="relative">
        {canLeft && (
          <button
            aria-label="scroll left"
            onClick={() => scrollByDir(-1)}
            className="absolute left-1.5 top-[34px] z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/95 shadow-md backdrop-blur transition hover:bg-background md:top-[48px] md:flex"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        {canRight && (
          <button
            aria-label="scroll right"
            onClick={() => scrollByDir(1)}
            className="absolute right-1.5 top-[34px] z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/95 shadow-md backdrop-blur transition hover:bg-background md:top-[48px] md:flex"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
        <div
          ref={scrollRef}
          onScroll={updateArrows}
          className={`flex gap-4 overflow-x-auto px-5 md:gap-6 md:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
            overflowing ? "" : "justify-center"
          }`}
        >
          {stories.map((story, i) => {
          const cover = story.coverUrl;
          const isSeen = seen.has(story.id);
          return (
            <button
              key={story.id}
              onClick={() => setOpenIndex(i)}
              className="group flex w-[80px] flex-shrink-0 flex-col items-center gap-2.5 md:w-[112px]"
            >
              <span className="relative">
                <span
                  className={`block rounded-full p-[3px] transition-all duration-300 group-hover:brightness-105 ${
                    isSeen
                      ? "bg-muted-foreground/25 group-hover:bg-muted-foreground/40"
                      : "bg-[conic-gradient(from_140deg,var(--primary),#f59e0b,#ef4444,#f59e0b,var(--primary))]"
                  }`}
                >
                  <span className="block rounded-full bg-background p-[3px]">
                    <span className="relative flex h-[68px] w-[68px] items-center justify-center overflow-hidden rounded-full bg-muted text-muted-foreground md:h-[96px] md:w-[96px]">
                      {cover ? (
                        <Image
                          src={cover}
                          alt={isRu ? story.titleRu : story.titleRo}
                          fill
                          sizes="(min-width: 768px) 96px, 68px"
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <Film className="h-7 w-7" />
                      )}
                    </span>
                  </span>
                </span>

                {/* video indicator */}
                <span className="absolute bottom-0.5 right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md ring-2 ring-background transition-transform duration-300 group-hover:scale-110 md:h-7 md:w-7">
                  <Play className="h-3 w-3 fill-current md:h-3.5 md:w-3.5" />
                </span>
              </span>

              <span className="line-clamp-2 w-full text-center text-xs font-medium leading-tight text-foreground/75 transition-colors group-hover:text-primary md:text-[13px]">
                {isRu ? story.titleRu : story.titleRo}
              </span>
            </button>
          );
        })}
        </div>
      </div>

      {openIndex !== null && (
        <StoryViewer
          stories={stories}
          initialIndex={openIndex}
          onClose={() => setOpenIndex(null)}
          onSeen={markSeen}
        />
      )}
    </>
  );
}
