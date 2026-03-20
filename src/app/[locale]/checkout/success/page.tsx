import { generatePageMetadata } from "@/lib/seo";
import CheckoutSuccessPage from "./SuccessClient";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  return generatePageMetadata({ params, page: "tickets", path: "/checkout/success", noindex: true });
}

export default CheckoutSuccessPage;
