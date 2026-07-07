import { Suspense } from "react";
import { generatePageMetadata } from "@/lib/seo";
import MerchSuccessPage from "./SuccessClient";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  return generatePageMetadata({ params, page: "shop", path: "/shop/checkout/success", noindex: true });
}

// SuccessClient reads useSearchParams(); wrap in Suspense for prerender.
export default function Page() {
  return (
    <Suspense fallback={null}>
      <MerchSuccessPage />
    </Suspense>
  );
}
