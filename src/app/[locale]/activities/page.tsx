import { createClient } from "@/lib/supabase/server";
import { ActivitiesContent } from "./ActivitiesContent";

// Fallback данные на случай если база пустая
const fallbackActivities = [
  // Развлечения
  { id: 1, title: "Концерты на главной сцене", description: "Выступления хедлайнеров и известных артистов на главной сцене фестиваля", category: "entertainment", icon: "music", location: "Scena Principală", time: null, is_highlight: true, year: "2025", sort_order: 1 },
  { id: 2, title: "Электронная зона", description: "DJ-сеты и электронная музыка всю ночь напролёт", category: "entertainment", icon: "sparkles", location: "Zona Electronică", time: "22:00 - 06:00", is_highlight: false, year: "2025", sort_order: 2 },
  { id: 3, title: "Арт-инсталляции", description: "Интерактивные художественные инсталляции по всей территории фестиваля", category: "entertainment", icon: "palette", location: null, time: null, is_highlight: false, year: "2025", sort_order: 3 },
  // Мастер-классы
  { id: 4, title: "Мастерская ремёсел", description: "Научись традиционным молдавским ремёслам от мастеров", category: "workshops", icon: "palette", location: "Zona Meșteșugurilor", time: "10:00 - 18:00", is_highlight: false, year: "2025", sort_order: 1 },
  { id: 5, title: "Музыкальный воркшоп", description: "Мастер-классы по игре на традиционных инструментах", category: "workshops", icon: "music", location: "Scena 2", time: "14:00 - 16:00", is_highlight: false, year: "2025", sort_order: 2 },
  { id: 6, title: "Фотозона", description: "Профессиональные фотозоны для ярких воспоминаний", category: "workshops", icon: "camera", location: null, time: null, is_highlight: false, year: "2025", sort_order: 3 },
  // Отдых
  { id: 7, title: "Кемпинг", description: "Комфортный кемпинг с видом на природу и звёздное небо", category: "relaxation", icon: "tent", location: null, time: null, is_highlight: true, year: "2025", sort_order: 1 },
  { id: 8, title: "Прогулки на природе", description: "Утренние экскурсии по живописным окрестностям", category: "relaxation", icon: "treePine", location: null, time: "09:00 - 12:00", is_highlight: false, year: "2025", sort_order: 2 },
  { id: 9, title: "Зона отдыха", description: "Тихое место для релаксации между концертами", category: "relaxation", icon: "heart", location: null, time: null, is_highlight: false, year: "2025", sort_order: 3 },
  // Еда
  { id: 10, title: "Фуд-корт", description: "Разнообразие кухонь мира и местные деликатесы", category: "food", icon: "utensils", location: null, time: "10:00 - 02:00", is_highlight: true, year: "2025", sort_order: 1 },
  { id: 11, title: "Молдавская кухня", description: "Традиционные молдавские блюда от лучших поваров", category: "food", icon: "utensils", location: null, time: null, is_highlight: false, year: "2025", sort_order: 2 },
  { id: 12, title: "Бар-зона", description: "Крафтовое пиво, вино и коктейли", category: "food", icon: "sparkles", location: null, time: "12:00 - 04:00", is_highlight: false, year: "2025", sort_order: 3 },
  // Семья
  { id: 13, title: "Детская зона", description: "Безопасное и весёлое пространство для детей всех возрастов", category: "family", icon: "users", location: "Zona Familiei", time: "10:00 - 20:00", is_highlight: true, year: "2025", sort_order: 1 },
  { id: 14, title: "Семейные активности", description: "Игры и развлечения для всей семьи", category: "family", icon: "heart", location: null, time: null, is_highlight: false, year: "2025", sort_order: 2 },
  { id: 15, title: "Творческие мастер-классы", description: "Рисование, лепка и другие занятия для детей", category: "family", icon: "palette", location: null, time: "11:00 - 17:00", is_highlight: false, year: "2025", sort_order: 3 },
];

export default async function ActivitiesPage() {
  const supabase = await createClient();

  // Получаем текущий год для фильтрации
  const currentYear = "2025";

  const { data: activities } = await supabase
    .from("activities")
    .select("*")
    .eq("year", currentYear)
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true });

  // Используем данные из базы или fallback
  const activitiesData = activities && activities.length > 0 ? activities : fallbackActivities;

  return <ActivitiesContent activities={activitiesData} />;
}
