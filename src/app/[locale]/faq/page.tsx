import { createPublicClient } from "@/lib/supabase/public";
import { FAQClient } from "./FAQClient";
import { generatePageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export const revalidate = 3600;

export async function generateMetadata({ params }: Props) {
  return generatePageMetadata({ params, page: "faq" });
}

export default async function FAQPage() {
  const supabase = createPublicClient();

  // Fetch FAQ data from Supabase
  const { data: faqData } = await supabase
    .from("faq")
    .select("*")
    .eq("is_active", true)
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true });

  return <FAQClient faqData={faqData ?? []} />;
}
