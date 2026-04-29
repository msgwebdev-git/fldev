import { generatePageMetadata } from "@/lib/seo";
import GalleryPage from "./GalleryClient";

type Props = { params: Promise<{ locale: string }> };

// Page shell is static — gallery data is fetched client-side from Supabase.
export const dynamic = "force-static";

export async function generateMetadata({ params }: Props) {
  return generatePageMetadata({ params, page: "gallery" });
}

export default GalleryPage;
