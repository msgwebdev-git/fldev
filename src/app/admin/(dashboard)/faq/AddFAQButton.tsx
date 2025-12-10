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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

const categories = [
  { value: "tickets", label: "Билеты" },
  { value: "camping", label: "Кемпинг" },
  { value: "transport", label: "Транспорт" },
  { value: "children", label: "Дети" },
  { value: "food", label: "Еда и напитки" },
  { value: "safety", label: "Безопасность" },
  { value: "location", label: "Локация" },
  { value: "app", label: "Приложение" },
  { value: "general", label: "Общие" },
];

export function AddFAQButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    question_ro: "",
    question_ru: "",
    answer_ro: "",
    answer_ru: "",
    category: "general",
    sort_order: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const supabase = createClient();

    await supabase.from("faq").insert([
      {
        ...formData,
        is_active: true,
      },
    ]);

    setIsLoading(false);
    setOpen(false);
    setFormData({
      question_ro: "",
      question_ru: "",
      answer_ro: "",
      answer_ru: "",
      category: "general",
      sort_order: 1,
    });
    router.refresh();
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Добавить вопрос
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-white border-gray-200 max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Добавить вопрос FAQ</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Категория</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Порядок сортировки</Label>
                <Input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sort_order: parseInt(e.target.value) || 1,
                    })
                  }
                  min="1"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="border-b pb-2">
                <h3 className="font-semibold text-gray-900">Румынский (RO)</h3>
              </div>

              <div className="space-y-2">
                <Label>Вопрос (RO)</Label>
                <Input
                  value={formData.question_ro}
                  onChange={(e) =>
                    setFormData({ ...formData, question_ro: e.target.value })
                  }
                  placeholder="De unde pot cumpăra bilete?"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Ответ (RO)</Label>
                <Textarea
                  value={formData.answer_ro}
                  onChange={(e) =>
                    setFormData({ ...formData, answer_ro: e.target.value })
                  }
                  placeholder="Biletele pot fi achiziționate..."
                  rows={4}
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="border-b pb-2">
                <h3 className="font-semibold text-gray-900">Русский (RU)</h3>
              </div>

              <div className="space-y-2">
                <Label>Вопрос (RU)</Label>
                <Input
                  value={formData.question_ru}
                  onChange={(e) =>
                    setFormData({ ...formData, question_ru: e.target.value })
                  }
                  placeholder="Где можно купить билеты?"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Ответ (RU)</Label>
                <Textarea
                  value={formData.answer_ru}
                  onChange={(e) =>
                    setFormData({ ...formData, answer_ru: e.target.value })
                  }
                  placeholder="Билеты можно приобрести..."
                  rows={4}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
              >
                Отмена
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Сохранение..." : "Добавить"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
