"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/require-admin";

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  is_owner: boolean;
}

type ActionResult = { ok: true; promoted?: boolean } | { ok: false; error: string };

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Team management is owner-only: regular admins run the panel but cannot
 * grant/revoke roles. Checked against the DB (not the JWT) so it applies
 * immediately after the owner flag is set, without re-login.
 */
async function requireOwner(): Promise<{ userId: string } | { error: string }> {
  const { user, isAdmin } = await requireAdmin();
  if (!user || !isAdmin) return { error: "Unauthorized" };

  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("get_admin_users");
  if (error) return { error: error.message };
  const me = ((data ?? []) as AdminUser[]).find((a) => a.id === user.id);
  if (!me?.is_owner) return { error: "Управлять командой может только владелец." };
  return { userId: user.id };
}

/**
 * Grant the admin role. If a user with this email already exists (e.g. a
 * mobile-app account) they are promoted; otherwise a new account is created
 * with the given password. Role lives in app_metadata (service-role only —
 * users cannot self-promote), see src/lib/auth/require-admin.ts.
 */
export async function addAdmin(input: { email: string; password: string }): Promise<ActionResult> {
  const owner = await requireOwner();
  if ("error" in owner) return { ok: false, error: owner.error };

  const email = input.email.trim().toLowerCase();
  if (!validEmail(email)) return { ok: false, error: "Некорректный email" };

  const supabase = createAdminClient();

  // Existing account (mobile user or ex-admin) → just promote.
  const { data: existingId, error: lookupError } = await supabase.rpc("get_user_id_by_email", {
    p_email: email,
  });
  if (lookupError) return { ok: false, error: lookupError.message };

  if (existingId) {
    // Promote. If a password was provided, set it too — Google-only accounts
    // have no password and could not log in at /admin/login otherwise.
    if (input.password && input.password.length < 8) {
      return { ok: false, error: "Пароль — минимум 8 символов (или оставьте поле пустым, чтобы не менять)." };
    }
    const { error } = await supabase.auth.admin.updateUserById(existingId, {
      app_metadata: { role: "admin" },
      ...(input.password ? { password: input.password } : {}),
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, promoted: true };
  }

  // New account → password required.
  if (!input.password || input.password.length < 8) {
    return { ok: false, error: "Пользователя с таким email нет — задайте пароль (минимум 8 символов), чтобы создать аккаунт." };
  }

  const { error } = await supabase.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
    app_metadata: { role: "admin" },
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, promoted: false };
}

/**
 * Revoke the admin role (the account itself is kept — deletion, if ever
 * needed, is done in the Supabase dashboard). Guards: you cannot demote
 * yourself, the last remaining admin, or an owner (app_metadata.owner =
 * true — checked against the DB, not client input, so a co-admin cannot
 * lock the founder out).
 */
export async function revokeAdmin(userId: string): Promise<ActionResult> {
  const owner = await requireOwner();
  if ("error" in owner) return { ok: false, error: owner.error };

  if (userId === owner.userId) {
    return { ok: false, error: "Нельзя забрать роль у самого себя." };
  }

  const supabase = createAdminClient();

  const { data: admins, error: listError } = await supabase.rpc("get_admin_users");
  if (listError) return { ok: false, error: listError.message };
  const adminList = (admins ?? []) as AdminUser[];
  const target = adminList.find((a) => a.id === userId);
  if (!target) {
    return { ok: false, error: "Этот пользователь не админ." };
  }
  if (target.is_owner) {
    return { ok: false, error: "Это владелец — его роль нельзя отозвать." };
  }
  if (adminList.length <= 1) {
    return { ok: false, error: "Нельзя разжаловать последнего админа." };
  }

  const { error } = await supabase.auth.admin.updateUserById(userId, {
    app_metadata: { role: null },
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
