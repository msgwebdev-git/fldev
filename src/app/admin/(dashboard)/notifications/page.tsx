import { requireAdmin } from "@/lib/auth/require-admin";
import { NotificationsClient } from "./NotificationsClient";

export default async function NotificationsPage() {
  const { user } = await requireAdmin();
  return <NotificationsClient adminEmail={user?.email ?? ""} />;
}
