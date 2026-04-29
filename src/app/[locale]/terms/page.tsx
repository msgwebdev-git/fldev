import { generatePageMetadata } from "@/lib/seo";
import TermsPage from "./TermsClient";

type Props = { params: Promise<{ locale: string }> };

export const dynamic = "force-static";

export async function generateMetadata({ params }: Props) {
  return generatePageMetadata({ params, page: "terms" });
}

export default TermsPage;
