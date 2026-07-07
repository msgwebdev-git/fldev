import { Suspense } from "react";
import { generatePageMetadata } from "@/lib/seo";
import MerchFailedPage from "./FailedClient";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  return generatePageMetadata({ params, page: "shop", path: "/shop/checkout/failed", noindex: true });
}

// FailedClient reads useSearchParams(); wrap in Suspense for prerender.
export default function Page() {
  return (
    <Suspense fallback={null}>
      <MerchFailedPage />
    </Suspense>
  );
}
