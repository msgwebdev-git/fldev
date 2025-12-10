import { createClient } from "@/lib/supabase/server";
import { RulesContent, Rule } from "./RulesContent";

interface RulesPageProps {
  params: Promise<{
    locale: string;
  }>;
}

interface RuleDB {
  id: string;
  section_id: string;
  title_ru: string;
  title_ro: string;
  icon: string;
  keywords_ru: string[];
  keywords_ro: string[];
  content_ru: string[];
  content_ro: string[];
  sort_order: number;
  is_active: boolean;
}

// Quick access topics
const getQuickTopics = (locale: string) => {
  if (locale === "ru") {
    return [
      { keyword: "алкоголь", label: "Алкоголь" },
      { keyword: "еда", label: "Еда" },
      { keyword: "вода", label: "Вода" },
      { keyword: "дети", label: "Дети" },
      { keyword: "кемпинг", label: "Кемпинг" },
      { keyword: "парковка", label: "Парковка" },
      { keyword: "браслет", label: "Браслеты" },
      { keyword: "наркотики", label: "Наркотики" },
      { keyword: "дрон", label: "Дроны" },
      { keyword: "курение", label: "Курение" },
    ];
  }
  return [
    { keyword: "alcool", label: "Alcool" },
    { keyword: "mâncare", label: "Mâncare" },
    { keyword: "apă", label: "Apă" },
    { keyword: "copii", label: "Copii" },
    { keyword: "camping", label: "Camping" },
    { keyword: "parcare", label: "Parcare" },
    { keyword: "brățară", label: "Brățări" },
    { keyword: "droguri", label: "Droguri" },
    { keyword: "dronă", label: "Drone" },
    { keyword: "fumat", label: "Fumat" },
  ];
};

export default async function RulesPage({ params }: RulesPageProps) {
  const { locale } = await params;
  const supabase = await createClient();

  const { data: rulesDB } = await supabase
    .from("festival_rules")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  // Transform data for display based on locale
  const rules: Rule[] = (rulesDB || []).map((rule: RuleDB) => ({
    id: rule.id,
    section_id: rule.section_id,
    title: locale === "ru" ? rule.title_ru : rule.title_ro,
    icon: rule.icon,
    keywords: locale === "ru" ? rule.keywords_ru : rule.keywords_ro,
    content: locale === "ru" ? rule.content_ru : rule.content_ro,
    sort_order: rule.sort_order,
  }));

  const quickTopics = getQuickTopics(locale);

  return <RulesContent rules={rules} quickTopics={quickTopics} />;
}
