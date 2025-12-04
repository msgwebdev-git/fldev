import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function AddNewsButton() {
  return (
    <Button asChild>
      <Link href="/admin/news/new">
        <Plus className="w-4 h-4 mr-2" />
        Добавить
      </Link>
    </Button>
  );
}
