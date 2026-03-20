import { generatePageMetadata } from "@/lib/seo";
import TermsPage from "./TermsClient";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  return generatePageMetadata({ params, page: "terms" });
}

export default TermsPage;
