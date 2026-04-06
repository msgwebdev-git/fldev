import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

/**
 * Admin authorization helper.
 *
 * Source of truth for admin role: `app_metadata.role === 'admin'`.
 * `app_metadata` can only be written with the service role key, so users
 * cannot self-promote. Do NOT use `user_metadata.role` — the user controls it.
 *
 * To mark a user as admin, run in Supabase SQL Editor (service role):
 *
 *   UPDATE auth.users
 *   SET raw_app_meta_data =
 *     coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
 *   WHERE email = 'admin@example.com';
 */
export async function requireAdmin(): Promise<{
  user: User | null;
  isAdmin: boolean;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, isAdmin: false };
  }

  const isAdmin = user.app_metadata?.role === "admin";
  return { user, isAdmin };
}

/**
 * Pure role check against a User object already fetched elsewhere
 * (e.g. in middleware where we already called getUser).
 */
export function isAdminUser(user: User | null | undefined): boolean {
  return user?.app_metadata?.role === "admin";
}
