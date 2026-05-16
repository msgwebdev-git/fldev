import { createPublicClient } from "@/lib/supabase/public";
import { ProgramContent } from "./ProgramContent";
import { getSiteSettingBool } from "@/lib/data/site-settings";
import { generatePageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export const revalidate = 600;

export async function generateMetadata({ params }: Props) {
  return generatePageMetadata({ params, page: "program" });
}

export default async function ProgramPage() {
  const supabase = createPublicClient();

  const [{ data: events }, showMobileApp] = await Promise.all([
    supabase
      .from("program_events")
      .select("*")
      .order("day", { ascending: true })
      .order("sort_order", { ascending: true }),
    getSiteSettingBool("show_mobile_app"),
  ]);

  return (
    <ProgramContent
      events={events || []}
      showMobileApp={showMobileApp}
    />
  );
}
