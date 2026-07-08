import { Suspense } from "react";
import { generatePageMetadata } from "@/lib/seo";
import BusFailedPage from "./FailedClient";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  return generatePageMetadata({ params, page: "bus", path: "/bus/checkout/failed", noindex: true });
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <BusFailedPage />
    </Suspense>
  );
}
