"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, ExternalLink } from "lucide-react";

interface Aftermovie {
  id: number;
  year: string;
  video_id: string;
}

interface AftermoviesTableProps {
  aftermovies: Aftermovie[];
}

export function AftermoviesTable({ aftermovies }: AftermoviesTableProps) {
  const router = useRouter();
  const [editingItem, setEditingItem] = useState<Aftermovie | null>(null);
  const [deletingItem, setDeletingItem] = useState<Aftermovie | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingItem) return;

    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const supabase = createClient();

    await supabase
      .from("aftermovies")
      .update({
        year: formData.get("year") as string,
        video_id: formData.get("video_id") as string,
      })
      .eq("id", editingItem.id);

    setIsLoading(false);
    setEditingItem(null);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!deletingItem) return;

    setIsLoading(true);
    const supabase = createClient();

    await supabase.from("aftermovies").delete().eq("id", deletingItem.id);

    setIsLoading(false);
    setDeletingItem(null);
    router.refresh();
  };

  if (aftermovies.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
        <p className="text-gray-500">Нет видео. Добавьте первое!</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Превью
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Год
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Video ID
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {aftermovies.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="relative w-24 h-14 rounded overflow-hidden bg-gray-100">
                    <Image
                      src={`https://img.youtube.com/vi/${item.video_id}/mqdefault.jpg`}
                      alt={`Aftermovie ${item.year}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-gray-900 font-medium">{item.year}</span>
                </td>
                <td className="px-4 py-3">
                  <a
                    href={`https://youtube.com/watch?v=${item.video_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-gray-900 flex items-center gap-1 text-sm"
                  >
                    {item.video_id}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-gray-900"
                      onClick={() => setEditingItem(item)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-red-600"
                      onClick={() => setDeletingItem(item)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Редактировать</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-year" className="text-gray-700">Год</Label>
              <Input
                id="edit-year"
                name="year"
                defaultValue={editingItem?.year}
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-video-id" className="text-gray-700">YouTube Video ID</Label>
              <Input
                id="edit-video-id"
                name="video_id"
                defaultValue={editingItem?.video_id}
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setEditingItem(null)}>
                Отмена
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Сохранение..." : "Сохранить"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingItem} onOpenChange={() => setDeletingItem(null)}>
        <DialogContent className="bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Удалить видео?</DialogTitle>
          </DialogHeader>
          <p className="text-gray-500">
            Вы уверены, что хотите удалить Aftermovie {deletingItem?.year}? Это действие нельзя отменить.
          </p>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setDeletingItem(null)}>
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? "Удаление..." : "Удалить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
