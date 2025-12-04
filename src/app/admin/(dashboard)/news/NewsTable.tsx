"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Pencil, Trash2, Eye, EyeOff } from "lucide-react";

interface NewsItem {
  id: number;
  slug: string;
  title_ru: string;
  title_ro: string;
  excerpt_ru: string;
  excerpt_ro: string;
  content_ru: string;
  content_ro: string;
  image: string;
  date: string;
  category: string;
  published: boolean;
}

interface NewsTableProps {
  news: NewsItem[];
}

export function NewsTable({ news }: NewsTableProps) {
  const router = useRouter();
  const [deletingItem, setDeletingItem] = useState<NewsItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!deletingItem) return;

    setIsLoading(true);
    const supabase = createClient();

    await supabase.from("news").delete().eq("id", deletingItem.id);

    setIsLoading(false);
    setDeletingItem(null);
    router.refresh();
  };

  const togglePublished = async (item: NewsItem) => {
    const supabase = createClient();
    await supabase
      .from("news")
      .update({ published: !item.published })
      .eq("id", item.id);
    router.refresh();
  };

  // Get display title (RU with RO fallback)
  const getTitle = (item: NewsItem) => item.title_ru || item.title_ro || "Без названия";

  if (news.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
        <p className="text-gray-500">Нет новостей. Добавьте первую!</p>
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
                Изображение
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Заголовок
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Языки
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Дата
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {news.map((item) => {
              const hasRu = item.title_ru || item.content_ru;
              const hasRo = item.title_ro || item.content_ro;

              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="relative w-20 h-12 rounded overflow-hidden bg-gray-100">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={getTitle(item)}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <span className="text-gray-900 font-medium block">
                        {getTitle(item)}
                      </span>
                      <span className="text-gray-400 text-sm">{item.slug}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {hasRu && (
                        <Badge variant="secondary" className="text-xs">
                          RU
                        </Badge>
                      )}
                      {hasRo && (
                        <Badge variant="secondary" className="text-xs">
                          RO
                        </Badge>
                      )}
                      {!hasRu && !hasRo && (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-600 text-sm">{item.date}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => togglePublished(item)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                        item.published
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {item.published ? (
                        <>
                          <Eye className="w-3 h-3" />
                          Опубликовано
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" />
                          Черновик
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-gray-900"
                        asChild
                      >
                        <Link href={`/admin/news/${item.id}/edit`}>
                          <Pencil className="w-4 h-4" />
                        </Link>
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
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Delete Dialog */}
      <Dialog open={!!deletingItem} onOpenChange={() => setDeletingItem(null)}>
        <DialogContent className="bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Удалить новость?</DialogTitle>
          </DialogHeader>
          <p className="text-gray-500">
            Вы уверены, что хотите удалить "{deletingItem && getTitle(deletingItem)}"? Это действие нельзя отменить.
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
