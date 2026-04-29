"use client";

import * as React from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Ticket, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

declare global {
  interface Window {
    YT?: {
      Player: new (
        el: HTMLElement | string,
        opts: Record<string, unknown>
      ) => YTPlayerInstance;
      PlayerState: { PLAYING: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YTPlayerInstance {
  destroy: () => void;
  mute: () => void;
  playVideo: () => void;
}

const YOUTUBE_VIDEO_ID = "2BVoFeiaMbY";

function loadYouTubeApi(): Promise<void> {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve();
      return;
    }
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve();
    };
  });
}

export function HeroSection() {
  const t = useTranslations("Hero");
  const [isPlaying, setIsPlaying] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  React.useEffect(() => {
    let player: YTPlayerInstance | null = null;
    let cancelled = false;

    loadYouTubeApi().then(() => {
      if (cancelled || !containerRef.current || !window.YT) return;
      player = new window.YT.Player(containerRef.current, {
        videoId: YOUTUBE_VIDEO_ID,
        host: "https://www.youtube-nocookie.com",
        playerVars: {
          autoplay: 1,
          mute: 1,
          loop: 1,
          playlist: YOUTUBE_VIDEO_ID,
          controls: 0,
          showinfo: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          iv_load_policy: 3,
          disablekb: 1,
          fs: 0,
          cc_load_policy: 0,
        },
        events: {
          onReady: (e: { target: YTPlayerInstance }) => {
            e.target.mute();
            e.target.playVideo();
          },
          onStateChange: (e: { data: number }) => {
            if (e.data === window.YT?.PlayerState.PLAYING) {
              setIsPlaying(true);
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      try {
        player?.destroy();
      } catch {
        /* iframe already gone */
      }
    };
  }, []);

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      {/* Video Background — YouTube IFrame API: covered by black until state === PLAYING */}
      <div className="absolute inset-0 h-full w-full overflow-hidden pointer-events-none">
        <div
          ref={containerRef}
          className="absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2 scale-[1.35] [&>iframe]:h-full [&>iframe]:w-full [&>iframe]:border-0"
        />
      </div>

      {/* Black mask: stays opaque until YouTube reports PLAYING — hides loader, transient HUD, autoplay-blocked state */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-700 ${
          isPlaying ? "opacity-0" : "opacity-100"
        }`}
        aria-hidden
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white">
        {/* Badge */}
        <Badge
          variant="outline"
          className="mb-6 border-white/30 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm"
        >
          {t("badge")}
        </Badge>

        {/* Main Title */}
        <h1 className="mb-4 text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
          FESTIVALUL LUPILOR
        </h1>

        {/* Year */}
        <div className="mb-6 text-3xl font-light tracking-widest sm:text-4xl md:text-5xl">
          2026
        </div>

        {/* Date */}
        <div className="mb-10 flex items-center gap-3 text-xl font-medium sm:text-2xl md:text-3xl">
          <span>7</span>
          <span className="text-primary">|</span>
          <span>8</span>
          <span className="text-primary">|</span>
          <span>9</span>
          <span className="ml-2">{t("august")}</span>
        </div>

        {/* CTA Buttons */}
        <div className="flex w-full max-w-md flex-col gap-4 sm:w-auto sm:max-w-none sm:flex-row">
          <Button size="lg" asChild className="h-14 w-full text-lg px-10 sm:h-12 sm:w-auto sm:text-base sm:px-8">
            <Link href="/tickets">
              <Ticket className="h-5 w-5" />
              {t("buyTickets")}
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-14 w-full border-white/30 bg-white/10 text-lg px-10 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white sm:h-12 sm:w-auto sm:text-base sm:px-8"
            asChild
          >
            <Link href="/lineup">{t("viewLineup")}</Link>
          </Button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <button
        onClick={scrollToContent}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-white/70 hover:text-white transition-colors"
        aria-label={t("scrollDown")}
      >
        <ChevronDown className="h-8 w-8" />
      </button>
    </section>
  );
}
