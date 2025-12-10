"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
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
import { Plus } from "lucide-react";

export function AddEventButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isHeadliner, setIsHeadliner] = useState(false);
  const [selectedDay, setSelectedDay] = useState("1");
  const [selectedStage, setSelectedStage] = useState("main");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const supabase = createClient();

    const { error } = await supabase.from("program_events").insert({
      date: formData.get("date") as string,
      day: parseInt(selectedDay),
      time: formData.get("time") as string,
      artist: formData.get("artist") as string,
      stage: selectedStage,
      genre: formData.get("genre") as string || null,
      is_headliner: isHeadliner,
      sort_order: parseInt(formData.get("sort_order") as string) || 0,
    });

    if (error) {
      console.error("Error adding event:", error);
    }

    setIsLoading(false);
    setOpen(false);
    setIsHeadliner(false);
    router.refresh();
  };

  // Предзаполнение даты в зависимости от дня
  const getDefaultDate = (day: string) => {
    const dates: Record<string, string> = {
      "1": "7 August",
      "2": "8 August",
      "3": "9 August",
    };
    return dates[day] || "7 August";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Добавить событие
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white border-gray-200 max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Добавить событие</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="artist" className="text-gray-700">Артист / Событие *</Label>
            <Input
              id="artist"
              name="artist"
              placeholder="Zdob și Zdub"
              required
              className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="day" className="text-gray-700">День</Label>
            <Select value={selectedDay} onValueChange={setSelectedDay}>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-gray-700">Дата *</Label>
              <Input
                id="date"
                name="date"
                placeholder="7 August"
                defaultValue={getDefaultDate(selectedDay)}
                required
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time" className="text-gray-700">Время *</Label>
              <Input
                id="time"
                name="time"
                placeholder="16:00"
                required
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stage" className="text-gray-700">Сцена *</Label>
            <Select value={selectedStage} onValueChange={setSelectedStage}>
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
            <Label htmlFor="genre" className="text-gray-700">Жанр</Label>
            <Input
              id="genre"
              name="genre"
              placeholder="Rock / Folk"
              className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sort_order" className="text-gray-700">Порядок сортировки</Label>
            <Input
              id="sort_order"
              name="sort_order"
              type="number"
              defaultValue="0"
              className="bg-white border-gray-300 text-gray-900"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_headliner"
              checked={isHeadliner}
              onCheckedChange={(checked) => setIsHeadliner(checked === true)}
            />
            <Label htmlFor="is_headliner" className="text-gray-700 cursor-pointer">
              Хедлайнер
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Добавление..." : "Добавить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
