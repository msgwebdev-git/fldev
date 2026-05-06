import { createPublicClient } from "@/lib/supabase/public";
import { PartnersContent } from "./PartnersContent";
import { generatePageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export const revalidate = 3600;

export async function generateMetadata({ params }: Props) {
  return generatePageMetadata({ params, page: "partners" });
}

export default async function PartnersPage() {
  const supabase = createPublicClient();

  const [{ data: partners }, { data: categories }] = await Promise.all([
    supabase
      .from("partners")
      .select("*")
      .order("category", { ascending: true })
      .order("sort_order", { ascending: true }),
    supabase
      .from("partner_categories")
      .select("*")
      .order("sort_order", { ascending: true }),
  ]);

  return <PartnersContent partners={partners || []} categories={categories || []} />;
}
