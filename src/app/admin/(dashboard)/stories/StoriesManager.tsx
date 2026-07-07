"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Loader2, Upload, X, Film, Video, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { saveStory, deleteStory, toggleStory, type StoryInput } from "./actions";

export interface AdminStory {
  id: string;
  title_ru: string;
  title_ro: string;
  video_url: string | null;
  cover_url: string | null;
  cta_label_ru: string | null;
  cta_label_ro: string | null;
  cta_href: string | null;
  sort_order: number;
  is_active: boolean;
}

// Direct browser → Supabase upload via a signed URL (avoids serverless body limit).
async function uploadToStorage(blob: Blob, ext: string): Promise<string> {
  const res = await fetch("/api/admin/stories/sign-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ext: ext || "bin" }),
  });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error || "Не удалось подготовить загрузку");
  const sb = createClient();
  const up = await sb.storage.from(data.bucket).uploadToSignedUrl(data.path, data.token, blob);
  if (up.error) throw up.error;
  return data.publicUrl as string;
}

// Grab a square thumbnail frame from the uploaded video (client-side, via canvas).
function captureVideoThumbnail(file: File): Promise<Blob | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    video.src = url;
    const done = (blob: Blob | null) => {
      URL.revokeObjectURL(url);
      resolve(blob);
    };
    video.addEventListener("loadeddata", () => {
      const d = video.duration;
      video.currentTime = Number.isFinite(d) && d > 0 ? Math.min(1, d * 0.1) : 0;
    });
    video.addEventListener("seeked", () => {
      try {
        const w = video.videoWidth;
        const h = video.videoHeight;
        if (!w || !h) return done(null);
        const size = Math.min(w, h);
        const canvas = document.createElement("canvas");
        canvas.width = 400;
        canvas.height = 400;
        const ctx = canvas.getContext("2d");
        if (!ctx) return done(null);
        ctx.drawImage(video, (w - size) / 2, (h - size) / 2, size, size, 0, 0, 400, 400);
        canvas.toBlob((blob) => done(blob), "image/jpeg", 0.85);
      } catch {
        done(null);
      }
    });
    video.addEventListener("error", () => done(null));
  });
}

const BLANK: StoryInput = {
  titleRo: "",
  titleRu: "",
  videoUrl: "",
  coverUrl: null,
  ctaLabelRo: null,
  ctaLabelRu: null,
  ctaHref: null,
  sortOrder: 0,
  isActive: true,
};

export function StoriesManager({ stories }: { stories: AdminStory[] }) {
  const router = useRouter();
  const [editing, setEditing] = React.useState<StoryInput | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [uploadingVideo, setUploadingVideo] = React.useState(false);
  const [uploadingCover, setUploadingCover] = React.useState(false);
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [toDelete, setToDelete] = React.useState<AdminStory | null>(null);

  const openNew = () => setEditing({ ...BLANK, sortOrder: stories.length + 1 });
  const openEdit = (s: AdminStory) =>
    setEditing({
      id: s.id,
      titleRo: s.title_ro,
      titleRu: s.title_ru,
      videoUrl: s.video_url ?? "",
      coverUrl: s.cover_url,
      ctaLabelRo: s.cta_label_ro,
      ctaLabelRu: s.cta_label_ru,
      ctaHref: s.cta_href,
      sortOrder: s.sort_order,
      isActive: s.is_active,
    });

  const set = <K extends keyof StoryInput>(k: K, v: StoryInput[K]) =>
    setEditing((prev) => (prev ? { ...prev, [k]: v } : prev));

  const onVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("video/")) return toast.error("Выберите видеофайл");
    setUploadingVideo(true);
    try {
      const url = await uploadToStorage(file, file.name.split(".").pop() || "mp4");
      set("videoUrl", url);
      // Auto-generate a cover from a video frame (unless one is already set)
      try {
        const thumb = await captureVideoThumbnail(file);
        if (thumb) {
          const coverUrl = await uploadToStorage(thumb, "jpg");
          setEditing((prev) => (prev && !prev.coverUrl ? { ...prev, coverUrl } : prev));
        }
      } catch {
        // cover is optional — ignore
      }
      toast.success("Видео загружено");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка загрузки");
    } finally {
      setUploadingVideo(false);
    }
  };

  const onCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Выберите изображение");
    setUploadingCover(true);
    try {
      const url = await uploadToStorage(file, file.name.split(".").pop() || "jpg");
      set("coverUrl", url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка загрузки");
    } finally {
      setUploadingCover(false);
    }
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.videoUrl) return toast.error("Загрузите видео");
    setSaving(true);
    const res = await saveStory(editing);
    setSaving(false);
    if (res.ok) {
      toast.success("Сторис сохранён");
      setEditing(null);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  };

  const handleToggle = async (s: AdminStory, next: boolean) => {
    setPendingId(s.id);
    const res = await toggleStory(s.id, next);
    setPendingId(null);
    if (res.ok) router.refresh();
    else toast.error(res.error);
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setSaving(true);
    const res = await deleteStory(toDelete.id);
    setSaving(false);
    if (res.ok) {
      toast.success("Сторис удалён");
      setToDelete(null);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  };

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={openNew}>
          <Plus className="mr-2 h-4 w-4" /> Добавить сторис
        </Button>
      </div>

      {stories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center text-gray-500">
          <Film className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          Пока нет сторис.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Сторис</th>
                <th className="px-4 py-3 font-medium">Видео</th>
                <th className="px-4 py-3 font-medium">Порядок</th>
                <th className="px-4 py-3 font-medium">Активен</th>
                <th className="px-4 py-3 font-medium text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stories.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-gray-400">
                        {s.cover_url ? (
                          <Image src={s.cover_url} alt={s.title_ru} fill sizes="44px" className="object-cover" />
                        ) : (
                          <Film className="h-5 w-5" />
                        )}
                      </div>
                      <span className="font-medium text-gray-900">{s.title_ru}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {s.video_url ? (
                      <span className="inline-flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="h-4 w-4" /> есть
                      </span>
                    ) : (
                      <span className="text-red-500">нет</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{s.sort_order}</td>
                  <td className="px-4 py-3">
                    {pendingId === s.id ? (
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    ) : (
                      <Switch checked={s.is_active} onCheckedChange={(v) => handleToggle(s, v)} />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(s)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => setToDelete(s)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Editor dialog */}
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Редактировать сторис" : "Новый сторис"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Название (RU)</Label>
                  <Input value={editing.titleRu} onChange={(e) => set("titleRu", e.target.value)} placeholder="Как добраться" />
                </div>
                <div className="space-y-1.5">
                  <Label>Название (RO)</Label>
                  <Input value={editing.titleRo} onChange={(e) => set("titleRo", e.target.value)} placeholder="Cum ajungi" />
                </div>
              </div>

              {/* Video */}
              <div className="space-y-1.5">
                <Label>Видео (вертикальное 9:16, mp4)</Label>
                {editing.videoUrl ? (
                  <div className="flex items-center gap-3">
                    <video src={editing.videoUrl} className="h-40 rounded-lg bg-black object-cover" muted playsInline controls />
                    <Button variant="ghost" size="sm" onClick={() => set("videoUrl", "")}>
                      <X className="mr-1 h-3.5 w-3.5" /> Заменить
                    </Button>
                  </div>
                ) : (
                  <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 text-gray-400 hover:border-primary hover:text-primary">
                    {uploadingVideo ? <Loader2 className="h-6 w-6 animate-spin" /> : <Video className="h-6 w-6" />}
                    <span className="text-sm">{uploadingVideo ? "Загрузка…" : "Загрузить видео"}</span>
                    <input type="file" accept="video/*" onChange={onVideo} className="hidden" disabled={uploadingVideo} />
                  </label>
                )}
              </div>

              {/* Cover */}
              <div className="space-y-1.5">
                <Label>Обложка кружка (создаётся из видео автоматически)</Label>
                <div className="flex items-center gap-3">
                  <div className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border bg-gray-100 text-gray-400">
                    {editing.coverUrl ? <Image src={editing.coverUrl} alt="" fill sizes="64px" className="object-cover" /> : <Film className="h-5 w-5" />}
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-500 hover:border-primary hover:text-primary">
                    {uploadingCover ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    Загрузить
                    <input type="file" accept="image/*" onChange={onCover} className="hidden" disabled={uploadingCover} />
                  </label>
                  {editing.coverUrl && (
                    <Button variant="ghost" size="sm" onClick={() => set("coverUrl", null)}>
                      Сбросить
                    </Button>
                  )}
                </div>
              </div>

              {/* CTA */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Кнопка (RU) — необязательно</Label>
                  <Input value={editing.ctaLabelRu ?? ""} onChange={(e) => set("ctaLabelRu", e.target.value || null)} placeholder="Купить билет" />
                </div>
                <div className="space-y-1.5">
                  <Label>Кнопка (RO)</Label>
                  <Input value={editing.ctaLabelRo ?? ""} onChange={(e) => set("ctaLabelRo", e.target.value || null)} placeholder="Cumpără bilet" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Ссылка кнопки</Label>
                <Input value={editing.ctaHref ?? ""} onChange={(e) => set("ctaHref", e.target.value || null)} placeholder="/tickets" />
              </div>

              <div className="grid grid-cols-2 items-center gap-3">
                <div className="space-y-1.5">
                  <Label>Порядок</Label>
                  <Input type="number" value={editing.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value))} />
                </div>
                <label className="mt-6 flex items-center gap-2">
                  <Switch checked={editing.isActive} onCheckedChange={(v) => set("isActive", v)} />
                  <span className="text-sm">Активен</span>
                </label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)} disabled={saving}>Отмена</Button>
            <Button onClick={save} disabled={saving || uploadingVideo}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Сохранить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить сторис?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">{toDelete && <>«{toDelete.title_ru}» будет удалён.</>}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToDelete(null)} disabled={saving}>Отмена</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Удалить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
