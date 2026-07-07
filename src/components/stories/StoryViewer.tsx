"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { X, Volume2, VolumeX, ChevronLeft, ChevronRight, Play, Loader2, ArrowRight } from "lucide-react";
import type { StoryData } from "@/lib/stories-utils";

interface StoryViewerProps {
  stories: StoryData[];
  initialIndex: number;
  onClose: () => void;
  onSeen: (id: string) => void;
}

export function StoryViewer({ stories, initialIndex, onClose, onSeen }: StoryViewerProps) {
  const locale = useLocale();
  const isRu = locale === "ru";
  const [current, setCurrent] = React.useState(initialIndex);
  const [progress, setProgress] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const [muted, setMuted] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [mounted, setMounted] = React.useState(false);

  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const currentRef = React.useRef(current);
  const mutedRef = React.useRef(muted);
  currentRef.current = current;
  mutedRef.current = muted;

  const story = stories[current];

  const goTo = React.useCallback(
    (i: number) => {
      if (i < 0) {
        setCurrent(0);
        return;
      }
      if (i >= stories.length) {
        onClose();
        return;
      }
      setProgress(0);
      setLoading(true);
      setPaused(false);
      setCurrent(i);
    },
    [stories.length, onClose]
  );

  const next = React.useCallback(() => goTo(currentRef.current + 1), [goTo]);
  const prev = React.useCallback(() => goTo(currentRef.current - 1), [goTo]);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (story) onSeen(story.id);
  }, [story, onSeen]);

  // Lock body scroll while open
  React.useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const togglePause = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPaused(false);
    } else {
      v.pause();
      setPaused(true);
    }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    const nextMuted = !muted;
    setMuted(nextMuted);
    if (v) v.muted = nextMuted;
  };

  // Keyboard controls
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === " ") {
        e.preventDefault();
        togglePause();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [next, prev, onClose]);

  // Swipe-down to close
  const touchStartY = React.useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current == null) return;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (dy > 90) onClose();
    touchStartY.current = null;
  };

  if (!mounted || !story) return null;

  const ctaLabel = isRu ? story.ctaLabelRu : story.ctaLabelRo;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* 9:16 stage */}
      <div className="relative h-full max-h-[100dvh] w-full sm:h-[92dvh] sm:w-auto sm:aspect-[9/16]">
        <div className="relative flex h-full w-full flex-col overflow-hidden bg-black sm:rounded-2xl">
          {/* Blurred backdrop fills the letterbox bars for non-9:16 videos */}
          {story.coverUrl && (
            <div
              className="pointer-events-none absolute inset-0 scale-110 bg-cover bg-center blur-2xl brightness-[0.45]"
              style={{ backgroundImage: `url(${story.coverUrl})` }}
            />
          )}

          {/* Video — contain shows any aspect fully; 9:16 fills, 16:9 letterboxes */}
          <video
            key={story.id}
            ref={(el) => {
              videoRef.current = el;
              if (!el) return;
              // Try to start WITH sound (allowed because a story was opened by a
              // click). If the browser blocks unmuted autoplay, fall back to muted.
              el.muted = mutedRef.current;
              el.play?.().catch(() => {
                el.muted = true;
                setMuted(true);
                el.play?.().catch(() => {});
              });
            }}
            src={story.videoUrl}
            poster={story.coverUrl}
            playsInline
            preload="auto"
            className="absolute inset-0 h-full w-full object-contain"
            onTimeUpdate={(e) => {
              const v = e.currentTarget;
              if (v.duration > 0) setProgress(Math.min(100, (v.currentTime / v.duration) * 100));
            }}
            onWaiting={() => setLoading(true)}
            onPlaying={() => setLoading(false)}
            onCanPlay={() => setLoading(false)}
            onEnded={next}
          />

          {/* subtle top/bottom scrims for legibility */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-28 bg-gradient-to-b from-black/60 to-transparent" />

          {/* Progress bars */}
          <div className="absolute left-0 right-0 top-0 z-20 flex gap-1 px-3 pt-3">
            {stories.map((s, i) => (
              <div key={s.id} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30">
                <div
                  className="h-full bg-white transition-[width] duration-100 ease-linear"
                  style={{ width: i < current ? "100%" : i === current ? `${progress}%` : "0%" }}
                />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-4 pb-2 pt-6">
            <span className="line-clamp-1 max-w-[70%] text-sm font-semibold text-white drop-shadow">
              {isRu ? story.titleRu : story.titleRo}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={toggleMute} aria-label="sound" className="flex h-9 w-9 items-center justify-center rounded-full text-white/90 hover:bg-white/10">
                {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
              <button onClick={onClose} aria-label="close" className="flex h-9 w-9 items-center justify-center rounded-full text-white/90 hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Loading / pause indicators */}
          {loading && !paused && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-white/80" />
            </div>
          )}
          {paused && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/40">
                <Play className="h-8 w-8 text-white" />
              </div>
            </div>
          )}

          {/* Tap zones */}
          <button aria-label="prev" onClick={prev} className="absolute bottom-20 left-0 top-16 z-20 w-1/3" />
          <button aria-label="pause" onClick={togglePause} className="absolute bottom-20 left-1/3 top-16 z-20 w-1/3" />
          <button aria-label="next" onClick={next} className="absolute bottom-20 right-0 top-16 z-20 w-1/3" />

          {/* CTA */}
          {ctaLabel && story.ctaHref && (
            <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center px-6">
              <Link
                href={story.ctaHref}
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black shadow-lg transition-transform hover:scale-[1.02]"
              >
                {ctaLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Desktop side arrows */}
      <button
        onClick={prev}
        aria-label="prev"
        className="absolute left-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:flex"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={next}
        aria-label="next"
        className="absolute right-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:flex"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    </div>,
    document.body
  );
}
