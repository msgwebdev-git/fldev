"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, Music, Star, Users, Calendar } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Artist {
  id: number;
  name: string;
  image_url: string | null;
  genre: string | null;
  country: string | null;
  is_headliner: boolean;
  day: number;
  stage: string | null;
  year: string;
  sort_order: number;
}

interface LineupContentProps {
  artists: Artist[];
  years: string[];
}

export function LineupContent({ artists, years }: LineupContentProps) {
  const t = useTranslations("Lineup");
  const searchParams = useSearchParams();
  const yearParam = searchParams.get("year");

  const [selectedYear, setSelectedYear] = React.useState(
    yearParam && years.includes(yearParam) ? yearParam : years[0] || "2025"
  );

  const currentArtists = React.useMemo(
    () => artists.filter((a) => a.year === selectedYear),
    [artists, selectedYear]
  );

  const headliners = currentArtists.filter((a) => a.is_headliner);
  const otherArtists = currentArtists.filter((a) => !a.is_headliner);

  // Получаем уникальные сцены
  const stages = [...new Set(currentArtists.map((a) => a.stage).filter(Boolean))];

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
            <Music className="h-3 w-3 mr-1" />
            {t("badge")}
          </Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {t("pageTitle")}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {t("pageSubtitle")}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-3xl mx-auto">
          <div className="text-center p-4 rounded-xl bg-muted/50">
            <div className="text-3xl font-bold text-primary">{headliners.length}</div>
            <div className="text-sm text-muted-foreground">{t("stats.headliners")}</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-muted/50">
            <div className="text-3xl font-bold text-primary">{otherArtists.length}</div>
            <div className="text-sm text-muted-foreground">{t("stats.artists")}</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-muted/50">
            <div className="text-3xl font-bold text-primary">{stages.length || 4}</div>
            <div className="text-sm text-muted-foreground">{t("stats.stages")}</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-muted/50">
            <div className="text-3xl font-bold text-primary">3</div>
            <div className="text-sm text-muted-foreground">{t("stats.days")}</div>
          </div>
        </div>

        {/* Year Tabs */}
        <Tabs value={selectedYear} onValueChange={setSelectedYear} className="w-full">
          <div className="flex justify-center mb-8">
            <ScrollArea className="w-full max-w-md">
              <TabsList className="inline-flex h-auto p-1 w-full justify-center">
                {years.map((year) => (
                  <TabsTrigger
                    key={year}
                    value={year}
                    className="px-6 py-2.5 text-sm font-medium"
                  >
                    {year}
                  </TabsTrigger>
                ))}
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>

          {years.map((year) => {
            const yearArtists = artists.filter((a) => a.year === year);
            const yearHeadliners = yearArtists.filter((a) => a.is_headliner);

            return (
              <TabsContent key={year} value={year} className="mt-0">
                {/* Headliners Section */}
                {yearHeadliners.length > 0 && (
                  <div className="mb-12">
                    <div className="flex items-center gap-2 mb-6">
                      <Star className="h-5 w-5 text-primary" />
                      <h2 className="text-2xl font-bold">{t("headliners")}</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {yearHeadliners.map((artist) => (
                        <Card
                          key={artist.id}
                          className={cn(
                            "group overflow-hidden border-2 transition-all duration-300 hover:shadow-xl p-0 gap-0",
                            "hover:border-primary/50"
                          )}
                        >
                          <div className="relative aspect-square overflow-hidden">
                            {artist.image_url ? (
                              <Image
                                src={artist.image_url}
                                alt={artist.name}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                sizes="(max-width: 768px) 100vw, 33vw"
                              />
                            ) : (
                              <div className="w-full h-full bg-muted flex items-center justify-center">
                                <Music className="w-16 h-16 text-muted-foreground" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-6">
                              <Badge className="mb-2 bg-primary/90">
                                {t("day")} {artist.day}
                              </Badge>
                              <h3 className="text-2xl font-bold text-white mb-1">
                                {artist.name}
                              </h3>
                              {artist.genre && (
                                <p className="text-white/80 text-sm">{artist.genre}</p>
                              )}
                              {artist.stage && (
                                <p className="text-white/60 text-xs mt-1">{artist.stage}</p>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* All Artists by Day */}
                {[1, 2, 3].map((day) => {
                  const dayArtists = yearArtists.filter(
                    (a) => a.day === day && !a.is_headliner
                  );
                  if (dayArtists.length === 0) return null;

                  return (
                    <div key={day} className="mb-10">
                      <div className="flex items-center gap-2 mb-6">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <h2 className="text-xl font-semibold">
                          {t("day")} {day}
                        </h2>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {dayArtists.map((artist) => (
                          <Card
                            key={artist.id}
                            className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 p-0 gap-0"
                          >
                            <div className="relative aspect-square overflow-hidden">
                              {artist.image_url ? (
                                <Image
                                  src={artist.image_url}
                                  alt={artist.name}
                                  fill
                                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 16vw"
                                />
                              ) : (
                                <div className="w-full h-full bg-muted flex items-center justify-center">
                                  <Music className="w-8 h-8 text-muted-foreground" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                              <div className="absolute bottom-0 left-0 right-0 p-3">
                                <h3 className="text-sm font-semibold text-white truncate">
                                  {artist.name}
                                </h3>
                                {artist.genre && (
                                  <p className="text-white/70 text-xs truncate">
                                    {artist.genre}
                                  </p>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Artist count */}
                <div className="text-center mt-8 text-muted-foreground">
                  <Users className="inline-block h-4 w-4 mr-2" />
                  {yearArtists.length} {t("totalArtists")}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </main>
  );
}
