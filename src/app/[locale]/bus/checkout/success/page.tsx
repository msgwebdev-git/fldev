import { Suspense } from "react";
import { generatePageMetadata } from "@/lib/seo";
import BusSuccessPage from "./SuccessClient";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  return generatePageMetadata({ params, page: "bus", path: "/bus/checkout/success", noindex: true });
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <BusSuccessPage />
    </Suspense>
  );
}
