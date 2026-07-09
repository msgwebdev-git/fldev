import { notFound } from "next/navigation";
import { draftMode } from "next/headers";
import { ShopContent } from "./ShopContent";
import {
  getActiveProducts,
  getActivePromotions,
  getMerchCategories,
  getMerchBanner,
  getMerchShopEnabled,
} from "@/lib/data/merch";
import { generatePageMetadata } from "@/lib/seo";
import { PreviewBanner } from "@/components/admin/PreviewBanner";

type Props = { params: Promise<{ locale: string }> };

export const revalidate = 300;

export async function generateMetadata({ params }: Props) {
  return generatePageMetadata({ params, page: "shop" });
}

export default async function ShopPage() {
  // Draft Mode = admin preview of the hidden shop (see /api/admin/preview)
  const { isEnabled: preview } = await draftMode();
  const enabled = await getMerchShopEnabled();
  if (!enabled && !preview) notFound();

  const [products, promotions, categories, banner] = await Promise.all([
    getActiveProducts(),
    getActivePromotions(),
    getMerchCategories(),
    getMerchBanner(),
  ]);
  return (
    <>
      {preview && !enabled && <PreviewBanner />}
      <ShopContent products={products} promotions={promotions} categories={categories} banner={banner} />
    </>
  );
}
