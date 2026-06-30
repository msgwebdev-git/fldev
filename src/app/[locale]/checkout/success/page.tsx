import { Suspense } from "react";
import { generatePageMetadata } from "@/lib/seo";
import CheckoutSuccessPage from "./SuccessClient";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  return generatePageMetadata({ params, page: "tickets", path: "/checkout/success", noindex: true });
}

// SuccessClient reads useSearchParams(); wrap in Suspense for prerender.
export default function Page() {
  return (
    <Suspense fallback={null}>
      <CheckoutSuccessPage />
    </Suspense>
  );
}
