import { createClient } from "@/lib/supabase/server";
import { CategoriesManager, type AdminCategory } from "./CategoriesManager";

export const dynamic = "force-dynamic";

export default async function MerchCategoriesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("merch_categories")
    .select("id, slug, name_ru, name_ro, sort_order, is_active")
    .order("sort_order", { ascending: true });

  const categories = (data ?? []) as AdminCategory[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Категории мерча</h1>
        <p className="text-gray-500 mt-1">Справочник категорий товаров</p>
      </div>
      <CategoriesManager categories={categories} />
    </div>
  );
}
