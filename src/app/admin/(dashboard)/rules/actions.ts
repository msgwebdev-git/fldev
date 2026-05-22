"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export interface RuleInput {
  section_id: string;
  title_ro: string;
  title_ru: string;
  icon: string;
  keywords_ro: string[];
  keywords_ru: string[];
  content_ro: string[];
  content_ru: string[];
  sort_order: number;
  is_active: boolean;
}

type ActionResult = { success: true } | { success: false; error: string };

const SECTION_ID_RE = /^[a-z0-9][a-z0-9-_]*$/;

function validate(input: RuleInput): string | null {
  if (!input.section_id || !SECTION_ID_RE.test(input.section_id)) {
    return "section_id должен содержать только латиницу в нижнем регистре, цифры, '-' и '_'";
  }
  if (!input.title_ro.trim() || !input.title_ru.trim()) {
    return "Заголовок обязателен на обоих языках";
  }
  if (!input.icon.trim()) {
    return "Иконка обязательна";
  }
  if (input.content_ro.length === 0 || input.content_ru.length === 0) {
    return "Контент обязателен на обоих языках";
  }
  return null;
}

function bumpRevalidation() {
  revalidatePath("/ro/rules");
  revalidatePath("/ru/rules");
}

export async function createRule(input: RuleInput): Promise<ActionResult> {
  const validationError = validate(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("festival_rules").insert([input]);

  if (error) {
    return {
      success: false,
      error:
        error.code === "23505"
          ? `section_id "${input.section_id}" уже занят`
          : error.message,
    };
  }

  bumpRevalidation();
  return { success: true };
}

export async function updateRule(
  id: string,
  input: RuleInput
): Promise<ActionResult> {
  const validationError = validate(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("festival_rules")
    .update(input)
    .eq("id", id);

  if (error) {
    return {
      success: false,
      error:
        error.code === "23505"
          ? `section_id "${input.section_id}" уже занят`
          : error.message,
    };
  }

  bumpRevalidation();
  return { success: true };
}

export async function deleteRule(id: string): Promise<ActionResult> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("festival_rules").delete().eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  bumpRevalidation();
  return { success: true };
}

export async function toggleRuleActive(
  id: string,
  is_active: boolean
): Promise<ActionResult> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("festival_rules")
    .update({ is_active })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  bumpRevalidation();
  return { success: true };
}
