import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CategoriesTable } from "./CategoriesTable";
import { AddCategoryButton } from "./AddCategoryButton";

export default async function PartnerCategoriesAdminPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("partner_categories")
    .select("*")
    .order("sort_order", { ascending: true });

  const { data: partners } = await supabase
    .from("partners")
    .select("category");

  const usageMap: Record<string, number> = {};
  (partners ?? []).forEach((p) => {
    usageMap[p.category] = (usageMap[p.category] ?? 0) + 1;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2 -ml-3">
            <Link href="/admin/partners">
              <ArrowLeft className="w-4 h-4 mr-1" />
              К партнёрам
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Категории партнёров</h1>
          <p className="text-gray-500 mt-1">
            Управление категориями: добавление, переименование, удаление, порядок отображения
          </p>
        </div>
        <AddCategoryButton />
      </div>

      <CategoriesTable categories={categories ?? []} usageMap={usageMap} />
    </div>
  );
}
