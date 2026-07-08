import { notFound } from "next/navigation";
import { BusContent } from "./BusContent";
import { getActiveBusDates, getBusEnabled } from "@/lib/data/bus";
import { generatePageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export const revalidate = 120;

export async function generateMetadata({ params }: Props) {
  return generatePageMetadata({ params, page: "bus" });
}

export default async function BusPage() {
  if (!(await getBusEnabled())) notFound();
  const dates = await getActiveBusDates();
  return <BusContent dates={dates} />;
}
