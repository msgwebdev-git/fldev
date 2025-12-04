"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Newspaper, ArrowRight, Calendar } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

interface NewsItem {
  id: number;
  slug: string;
  title?: string;
  title_ru?: string;
  title_ro?: string;
  excerpt?: string;
  excerpt_ru?: string;
  excerpt_ro?: string;
  image: string;
  date: string;
  category: string;
}

// Helper to get localized content with fallback
function getLocalizedField(
  item: NewsItem,
  field: "title" | "excerpt",
  locale: string
): string {
  const localizedKey = `${field}_${locale}` as keyof NewsItem;
  const fallbackKey = `${field}_${locale === "ro" ? "ru" : "ro"}` as keyof NewsItem;
  return (item[localizedKey] as string) || (item[fallbackKey] as string) || (item[field] as string) || "";
}

// Fallback данные
const fallbackNews: NewsItem[] = [
  {
    id: 1,
    slug: "lineup-2025-announced",
    title_ru: "Line-up 2025 объявлен!",
    title_ro: "Line-up 2025 anunțat!",
    excerpt_ru: "Мы рады представить полный состав артистов на фестиваль 2025 года. Более 50 исполнителей на 4 сценах.",
    excerpt_ro: "Suntem bucuroși să prezentăm line-up-ul complet pentru festivalul 2025. Peste 50 de artiști pe 4 scene.",
    image: "https://picsum.photos/seed/news1/800/500",
    date: "2025-01-15",
    category: "Анонс",
  },
  {
    id: 2,
    slug: "early-bird-tickets",
    title_ru: "Старт продаж билетов Early Bird",
    title_ro: "Începe vânzarea biletelor Early Bird",
    excerpt_ru: "Успейте приобрести билеты по специальной цене. Количество ограничено!",
    excerpt_ro: "Cumpărați bilete la preț special. Cantitatea este limitată!",
    image: "https://picsum.photos/seed/news2/800/500",
    date: "2025-01-10",
    category: "Билеты",
  },
  {
    id: 3,
    slug: "new-camping-zone",
    title_ru: "Новая зона кемпинга Premium",
    title_ro: "Noua zonă de camping Premium",
    excerpt_ru: "В этом году мы открываем новую премиум зону кемпинга с улучшенными удобствами.",
    excerpt_ro: "Anul acesta deschidem o nouă zonă de camping premium cu facilități îmbunătățite.",
    image: "https://picsum.photos/seed/news3/800/500",
    date: "2025-01-05",
    category: "Инфраструктура",
  },
];

function formatDate(dateString: string, locale: string = "ru"): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale === "ro" ? "ro-RO" : "ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function NewsSection() {
  const t = useTranslations("News");
  const locale = useLocale();
  const [news, setNews] = React.useState<NewsItem[]>(fallbackNews);

  React.useEffect(() => {
    async function fetchNews() {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("published", true)
        .order("date", { ascending: false })
        .limit(3);

      if (!error && data && data.length > 0) {
        setNews(data as NewsItem[]);
      }
    }

    fetchNews();
  }, []);

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <Newspaper className="h-3 w-3 mr-1" />
            {t("badge")}
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {t("title")}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {t("subtitle")}
          </p>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item) => {
            const title = getLocalizedField(item, "title", locale);
            const excerpt = getLocalizedField(item, "excerpt", locale);

            return (
              <Card
                key={item.id}
                className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300"
              >
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={item.image}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  {item.category && (
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-primary/90 backdrop-blur-sm">
                        {item.category}
                      </Badge>
                    </div>
                  )}
                </div>

                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(item.date, locale)}</span>
                  </div>
                  <CardTitle className="text-xl line-clamp-2 group-hover:text-primary transition-colors">
                    {title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="pb-4">
                  <CardDescription className="line-clamp-3 text-base">
                    {excerpt}
                  </CardDescription>
                </CardContent>

                <CardFooter>
                  <Button
                    variant="ghost"
                    className="p-0 h-auto font-medium text-primary hover:text-primary/80 hover:bg-transparent"
                    asChild
                  >
                    <Link href={`/news/${item.slug}`}>
                      {t("readMore")}
                      <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="text-center mt-10">
          <Button variant="outline" size="lg" className="px-8" asChild>
            <Link href="/news">
              {t("viewAll")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
