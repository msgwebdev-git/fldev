import { generatePageMetadata } from "@/lib/seo";
import CheckoutPage from "./CheckoutClient";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  return generatePageMetadata({ params, page: "tickets", path: "/checkout", noindex: true });
}

export default CheckoutPage;
