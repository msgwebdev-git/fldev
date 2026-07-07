import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MerchProductEditor } from "@/components/admin/MerchProductEditor";
import { getMerchCategories } from "@/lib/data/merch";
import type { ProductInput } from "@/app/admin/(dashboard)/merch/actions";

type Props = { params: Promise<{ id: string }> };

interface VariantRow {
  id: string;
  size: string;
  stock_quantity: number | null;
  price_modifier: number | null;
  sort_order: number | null;
  is_active: boolean | null;
}

export default async function EditMerchProductPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data }, categories] = await Promise.all([
    supabase.from("merch_products").select("*, merch_variants(*)").eq("id", id).maybeSingle(),
    getMerchCategories(),
  ]);

  if (!data) notFound();

  const variants = ((data.merch_variants as VariantRow[]) ?? [])
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((v) => ({
      id: v.id,
      size: v.size,
      stockQuantity: v.stock_quantity ?? 0,
      priceModifier: v.price_modifier ? Number(v.price_modifier) : 0,
      sortOrder: v.sort_order ?? 0,
      isActive: v.is_active !== false,
    }));

  const initial: ProductInput = {
    id: data.id,
    slug: data.slug,
    nameRo: data.name_ro,
    nameRu: data.name_ru,
    descriptionRo: data.description_ro ?? "",
    descriptionRu: data.description_ru ?? "",
    categoryId: data.category_id ?? null,
    colorRo: data.color_ro ?? "",
    colorRu: data.color_ru ?? "",
    colorHex: data.color_hex ?? "",
    price: Number(data.price),
    originalPrice: data.original_price ? Number(data.original_price) : null,
    currency: data.currency ?? "MDL",
    images: Array.isArray(data.images) ? data.images : [],
    sizeChartRo: data.size_chart_ro ?? "",
    sizeChartRu: data.size_chart_ru ?? "",
    maxPerOrder: data.max_per_order ?? 10,
    isActive: data.is_active !== false,
    sortOrder: data.sort_order ?? 0,
    variants,
  };

  return <MerchProductEditor categories={categories} initial={initial} isEdit />;
}
