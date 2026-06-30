import { Suspense } from "react";
import { generatePageMetadata } from "@/lib/seo";
import B2BThankYouPage from "./ThankYouClient";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  return generatePageMetadata({ params, page: "b2b", path: "/b2b/thank-you", noindex: true });
}

// ThankYouClient reads useSearchParams(); wrap in Suspense for prerender.
export default function Page() {
  return (
    <Suspense fallback={null}>
      <B2BThankYouPage />
    </Suspense>
  );
}
