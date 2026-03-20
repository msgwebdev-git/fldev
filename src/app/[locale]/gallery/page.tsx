import { generatePageMetadata } from "@/lib/seo";
import GalleryPage from "./GalleryClient";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  return generatePageMetadata({ params, page: "gallery" });
}

export default GalleryPage;
