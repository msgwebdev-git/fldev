import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { MerchProductsTable, type AdminProduct } from "./MerchProductsTable";

export const dynamic = "force-dynamic";

export default async function MerchAdminPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("merch_products")
    .select(
      "id, slug, name_ru, name_ro, category_id, merch_categories(name_ru), price, currency, images, is_active, sort_order, merch_variants(id, size, stock_quantity, is_active)"
    )
    .order("sort_order", { ascending: true });

  const products = (data ?? []) as unknown as AdminProduct[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Товары мерча</h1>
          <p className="text-gray-500 mt-1">Управление каталогом магазина</p>
        </div>
        <Button asChild>
          <Link href="/admin/merch/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Добавить товар
          </Link>
        </Button>
      </div>

      <MerchProductsTable products={products} />
    </div>
  );
}
