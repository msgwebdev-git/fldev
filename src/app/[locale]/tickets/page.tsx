import { TicketsContent } from "./TicketsContent";
import { getActiveTickets } from "@/lib/data/tickets";
import { generatePageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export const revalidate = 300;

export async function generateMetadata({ params }: Props) {
  return generatePageMetadata({ params, page: "tickets" });
}

export default async function TicketsPage() {
  const tickets = await getActiveTickets();
  return <TicketsContent tickets={tickets} />;
}
