import { notFound } from "next/navigation";
import { draftMode } from "next/headers";
import { MerchCheckoutClient } from "./MerchCheckoutClient";
import { getMerchShippingSettings, getActivePromotions, getMerchShopEnabled } from "@/lib/data/merch";
import { generatePageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  return generatePageMetadata({ params, page: "shop", path: "/shop/checkout", noindex: true });
}

export default async function MerchCheckoutPage() {
  const { isEnabled: preview } = await draftMode();
  if (!(await getMerchShopEnabled()) && !preview) notFound();

  const [shipping, promotions] = await Promise.all([getMerchShippingSettings(), getActivePromotions()]);
  return <MerchCheckoutClient shipping={shipping} promotions={promotions} />;
}
