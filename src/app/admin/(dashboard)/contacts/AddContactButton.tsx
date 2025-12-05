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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

export function AddContactButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("general");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const supabase = createClient();

    const { error } = await supabase.from("contacts").insert({
      department_key: selectedDepartment,
      email: formData.get("email") as string,
      phone: (formData.get("phone") as string) || null,
      sort_order: parseInt(formData.get("sort_order") as string) || 0,
      is_active: true,
    });

    if (error) {
      console.error("Error adding contact:", error);
      if (error.code === "23505") {
        alert("Контакт для этого отдела уже существует");
      }
    }

    setIsLoading(false);
    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Добавить контакт
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white border-gray-200 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Добавить контакт</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="department" className="text-gray-700">Отдел *</Label>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                <SelectValue placeholder="Выберите отдел" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">Общие вопросы</SelectItem>
                <SelectItem value="commercial">Коммерческий отдел</SelectItem>
                <SelectItem value="partners">Партнёрство</SelectItem>
                <SelectItem value="artists">Артисты / Букинг</SelectItem>
                <SelectItem value="marketing">Маркетинг</SelectItem>
                <SelectItem value="it">IT / Техподдержка</SelectItem>
                <SelectItem value="press">Пресса</SelectItem>
                <SelectItem value="volunteers">Волонтёры</SelectItem>
                <SelectItem value="security">Безопасность</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="department@festivalullupilor.md"
              required
              className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-gray-700">Телефон</Label>
            <Input
              id="phone"
              name="phone"
              placeholder="+373 60 123 456"
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
