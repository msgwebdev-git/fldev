import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Props {
  params: Promise<{
    locale: string;
    slug: string;
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

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const supabase = await createClient();

  const { data: news } = await supabase
    .from("news")
    .select("title_ru, title_ro, excerpt_ru, excerpt_ro")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!news) {
    return { title: locale === "ro" ? "Știrea nu a fost găsită" : "Новость не найдена" };
  }

  const title = getLocalizedField(news, "title", locale);
  const description = getLocalizedField(news, "excerpt", locale);

  return {
    title,
    description,
  };
}

export default async function NewsPage({ params }: Props) {
  const { locale, slug } = await params;
  const t = await getTranslations("News");
  const supabase = await createClient();

  const { data: news } = await supabase
    .from("news")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!news) {
    notFound();
  }

  const title = getLocalizedField(news, "title", locale);
  const excerpt = getLocalizedField(news, "excerpt", locale);
  const content = getLocalizedField(news, "content", locale);

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative h-[40vh] md:h-[50vh] lg:h-[60vh]">
        {news.image && (
          <Image
            src={news.image}
            alt={title}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-center gap-3 mb-4">
              {news.category && (
                <Badge className="bg-primary/90">
                  <Tag className="w-3 h-3 mr-1" />
                  {news.category}
                </Badge>
              )}
              <span className="text-white/70 text-sm flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(news.date, locale)}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
              {title}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <article className="container mx-auto max-w-4xl px-6 py-12">
        {excerpt && (
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            {excerpt}
          </p>
        )}

        {content && (
          <div
            className="prose prose-lg max-w-none prose-headings:font-bold prose-p:text-foreground/80 prose-a:text-primary"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}

        {!content && !excerpt && (
          <p className="text-muted-foreground text-center py-12">
            {locale === "ro"
              ? "Conținutul știrii va apărea în curând..."
              : "Содержимое новости скоро появится..."}
          </p>
        )}
      </article>

      {/* Back link */}
      <div className="container mx-auto max-w-4xl px-6 pb-12">
        <Link href="/news">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("backToNews")}
          </Button>
        </Link>
      </div>
    </main>
  );
}
