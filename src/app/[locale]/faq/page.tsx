import { createClient } from "@/lib/supabase/server";
import { FAQClient } from "./FAQClient";

export default async function FAQPage() {
  const supabase = await createClient();

  // Fetch FAQ data from Supabase
  const { data: faqData } = await supabase
    .from("faq")
    .select("*")
    .eq("is_active", true)
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true });

  return <FAQClient faqData={faqData ?? []} />;
}
