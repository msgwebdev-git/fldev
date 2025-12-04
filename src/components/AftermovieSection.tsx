"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Play, Youtube } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface AftermovieData {
  year: string;
  videoId: string;
}

interface AftermovieRow {
  id: number;
  year: string;
  video_id: string;
}

// Fallback данные на случай ошибки загрузки
const fallbackAftermovies: AftermovieData[] = [
  { year: "2025", videoId: "QL3CrTaQBnc" },
  { year: "2024", videoId: "HnSlVLfBt_8" },
  { year: "2023", videoId: "R9OhoQ9g_P4" },
  { year: "2022", videoId: "kdMNTVCGH5c" },
  { year: "2021", videoId: "99E9_i6Lw98" },
];

export function AftermovieSection() {
  const t = useTranslations("Aftermovie");
  const [aftermovies, setAftermovies] = React.useState<AftermovieData[]>(fallbackAftermovies);
  const [selectedVideo, setSelectedVideo] = React.useState<AftermovieData>(fallbackAftermovies[0]);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchAftermovies() {
      const { data, error } = await supabase
        .from("aftermovies")
        .select("*")
        .order("year", { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped = (data as AftermovieRow[]).map((row) => ({
          year: row.year,
          videoId: row.video_id,
        }));
        setAftermovies(mapped);
        setSelectedVideo(mapped[0]);
      }
    }

    fetchAftermovies();
  }, []);

  const thumbnailUrl = `https://img.youtube.com/vi/${selectedVideo.videoId}/maxresdefault.jpg`;

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handleSelectVideo = (video: AftermovieData) => {
    if (video.videoId !== selectedVideo.videoId) {
      setSelectedVideo(video);
      setIsPlaying(false);
      setIsLoading(true);
    }
  };

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-black text-white overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <Badge
            variant="outline"
            className="mb-4 border-primary/50 text-primary"
          >
            <Youtube className="h-3 w-3 mr-1" />
            {t("badge")}
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            Aftermovie {selectedVideo.year}
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto text-base sm:text-lg px-2">
            {t("subtitle")}
          </p>
        </div>

        {/* Video Container */}
        <div className="max-w-5xl mx-auto">
          <div className="relative aspect-video rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 ring-1 ring-white/10">
            {!isPlaying ? (
              <>
                {/* Thumbnail with Play Button */}
                <div className="absolute inset-0 bg-black">
                  {isLoading && (
                    <Skeleton className="absolute inset-0 bg-white/10" />
                  )}
                  <Image
                    src={thumbnailUrl}
                    alt={`Aftermovie ${selectedVideo.year}`}
                    fill
                    className={cn(
                      "object-cover transition-opacity duration-300",
                      isLoading ? "opacity-0" : "opacity-100"
                    )}
                    onLoad={() => setIsLoading(false)}
                    priority
                  />
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Play Button */}
                <button
                  onClick={handlePlay}
                  className="absolute inset-0 flex items-center justify-center group cursor-pointer"
                  aria-label={t("playVideo")}
                >
                  <div className="relative">
                    {/* Pulse Animation */}
                    <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
                    <div className="relative flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/50 transition-transform duration-300 group-hover:scale-110">
                      <Play className="h-8 w-8 md:h-10 md:w-10 ml-1" fill="currentColor" />
                    </div>
                  </div>
                </button>

                {/* Bottom Info */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-0.5 sm:mb-1">
                        Festivalul Lupilor {selectedVideo.year}
                      </h3>
                      <p className="text-white/60 text-xs sm:text-sm md:text-base">
                        {t("officialAftermovie")}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="hidden md:flex bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white"
                      onClick={handlePlay}
                    >
                      <Play className="h-4 w-4" />
                      {t("watchNow")}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              /* YouTube Embed */
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1&rel=0&modestbranding=1`}
                title={`Aftermovie ${selectedVideo.year}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            )}
          </div>

          {/* Year Gallery */}
          <div className="mt-4 sm:mt-6 flex justify-start sm:justify-center gap-2 sm:gap-3 overflow-x-auto p-2 sm:p-1 sm:flex-wrap scrollbar-hide">
            {aftermovies.map((video) => (
              <button
                key={video.year}
                onClick={() => handleSelectVideo(video)}
                className={cn(
                  "group relative overflow-hidden rounded-lg transition-all duration-300 flex-shrink-0",
                  selectedVideo.videoId === video.videoId
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-black"
                    : "opacity-60 hover:opacity-100"
                )}
              >
                <div className="relative w-24 h-16 sm:w-32 sm:h-20 md:w-40 md:h-24">
                  <Image
                    src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`}
                    alt={`Aftermovie ${video.year}`}
                    fill
                    className="object-cover"
                  />
                  {/* Overlay */}
                  <div className={cn(
                    "absolute inset-0 flex items-center justify-center transition-all",
                    selectedVideo.videoId === video.videoId
                      ? "bg-primary/20"
                      : "bg-black/40 group-hover:bg-black/20"
                  )}>
                    <span className="font-bold text-lg text-white drop-shadow-lg">
                      {video.year}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-4xl mx-auto mt-8 sm:mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {[
            { value: "15K+", label: t("stats.visitors") },
            { value: "50+", label: t("stats.artists") },
            { value: "3", label: t("stats.days") },
            { value: "4", label: t("stats.stages") },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-0.5 sm:mb-1">
                {stat.value}
              </div>
              <div className="text-white/60 text-xs sm:text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
