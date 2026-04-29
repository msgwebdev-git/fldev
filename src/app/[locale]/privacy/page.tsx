import { generatePageMetadata } from "@/lib/seo";
import PrivacyPage from "./PrivacyClient";

type Props = { params: Promise<{ locale: string }> };

export const dynamic = "force-static";

export async function generateMetadata({ params }: Props) {
  return generatePageMetadata({ params, page: "privacy" });
}

export default PrivacyPage;
