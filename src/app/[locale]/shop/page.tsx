import { notFound } from "next/navigation";
import { ShopContent } from "./ShopContent";
import {
  getActiveProducts,
  getActivePromotions,
  getMerchCategories,
  getMerchBanner,
  getMerchShopEnabled,
} from "@/lib/data/merch";
import { generatePageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export const revalidate = 300;

export async function generateMetadata({ params }: Props) {
  return generatePageMetadata({ params, page: "shop" });
}

export default async function ShopPage() {
  if (!(await getMerchShopEnabled())) notFound();

  const [products, promotions, categories, banner] = await Promise.all([
    getActiveProducts(),
    getActivePromotions(),
    getMerchCategories(),
    getMerchBanner(),
  ]);
  return (
    <ShopContent products={products} promotions={promotions} categories={categories} banner={banner} />
  );
}
