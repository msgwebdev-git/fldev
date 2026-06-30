import { Suspense } from "react";
import { generatePageMetadata } from "@/lib/seo";
import GalleryPage from "./GalleryClient";

type Props = { params: Promise<{ locale: string }> };

// Page shell is static — gallery data is fetched client-side from Supabase.
export const dynamic = "force-static";

export async function generateMetadata({ params }: Props) {
  return generatePageMetadata({ params, page: "gallery" });
}

// GalleryClient reads useSearchParams(), forcing a client bail-out during
// prerender — wrap it in Suspense so the static shell can be generated.
export default function Page() {
  return (
    <Suspense fallback={null}>
      <GalleryPage />
    </Suspense>
  );
}
