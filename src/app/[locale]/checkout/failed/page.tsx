import { Suspense } from "react";
import { generatePageMetadata } from "@/lib/seo";
import CheckoutFailedPage from "./FailedClient";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  return generatePageMetadata({ params, page: "tickets", path: "/checkout/failed", noindex: true });
}

// FailedClient reads useSearchParams(); wrap in Suspense for prerender.
export default function Page() {
  return (
    <Suspense fallback={null}>
      <CheckoutFailedPage />
    </Suspense>
  );
}
