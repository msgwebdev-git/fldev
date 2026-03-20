import { B2BContent } from "./B2BContent";
import { generatePageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  return generatePageMetadata({ params, page: "b2b" });
}

export default function B2BPage() {
  return <B2BContent />;
}
