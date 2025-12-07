"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  ArrowLeft,
  Tent,
  Music,
  Palette,
  Utensils,
  TreePine,
  Users,
  Sparkles,
  Camera,
  Heart,
  MapPin,
  Clock,
  LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppCTABlock } from "@/components/AppCTABlock";

interface Activity {
  id: number;
  title: string;
  description: string | null;
  category: string;
  icon: string;
  location: string | null;
  time: string | null;
  is_highlight: boolean;
  year: string;
  sort_order: number;
}

interface ActivitiesContentProps {
  activities: Activity[];
}

const iconMap: Record<string, LucideIcon> = {
  music: Music,
  palette: Palette,
  tent: Tent,
  utensils: Utensils,
  users: Users,
  sparkles: Sparkles,
  camera: Camera,
  heart: Heart,
  treePine: TreePine,
};

const categoryOrder = ["entertainment", "workshops", "relaxation", "food", "family"];

export function ActivitiesContent({ activities }: ActivitiesContentProps) {
  const t = useTranslations("Activities");

  // Группируем активности по категориям
  const activitiesByCategory = activities.reduce((acc, activity) => {
    if (!acc[activity.category]) {
      acc[activity.category] = [];
    }
    acc[activity.category].push(activity);
    return acc;
  }, {} as Record<string, Activity[]>);

  const categories = categoryOrder.filter((key) => activitiesByCategory[key]?.length > 0);

  const totalActivities = activities.length;
  const totalCategories = categories.length;
  const highlightCount = activities.filter((a) => a.is_highlight).length;

  const getIcon = (iconName: string): LucideIcon => {
    return iconMap[iconName] || Sparkles;
  };

  const getCategoryLabel = (category: string): string => {
    return t(`categories.${category}`);
  };

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
            <Sparkles className="h-3 w-3 mr-1" />
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
            <div className="text-3xl font-bold text-primary">{totalActivities}</div>
            <div className="text-sm text-muted-foreground">{t("stats.activities")}</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-muted/50">
            <div className="text-3xl font-bold text-primary">{totalCategories}</div>
            <div className="text-sm text-muted-foreground">{t("stats.categories")}</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-muted/50">
            <div className="text-3xl font-bold text-primary">{highlightCount}</div>
            <div className="text-sm text-muted-foreground">{t("stats.highlights")}</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-muted/50">
            <div className="text-3xl font-bold text-primary">3</div>
            <div className="text-sm text-muted-foreground">{t("stats.days")}</div>
          </div>
        </div>

        {/* Activities Tabs */}
        {categories.length > 0 ? (
          <Tabs defaultValue={categories[0]} className="max-w-4xl mx-auto">
            <TabsList className="w-full flex flex-wrap justify-center gap-2 h-auto p-1 mb-8">
              {categories.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {getCategoryLabel(category)}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category} value={category} className="mt-0">
                <div className="bg-card border rounded-lg divide-y">
                  {(activitiesByCategory[category] || [])
                    .sort((a, b) => a.sort_order - b.sort_order)
                    .map((activity) => {
                      const Icon = getIcon(activity.icon);
                      return (
                        <div
                          key={activity.id}
                          className={`flex items-center gap-3 px-4 py-2.5 ${
                            activity.is_highlight ? "bg-primary/5" : "hover:bg-muted/50"
                          }`}
                        >
                          <Icon className={`h-4 w-4 shrink-0 ${activity.is_highlight ? "text-primary" : "text-muted-foreground"}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`truncate ${activity.is_highlight ? "font-medium" : ""}`}>
                                {activity.title}
                              </span>
                              {activity.is_highlight && (
                                <Badge variant="default" className="text-[10px] px-1.5 py-0 shrink-0">
                                  {t("featured")}
                                </Badge>
                              )}
                            </div>
                            {(activity.location || activity.time) && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                {activity.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {activity.location}
                                  </span>
                                )}
                                {activity.time && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {activity.time}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t("noActivities")}</p>
          </div>
        )}

        {/* App Download CTA */}
        <AppCTABlock namespace="Activities" notificationText="Workshop starts in 10 min!" />
      </div>
    </main>
  );
}
