import { createClient } from "@/lib/supabase/server";
import { CreateInvitationForm } from "./CreateInvitationForm";
import { InvitationsTable } from "./InvitationsTable";

export const dynamic = "force-dynamic";

export default async function InvitationsPage() {
  const supabase = await createClient();

  // Get tickets for the form
  const { data: tickets } = await supabase
    .from("tickets")
    .select(`
      id,
      name_ro,
      name_ru,
      price,
      is_active,
      has_options,
      ticket_options (
        id,
        name_ro,
        name_ru,
        price_modifier,
        is_default
      )
    `)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  // Get recent invitations
  const { data: invitations } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      customer_name,
      customer_email,
      promo_code,
      created_at,
      items:order_items (
        id,
        ticket_code,
        ticket:tickets (
          name_ro,
          name_ru
        )
      )
    `)
    .eq("is_invitation", true)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Приглашения</h1>
        <p className="text-gray-500 mt-1">
          Создание бесплатных приглашений (не учитываются в продажах)
        </p>
      </div>

      {/* Create Invitation Form */}
      <CreateInvitationForm tickets={tickets ?? []} />

      {/* Recent Invitations */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Последние приглашения
        </h2>
        <InvitationsTable invitations={(invitations ?? []) as any} />
      </div>
    </div>
  );
}
