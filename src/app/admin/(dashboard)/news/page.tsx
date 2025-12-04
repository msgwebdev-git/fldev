import { createClient } from "@/lib/supabase/server";
import { NewsTable } from "./NewsTable";
import { AddNewsButton } from "./AddNewsButton";

export default async function NewsPage() {
  const supabase = await createClient();

  const { data: news } = await supabase
    .from("news")
    .select("*")
    .order("date", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Новости</h1>
          <p className="text-gray-500 mt-1">Управление новостями сайта</p>
        </div>
        <AddNewsButton />
      </div>

      <NewsTable news={news ?? []} />
    </div>
  );
}
