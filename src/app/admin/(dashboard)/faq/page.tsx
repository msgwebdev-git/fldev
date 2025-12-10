import { createAdminClient } from "@/lib/supabase/admin";
import { FAQTable } from "./FAQTable";
import { AddFAQButton } from "./AddFAQButton";

export default async function FAQAdminPage() {
  const supabase = createAdminClient();

  const { data: faqItems } = await supabase
    .from("faq")
    .select("*")
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">FAQ - Часто задаваемые вопросы</h1>
          <p className="text-gray-500 mt-1">Управление вопросами и ответами</p>
        </div>
        <AddFAQButton />
      </div>

      <FAQTable faqItems={faqItems ?? []} />
    </div>
  );
}
