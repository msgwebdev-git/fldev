import { createClient } from "@/lib/supabase/server";
import { PartnersTable } from "./PartnersTable";
import { AddPartnerButton } from "./AddPartnerButton";

export default async function PartnersAdminPage() {
  const supabase = await createClient();

  const { data: partners } = await supabase
    .from("partners")
    .select("*")
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Партнёры</h1>
          <p className="text-gray-500 mt-1">Управление партнёрами фестиваля</p>
        </div>
        <AddPartnerButton />
      </div>

      <PartnersTable partners={partners ?? []} />
    </div>
  );
}
