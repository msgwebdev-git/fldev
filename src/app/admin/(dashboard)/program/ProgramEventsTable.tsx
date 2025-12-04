"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Pencil, Trash2, Star, Clock, MapPin } from "lucide-react";

interface ProgramEvent {
  id: number;
  date: string;
  day: number;
  time: string;
  artist: string;
  stage: string;
  genre: string | null;
  is_headliner: boolean;
  year: string;
  sort_order: number;
}

interface ProgramEventsTableProps {
  events: ProgramEvent[];
  years: string[];
}

const stageLabels: Record<string, string> = {
  main: "Scena Principala",
  stage2: "Scena 2",
  electronic: "Scena Electronica",
};

const stageColors: Record<string, string> = {
  main: "bg-blue-100 text-blue-800 border-blue-200",
  stage2: "bg-green-100 text-green-800 border-green-200",
  electronic: "bg-purple-100 text-purple-800 border-purple-200",
};

export function ProgramEventsTable({ events, years }: ProgramEventsTableProps) {
  const router = useRouter();
  const [editingItem, setEditingItem] = useState<ProgramEvent | null>(null);
  const [deletingItem, setDeletingItem] = useState<ProgramEvent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(years[0] || "2025");
  const [selectedDayTab, setSelectedDayTab] = useState("1");
  const [editIsHeadliner, setEditIsHeadliner] = useState(false);
  const [editDay, setEditDay] = useState("1");
  const [editStage, setEditStage] = useState("main");

  const filteredEvents = events.filter((e) => e.year === selectedYear);

  // Группируем по дням
  const eventsByDay: Record<number, ProgramEvent[]> = {};
  filteredEvents.forEach((event) => {
    if (!eventsByDay[event.day]) {
      eventsByDay[event.day] = [];
    }
    eventsByDay[event.day].push(event);
  });

  // Получаем уникальные дни
  const days = [...new Set(filteredEvents.map((e) => e.day))].sort((a, b) => a - b);

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingItem) return;

    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const supabase = createClient();

    await supabase
      .from("program_events")
      .update({
        date: formData.get("date") as string,
        day: parseInt(editDay),
        time: formData.get("time") as string,
        artist: formData.get("artist") as string,
        stage: editStage,
        genre: formData.get("genre") as string || null,
        is_headliner: editIsHeadliner,
        year: formData.get("year") as string,
        sort_order: parseInt(formData.get("sort_order") as string) || 0,
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

    await supabase.from("program_events").delete().eq("id", deletingItem.id);

    setIsLoading(false);
    setDeletingItem(null);
    router.refresh();
  };

  const openEditDialog = (event: ProgramEvent) => {
    setEditingItem(event);
    setEditIsHeadliner(event.is_headliner);
    setEditDay(event.day.toString());
    setEditStage(event.stage);
  };

  if (events.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Нет событий. Добавьте первое!</p>
      </div>
    );
  }

  const renderEventRow = (event: ProgramEvent) => (
    <tr key={event.id} className={`hover:bg-gray-50 ${event.is_headliner ? "bg-yellow-50/30" : ""}`}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="font-mono font-medium text-gray-900">{event.time}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-gray-900 font-medium">{event.artist}</span>
          {event.is_headliner && (
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
              <Star className="w-3 h-3 mr-1" />
              Headliner
            </Badge>
          )}
        </div>
        {event.genre && (
          <p className="text-gray-500 text-sm mt-0.5">{event.genre}</p>
        )}
      </td>
      <td className="px-4 py-3">
        <Badge className={stageColors[event.stage] || "bg-gray-100 text-gray-800"}>
          <MapPin className="w-3 h-3 mr-1" />
          {stageLabels[event.stage] || event.stage}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <span className="text-gray-500 text-sm">{event.sort_order}</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-500 hover:text-gray-900"
            onClick={() => openEditDialog(event)}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-500 hover:text-red-600"
            onClick={() => setDeletingItem(event)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  );

  return (
    <>
      {/* Year Tabs */}
      <Tabs value={selectedYear} onValueChange={setSelectedYear}>
        <TabsList className="bg-gray-100 mb-4">
          {years.length > 0 ? (
            years.map((year) => (
              <TabsTrigger key={year} value={year}>
                {year} ({events.filter((e) => e.year === year).length})
              </TabsTrigger>
            ))
          ) : (
            <TabsTrigger value="2025">2025 (0)</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value={selectedYear} className="mt-0">
          {/* Day Tabs */}
          {days.length > 0 ? (
            <Tabs value={selectedDayTab} onValueChange={setSelectedDayTab}>
              <TabsList className="bg-gray-100 mb-4">
                {days.map((day) => {
                  const dayEvents = eventsByDay[day] || [];
                  const date = dayEvents[0]?.date || `День ${day}`;
                  return (
                    <TabsTrigger key={day} value={day.toString()}>
                      {date} ({dayEvents.length})
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {days.map((day) => (
                <TabsContent key={day} value={day.toString()} className="mt-0">
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">
                            Время
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Артист / Событие
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-40">
                            Сцена
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-20">
                            Порядок
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-24">
                            Действия
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {(eventsByDay[day] || [])
                          .sort((a, b) => a.sort_order - b.sort_order)
                          .map(renderEventRow)}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <p className="text-gray-500">Нет событий за {selectedYear} год</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="bg-white border-gray-200 max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Редактировать событие</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-artist" className="text-gray-700">Артист / Событие *</Label>
              <Input
                id="edit-artist"
                name="artist"
                defaultValue={editingItem?.artist}
                required
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-date" className="text-gray-700">Дата *</Label>
                <Input
                  id="edit-date"
                  name="date"
                  defaultValue={editingItem?.date}
                  placeholder="7 August"
                  required
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-time" className="text-gray-700">Время *</Label>
                <Input
                  id="edit-time"
                  name="time"
                  defaultValue={editingItem?.time}
                  placeholder="16:00"
                  required
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
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
              <Label htmlFor="edit-stage" className="text-gray-700">Сцена *</Label>
              <Select value={editStage} onValueChange={setEditStage}>
                <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                  <SelectValue placeholder="Выберите сцену" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">Scena Principala</SelectItem>
                  <SelectItem value="stage2">Scena 2</SelectItem>
                  <SelectItem value="electronic">Scena Electronica</SelectItem>
                </SelectContent>
              </Select>
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
            <DialogTitle className="text-gray-900">Удалить событие?</DialogTitle>
          </DialogHeader>
          <p className="text-gray-500">
            Вы уверены, что хотите удалить &quot;{deletingItem?.artist}&quot; ({deletingItem?.time})? Это действие нельзя отменить.
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
