import { createClient } from "@/lib/supabase/server";
import { PartnerRequestsTable } from "./PartnerRequestsTable";

export default async function PartnerRequestsPage() {
  const supabase = await createClient();

  const { data: requests } = await supabase
    .from("partnership_requests")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Заявки на партнёрство</h1>
        <p className="text-gray-500 mt-1">
          Входящие заявки с формы &quot;Стать партнёром&quot;
        </p>
      </div>

      <PartnerRequestsTable requests={requests ?? []} />
    </div>
  );
}
