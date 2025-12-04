"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, Clock, MapPin, Music, Calendar, Ticket } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Types for program data
interface ProgramEvent {
  id: number;
  date: string;
  day: number;
  time: string;
  artist: string;
  stage: string;
  genre: string | null;
  is_headliner: boolean;
  year: string;
  sort_order: number;
}

interface DayProgram {
  date: string;
  day: number;
  dayName: string;
  events: ProgramEvent[];
}

interface ProgramContentProps {
  events: ProgramEvent[];
}

const stageColors: Record<string, string> = {
  main: "bg-primary text-primary-foreground",
  stage2: "bg-secondary text-secondary-foreground",
  electronic: "bg-purple-600 text-white",
};

export function ProgramContent({ events }: ProgramContentProps) {
  const t = useTranslations("Program");

  // Группируем события по дням
  const groupedByDay = events.reduce((acc, event) => {
    const dayKey = event.day;
    if (!acc[dayKey]) {
      acc[dayKey] = {
        date: event.date,
        day: event.day,
        dayName: `day${event.day}`,
        events: [],
      };
    }
    acc[dayKey].events.push(event);
    return acc;
  }, {} as Record<number, DayProgram>);

  // Сортируем дни и события
  const program = Object.values(groupedByDay)
    .sort((a, b) => a.day - b.day)
    .map((day) => ({
      ...day,
      events: day.events.sort((a, b) => a.sort_order - b.sort_order),
    }));

  const getStageLabel = (stage: string): string => {
    const stageKey = stage === "main" ? "main" : stage === "stage2" ? "stage2" : "electronic";
    return t(`stages.${stageKey}`);
  };

  // Статистика
  const totalDays = program.length;
  const totalPerformances = events.length;
  const uniqueStages = [...new Set(events.map((e) => e.stage))].length;

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
            <Calendar className="h-3 w-3 mr-1" />
            {t("badge")}
          </Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {t("title")}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {t("subtitle")}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-12">
          <div className="text-center p-4 rounded-xl bg-muted/50">
            <div className="text-3xl font-bold text-primary">{totalDays}</div>
            <div className="text-sm text-muted-foreground">{t("stats.days")}</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-muted/50">
            <div className="text-3xl font-bold text-primary">{totalPerformances}</div>
            <div className="text-sm text-muted-foreground">{t("stats.performances")}</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-muted/50">
            <div className="text-3xl font-bold text-primary">{uniqueStages}</div>
            <div className="text-sm text-muted-foreground">{t("stats.stages")}</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-muted/50">
            <div className="text-3xl font-bold text-primary">30+</div>
            <div className="text-sm text-muted-foreground">{t("stats.hours")}</div>
          </div>
        </div>

        {/* Program Tabs */}
        {program.length > 0 ? (
          <Tabs defaultValue="day1" className="max-w-4xl mx-auto">
            <TabsList className="w-full grid grid-cols-3 mb-8 h-auto p-1">
              {program.map((day, index) => (
                <TabsTrigger
                  key={day.dayName}
                  value={day.dayName}
                  className="flex flex-col py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <span className="text-xs opacity-70">{t("day")} {index + 1}</span>
                  <span className="font-semibold">{day.date}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {program.map((day) => (
              <TabsContent key={day.dayName} value={day.dayName} className="mt-0">
                <div className="space-y-4">
                  {day.events.map((event) => (
                    <Card
                      key={event.id}
                      className={`transition-all hover:shadow-md ${
                        event.is_headliner ? "border-primary/50 bg-primary/5" : ""
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          {/* Time */}
                          <div className="flex items-center gap-2 min-w-[80px]">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono font-semibold">{event.time}</span>
                          </div>

                          {/* Artist */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`font-semibold ${event.is_headliner ? "text-lg" : ""}`}>
                                {event.artist}
                              </span>
                              {event.is_headliner && (
                                <Badge variant="default" className="text-xs">
                                  {t("headliner")}
                                </Badge>
                              )}
                            </div>
                            {event.genre && (
                              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                <Music className="h-3 w-3" />
                                <span>{event.genre}</span>
                              </div>
                            )}
                          </div>

                          {/* Stage */}
                          <Badge
                            className={`${stageColors[event.stage] || "bg-muted"} whitespace-nowrap`}
                          >
                            <MapPin className="h-3 w-3 mr-1" />
                            {getStageLabel(event.stage)}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t("noEvents") || "Программа скоро появится"}</p>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-8 mb-12">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary" />
            <span className="text-sm text-muted-foreground">{t("stages.main")}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-secondary" />
            <span className="text-sm text-muted-foreground">{t("stages.stage2")}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-purple-600" />
            <span className="text-sm text-muted-foreground">{t("stages.electronic")}</span>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12 p-8 rounded-2xl bg-muted/50">
          <h3 className="text-xl font-semibold mb-2">{t("ctaTitle")}</h3>
          <p className="text-muted-foreground mb-6">{t("ctaSubtitle")}</p>
          <Button size="lg" asChild>
            <Link href="/tickets">
              <Ticket className="mr-2 h-5 w-5" />
              {t("ctaButton")}
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
