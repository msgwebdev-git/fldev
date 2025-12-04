import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { NewsEditor } from "../../_components/NewsEditor";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditNewsPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: news } = await supabase
    .from("news")
    .select("*")
    .eq("id", id)
    .single();

  if (!news) {
    notFound();
  }

  return (
    <NewsEditor
      initialData={{
        id: news.id,
        slug: news.slug,
        title_ru: news.title_ru || "",
        title_ro: news.title_ro || "",
        excerpt_ru: news.excerpt_ru || "",
        excerpt_ro: news.excerpt_ro || "",
        content_ru: news.content_ru || "",
        content_ro: news.content_ro || "",
        image: news.image || "",
        date: news.date,
        category: news.category || "",
        published: news.published,
      }}
      isEdit
    />
  );
}
