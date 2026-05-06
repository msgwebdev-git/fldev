import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Tag } from "lucide-react";
import { PartnersTable } from "./PartnersTable";
import { AddPartnerButton } from "./AddPartnerButton";

export default async function PartnersAdminPage() {
  const supabase = await createClient();

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Партнёры</h1>
          <p className="text-gray-500 mt-1">Управление партнёрами фестиваля</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/partners/categories">
              <Tag className="w-4 h-4 mr-2" />
              Категории
            </Link>
          </Button>
          <AddPartnerButton categories={categories ?? []} />
        </div>
      </div>

      <PartnersTable partners={partners ?? []} categories={categories ?? []} />
    </div>
  );
}
