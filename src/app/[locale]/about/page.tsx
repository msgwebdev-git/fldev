import { generatePageMetadata } from "@/lib/seo";
import AboutPage from "./AboutClient";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  return generatePageMetadata({ params, page: "about" });
}

export default AboutPage;
