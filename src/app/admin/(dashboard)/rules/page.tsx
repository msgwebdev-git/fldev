import { createAdminClient } from "@/lib/supabase/admin";
import { RulesTable, type Rule } from "./RulesTable";
import { AddRuleButton } from "./AddRuleButton";

export default async function RulesAdminPage() {
  const supabase = createAdminClient();

  const { data: rules } = await supabase
    .from("festival_rules")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Правила фестиваля</h1>
          <p className="text-gray-500 mt-1">
            Управление разделами правил на странице /rules
          </p>
        </div>
        <AddRuleButton nextSortOrder={(rules?.length ?? 0) + 1} />
      </div>

      <RulesTable rules={(rules ?? []) as Rule[]} />
    </div>
  );
}
