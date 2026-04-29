import { createPublicClient } from "@/lib/supabase/public";
import { ProgramContent } from "./ProgramContent";
import { generatePageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export const revalidate = 600;

export async function generateMetadata({ params }: Props) {
  return generatePageMetadata({ params, page: "program" });
}

export default async function ProgramPage() {
  const supabase = createPublicClient();

  const [{ data: events }, { data: appSetting }] = await Promise.all([
    supabase
      .from("program_events")
      .select("*")
      .order("day", { ascending: true })
      .order("sort_order", { ascending: true }),
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "show_mobile_app")
      .single(),
  ]);

  return (
    <ProgramContent
      events={events || []}
      showMobileApp={appSetting?.value === "true"}
    />
  );
}
