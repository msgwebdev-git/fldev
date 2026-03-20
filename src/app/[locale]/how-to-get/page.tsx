import { generatePageMetadata } from "@/lib/seo";
import HowToGetPage from "./HowToGetClient";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  return generatePageMetadata({ params, page: "howToGet", path: "/how-to-get" });
}

export default HowToGetPage;
