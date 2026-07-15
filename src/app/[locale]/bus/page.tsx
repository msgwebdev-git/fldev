import { notFound } from "next/navigation";
import { draftMode } from "next/headers";
import { BusContent } from "./BusContent";
import { getActiveBusDates, getBusEnabled, getBusDepartureAddress } from "@/lib/data/bus";
import { generatePageMetadata } from "@/lib/seo";
import { PreviewBanner } from "@/components/admin/PreviewBanner";

type Props = { params: Promise<{ locale: string }> };

export const revalidate = 120;

export async function generateMetadata({ params }: Props) {
  return generatePageMetadata({ params, page: "bus" });
}

export default async function BusPage() {
  // Draft Mode = admin preview: the bypass cookie renders this request
  // dynamically for the admin only; public ISR still serves 404 when hidden.
  const { isEnabled: preview } = await draftMode();
  const enabled = await getBusEnabled();
  if (!enabled && !preview) notFound();

  const [dates, departureAddress] = await Promise.all([
    getActiveBusDates(),
    getBusDepartureAddress(),
  ]);
  return (
    <>
      {preview && !enabled && <PreviewBanner />}
      <BusContent dates={dates} departureAddress={departureAddress} />
    </>
  );
}
