"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/require-admin";
import { revalidateStories } from "@/lib/data/stories";

export interface StoryInput {
  id?: string;
  titleRo: string;
  titleRu: string;
  videoUrl: string;
  coverUrl?: string | null;
  ctaLabelRo?: string | null;
  ctaLabelRu?: string | null;
  ctaHref?: string | null;
  sortOrder: number;
  isActive: boolean;
}

type ActionResult = { ok: true; id: string } | { ok: false; error: string };

export async function saveStory(input: StoryInput): Promise<ActionResult> {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) return { ok: false, error: "Unauthorized" };
  if (!input.titleRo.trim() || !input.titleRu.trim()) return { ok: false, error: "Укажите название на обоих языках" };
  if (!input.videoUrl) return { ok: false, error: "Загрузите видео" };

  const supabase = createAdminClient();
  const row = {
    title_ro: input.titleRo.trim(),
    title_ru: input.titleRu.trim(),
    video_url: input.videoUrl,
    cover_url: input.coverUrl?.trim() || null,
    cta_label_ro: input.ctaLabelRo?.trim() || null,
    cta_label_ru: input.ctaLabelRu?.trim() || null,
    cta_href: input.ctaHref?.trim() || null,
    sort_order: input.sortOrder,
    is_active: input.isActive,
  };

  let storyId = input.id;
  if (storyId) {
    const { error } = await supabase.from("homepage_stories").update(row).eq("id", storyId);
    if (error) return { ok: false, error: error.message };
  } else {
    const { data, error } = await supabase.from("homepage_stories").insert(row).select("id").single();
    if (error || !data) return { ok: false, error: error?.message || "Insert failed" };
    storyId = data.id;
  }

  revalidateStories();
  return { ok: true, id: storyId! };
}

export async function toggleStory(id: string, isActive: boolean): Promise<ActionResult> {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) return { ok: false, error: "Unauthorized" };
  const supabase = createAdminClient();
  const { error } = await supabase.from("homepage_stories").update({ is_active: isActive }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateStories();
  return { ok: true, id };
}

export async function deleteStory(id: string): Promise<ActionResult> {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) return { ok: false, error: "Unauthorized" };
  const supabase = createAdminClient();
  const { error } = await supabase.from("homepage_stories").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateStories();
  return { ok: true, id };
}
