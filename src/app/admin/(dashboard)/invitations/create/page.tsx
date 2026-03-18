import { createClient } from "@/lib/supabase/server";
import { CreateInvitationForm } from "../CreateInvitationForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CreateInvitationPage() {
  const supabase = await createClient();

  const { data: tickets } = await supabase
    .from("tickets")
    .select(`
      id, name_ro, name_ru, price, is_active, has_options,
      ticket_options ( id, name_ro, name_ru, price_modifier, is_default )
    `)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/invitations"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад к списку
        </Link>
      </div>

      <CreateInvitationForm tickets={tickets ?? []} />
    </div>
  );
}
