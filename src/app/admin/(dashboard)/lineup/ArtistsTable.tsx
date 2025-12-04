"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Trash2, Star, Music } from "lucide-react";

interface Artist {
  id: number;
  name: string;
  image_url: string | null;
  genre: string | null;
  country: string | null;
  is_headliner: boolean;
  day: number;
  stage: string | null;
  year: string;
  sort_order: number;
}

interface ArtistsTableProps {
  artists: Artist[];
  years: string[];
}

export function ArtistsTable({ artists, years }: ArtistsTableProps) {
  const router = useRouter();
  const [editingItem, setEditingItem] = useState<Artist | null>(null);
  const [deletingItem, setDeletingItem] = useState<Artist | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(years[0] || "2025");
  const [editIsHeadliner, setEditIsHeadliner] = useState(false);
  const [editDay, setEditDay] = useState("1");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const filteredArtists = artists.filter((a) => a.year === selectedYear);
  const headliners = filteredArtists.filter((a) => a.is_headliner);
  const otherArtists = filteredArtists.filter((a) => !a.is_headliner);

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingItem) return;

    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const supabase = createClient();

    let imageUrl = formData.get("image_url") as string;

    // Если есть новый файл изображения
    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("artists")
        .upload(fileName, imageFile);

      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage
          .from("artists")
          .getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }
    }

    await supabase
      .from("artists")
      .update({
        name: formData.get("name") as string,
        image_url: imageUrl || null,
        genre: formData.get("genre") as string || null,
        country: formData.get("country") as string || null,
        is_headliner: editIsHeadliner,
        day: parseInt(editDay),
        stage: formData.get("stage") as string || null,
        year: formData.get("year") as string,
        sort_order: parseInt(formData.get("sort_order") as string) || 0,
      })
      .eq("id", editingItem.id);

    setIsLoading(false);
    setEditingItem(null);
    setImageFile(null);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!deletingItem) return;

    setIsLoading(true);
    const supabase = createClient();

    await supabase.from("artists").delete().eq("id", deletingItem.id);

    setIsLoading(false);
    setDeletingItem(null);
    router.refresh();
  };

  const openEditDialog = (artist: Artist) => {
    setEditingItem(artist);
    setEditIsHeadliner(artist.is_headliner);
    setEditDay(artist.day.toString());
  };

  if (artists.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
        <Music className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Нет артистов. Добавьте первого!</p>
      </div>
    );
  }

  const renderArtistRow = (artist: Artist) => (
    <tr key={artist.id} className="hover:bg-gray-50">
      <td className="px-4 py-3">
        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
          {artist.image_url ? (
            <Image
              src={artist.image_url}
              alt={artist.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Music className="w-6 h-6" />
            </div>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-gray-900 font-medium">{artist.name}</span>
          {artist.is_headliner && (
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
              <Star className="w-3 h-3 mr-1" />
              Headliner
            </Badge>
          )}
        </div>
        {artist.genre && (
          <p className="text-gray-500 text-sm">{artist.genre}</p>
        )}
      </td>
      <td className="px-4 py-3">
        <span className="text-gray-600">День {artist.day}</span>
        {artist.stage && (
          <p className="text-gray-400 text-sm">{artist.stage}</p>
        )}
      </td>
      <td className="px-4 py-3">
        <span className="text-gray-500">{artist.country || "—"}</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-500 hover:text-gray-900"
            onClick={() => openEditDialog(artist)}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-500 hover:text-red-600"
            onClick={() => setDeletingItem(artist)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  );

  return (
    <>
      <Tabs value={selectedYear} onValueChange={setSelectedYear}>
        <TabsList className="bg-gray-100 mb-4">
          {years.length > 0 ? (
            years.map((year) => (
              <TabsTrigger key={year} value={year}>
                {year} ({artists.filter((a) => a.year === year).length})
              </TabsTrigger>
            ))
          ) : (
            <TabsTrigger value="2025">2025 (0)</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value={selectedYear} className="mt-0">
          {headliners.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                Хедлайнеры ({headliners.length})
              </h3>
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-yellow-50/50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-20">
                        Фото
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Артист
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        День / Сцена
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Страна
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-24">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {headliners.map(renderArtistRow)}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {otherArtists.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">
                Артисты ({otherArtists.length})
              </h3>
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-20">
                        Фото
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Артист
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        День / Сцена
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Страна
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-24">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {otherArtists.map(renderArtistRow)}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {filteredArtists.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <p className="text-gray-500">Нет артистов за {selectedYear} год</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="bg-white border-gray-200 max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Редактировать артиста</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-gray-700">Имя артиста *</Label>
              <Input
                id="edit-name"
                name="name"
                defaultValue={editingItem?.name}
                required
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-year" className="text-gray-700">Год *</Label>
                <Input
                  id="edit-year"
                  name="year"
                  defaultValue={editingItem?.year}
                  required
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-day" className="text-gray-700">День</Label>
                <Select value={editDay} onValueChange={setEditDay}>
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                    <SelectValue placeholder="День" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">День 1</SelectItem>
                    <SelectItem value="2">День 2</SelectItem>
                    <SelectItem value="3">День 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-genre" className="text-gray-700">Жанр</Label>
              <Input
                id="edit-genre"
                name="genre"
                defaultValue={editingItem?.genre || ""}
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-country" className="text-gray-700">Страна</Label>
              <Input
                id="edit-country"
                name="country"
                defaultValue={editingItem?.country || ""}
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-stage" className="text-gray-700">Сцена</Label>
              <Input
                id="edit-stage"
                name="stage"
                defaultValue={editingItem?.stage || ""}
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700">Изображение</Label>
              {editingItem?.image_url && (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 mb-2">
                  <Image
                    src={editingItem.image_url}
                    alt={editingItem.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="bg-white border-gray-300 text-gray-900"
              />
              <p className="text-xs text-gray-500">Или укажите URL:</p>
              <Input
                id="edit-image_url"
                name="image_url"
                defaultValue={editingItem?.image_url || ""}
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-sort_order" className="text-gray-700">Порядок сортировки</Label>
              <Input
                id="edit-sort_order"
                name="sort_order"
                type="number"
                defaultValue={editingItem?.sort_order || 0}
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-is_headliner"
                checked={editIsHeadliner}
                onCheckedChange={(checked) => setEditIsHeadliner(checked === true)}
              />
              <Label htmlFor="edit-is_headliner" className="text-gray-700 cursor-pointer">
                Хедлайнер
              </Label>
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
            <DialogTitle className="text-gray-900">Удалить артиста?</DialogTitle>
          </DialogHeader>
          <p className="text-gray-500">
            Вы уверены, что хотите удалить {deletingItem?.name}? Это действие нельзя отменить.
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
