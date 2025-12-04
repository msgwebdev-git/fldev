import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Calendar, ArrowRight, Newspaper } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Props {
  params: Promise<{
    locale: string;
  }>;
}

function formatDate(dateString: string, locale: string = "ru"): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale === "ro" ? "ro-RO" : "ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Helper to get localized content with fallback
function getLocalizedField(
  news: Record<string, unknown>,
  field: string,
  locale: string
): string {
  const localizedField = `${field}_${locale}`;
  const fallbackField = `${field}_${locale === "ro" ? "ru" : "ro"}`;
  // Also check old column name without locale suffix as fallback
  const oldField = field;
  return (news[localizedField] as string) || (news[fallbackField] as string) || (news[oldField] as string) || "";
}

export async function generateMetadata() {
  const t = await getTranslations("News");
  return {
    title: t("pageTitle"),
    description: t("pageDescription"),
  };
}

export default async function NewsListPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("News");
  const supabase = await createClient();

  const { data: news } = await supabase
    .from("news")
    .select("*")
    .eq("published", true)
    .order("date", { ascending: false });

  return (
    <main className="min-h-screen bg-background py-12 md:py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <Newspaper className="h-3 w-3 mr-1" />
            {t("badge")}
          </Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {t("pageTitle")}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {t("pageDescription")}
          </p>
        </div>

        {/* News Grid */}
        {news && news.length > 0 ? (
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
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    )}
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
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {locale === "ro" ? "Nu există știri încă" : "Новостей пока нет"}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
