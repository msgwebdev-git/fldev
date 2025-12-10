import { createClient } from "@/lib/supabase/server";
import { ActivitiesContent } from "./ActivitiesContent";

interface ActivitiesPageProps {
  params: Promise<{
    locale: string;
  }>;
}

interface ActivityDB {
  id: string;
  title_ru: string;
  title_ro: string;
  description_ru: string | null;
  description_ro: string | null;
  category: string;
  icon: string;
  location: string | null;
  time: string | null;
  is_highlight: boolean;
  year: string;
  sort_order: number;
}

interface Activity {
  id: string;
  title: string;
  description: string | null;
  category: string;
  icon: string;
  location: string | null;
  time: string | null;
  is_highlight: boolean;
  year: string;
  sort_order: number;
}

export default async function ActivitiesPage({ params }: ActivitiesPageProps) {
  const { locale } = await params;
  const supabase = await createClient();

  // Получаем текущий год для фильтрации
  const currentYear = "2025";

  const { data: activitiesDB } = await supabase
    .from("activities")
    .select("*")
    .eq("year", currentYear)
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true });

  // Преобразуем данные для отображения с учётом локали
  const activities: Activity[] = (activitiesDB || []).map((activity: ActivityDB) => ({
    id: activity.id,
    title: locale === "ru" ? activity.title_ru : activity.title_ro,
    description: locale === "ru" ? activity.description_ru : activity.description_ro,
    category: activity.category,
    icon: activity.icon,
    location: activity.location,
    time: activity.time,
    is_highlight: activity.is_highlight,
    year: activity.year,
    sort_order: activity.sort_order,
  }));

  return <ActivitiesContent activities={activities} />;
}
