import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/require-admin";
import { TeamManager } from "./TeamManager";
import type { AdminUser } from "./actions";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const { user } = await requireAdmin();
  const supabase = createAdminClient();
  const { data } = await supabase.rpc("get_admin_users");
  const admins = (data ?? []) as AdminUser[];
  const isOwner = admins.some((a) => a.id === user?.id && a.is_owner);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Команда</h1>
        <p className="text-gray-500 mt-1">
          Администраторы панели. Роль применяется после следующего входа пользователя.
          {!isOwner && " Управлять составом может только владелец."}
        </p>
      </div>
      <TeamManager admins={admins} currentUserId={user?.id ?? ""} isOwner={isOwner} />
    </div>
  );
}
