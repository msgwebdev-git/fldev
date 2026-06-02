import { createPublicClient } from "@/lib/supabase/public";
import { FAQClient } from "./FAQClient";
import { generatePageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { buildFaqSchema } from "@/lib/schema";

type Props = { params: Promise<{ locale: string }> };

export const revalidate = 3600;

export async function generateMetadata({ params }: Props) {
  return generatePageMetadata({ params, page: "faq" });
}

export default async function FAQPage({ params }: Props) {
  const { locale } = await params;
  const supabase = createPublicClient();

  // Fetch FAQ data from Supabase
  const { data: faqData } = await supabase
    .from("faq")
    .select("*")
    .eq("is_active", true)
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true });

  const items = (faqData ?? []).map((f) => ({
    question: locale === "ru" ? f.question_ru : f.question_ro,
    answer: locale === "ru" ? f.answer_ru : f.answer_ro,
  }));
  const faqSchema = buildFaqSchema(items);

  return (
    <>
      {faqSchema && <JsonLd data={faqSchema} />}
      <FAQClient faqData={faqData ?? []} />
    </>
  );
}
