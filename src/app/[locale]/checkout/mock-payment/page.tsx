import { generatePageMetadata } from "@/lib/seo";
import MockPaymentPage from "./MockPaymentClient";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  return generatePageMetadata({ params, page: "tickets", path: "/checkout/mock-payment", noindex: true });
}

export default MockPaymentPage;
