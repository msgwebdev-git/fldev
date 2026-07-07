import { notFound } from "next/navigation";
import { MerchCheckoutClient } from "./MerchCheckoutClient";
import { getMerchShippingSettings, getActivePromotions, getMerchShopEnabled } from "@/lib/data/merch";
import { generatePageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  return generatePageMetadata({ params, page: "shop", path: "/shop/checkout", noindex: true });
}

export default async function MerchCheckoutPage() {
  if (!(await getMerchShopEnabled())) notFound();

  const [shipping, promotions] = await Promise.all([getMerchShippingSettings(), getActivePromotions()]);
  return <MerchCheckoutClient shipping={shipping} promotions={promotions} />;
}
