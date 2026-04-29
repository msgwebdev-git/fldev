import { generatePageMetadata } from "@/lib/seo";
import AboutPage from "./AboutClient";

type Props = { params: Promise<{ locale: string }> };

export const dynamic = "force-static";

export async function generateMetadata({ params }: Props) {
  return generatePageMetadata({ params, page: "about" });
}

export default AboutPage;
