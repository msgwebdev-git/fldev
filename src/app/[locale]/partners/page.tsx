import { createClient } from "@/lib/supabase/server";
import { PartnersContent } from "./PartnersContent";

// Fallback данные на случай если база пустая
const fallbackPartners = [
  { id: 1, name: "Ministerul Culturii", logo_url: "https://picsum.photos/seed/ministry/400/200", website: "https://example.com", category: "patronage", year: "2025", sort_order: 1 },
  { id: 2, name: "Primăria Chișinău", logo_url: "https://picsum.photos/seed/primaria/400/200", website: "https://example.com", category: "patronage", year: "2025", sort_order: 2 },
  { id: 3, name: "Moldova Agroindbank", logo_url: "https://picsum.photos/seed/maib/400/200", website: "https://example.com", category: "generalPartner", year: "2025", sort_order: 1 },
  { id: 4, name: "Orange Moldova", logo_url: "https://picsum.photos/seed/orange/400/200", website: "https://example.com", category: "partners", year: "2025", sort_order: 1 },
  { id: 5, name: "Moldcell", logo_url: "https://picsum.photos/seed/moldcell/400/200", website: "https://example.com", category: "partners", year: "2025", sort_order: 2 },
  { id: 6, name: "Efes Vitanta", logo_url: "https://picsum.photos/seed/efes/400/200", website: "https://example.com", category: "partners", year: "2025", sort_order: 3 },
  { id: 7, name: "Coca-Cola", logo_url: "https://picsum.photos/seed/coca/400/200", website: "https://example.com", category: "partners", year: "2025", sort_order: 4 },
  { id: 8, name: "Purcari", logo_url: "https://picsum.photos/seed/purcari/400/200", website: "https://example.com", category: "partners", year: "2025", sort_order: 5 },
  { id: 9, name: "Cricova", logo_url: "https://picsum.photos/seed/cricova/400/200", website: "https://example.com", category: "partners", year: "2025", sort_order: 6 },
  { id: 10, name: "PRO TV Chișinău", logo_url: "https://picsum.photos/seed/protv/400/200", website: "https://example.com", category: "generalMediaPartner", year: "2025", sort_order: 1 },
  { id: 11, name: "Radio Noroc", logo_url: "https://picsum.photos/seed/noroc/400/200", website: "https://example.com", category: "generalMediaPartner", year: "2025", sort_order: 2 },
  { id: 12, name: "Jurnal TV", logo_url: "https://picsum.photos/seed/jurnal/400/200", website: "https://example.com", category: "mediaPartners", year: "2025", sort_order: 1 },
  { id: 13, name: "TV8", logo_url: "https://picsum.photos/seed/tv8/400/200", website: "https://example.com", category: "mediaPartners", year: "2025", sort_order: 2 },
  { id: 14, name: "Publika TV", logo_url: "https://picsum.photos/seed/publika/400/200", website: "https://example.com", category: "mediaPartners", year: "2025", sort_order: 3 },
  { id: 15, name: "Radio Kiss FM", logo_url: "https://picsum.photos/seed/kiss/400/200", website: "https://example.com", category: "mediaPartners", year: "2025", sort_order: 4 },
  { id: 16, name: "Locals.md", logo_url: "https://picsum.photos/seed/locals/400/200", website: "https://example.com", category: "mediaPartners", year: "2025", sort_order: 5 },
  { id: 17, name: "Afisha.md", logo_url: "https://picsum.photos/seed/afisha/400/200", website: "https://example.com", category: "mediaPartners", year: "2025", sort_order: 6 },
  { id: 18, name: "#diez", logo_url: "https://picsum.photos/seed/diez/400/200", website: "https://example.com", category: "mediaPartners", year: "2025", sort_order: 7 },
  { id: 19, name: "Zugo.md", logo_url: "https://picsum.photos/seed/zugo/400/200", website: "https://example.com", category: "mediaPartners", year: "2025", sort_order: 8 },
];

export default async function PartnersPage() {
  const supabase = await createClient();

  // Получаем текущий год для фильтрации
  const currentYear = "2025";

  const { data: partners } = await supabase
    .from("partners")
    .select("*")
    .eq("year", currentYear)
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true });

  // Используем данные из базы или fallback
  const partnersData = partners && partners.length > 0 ? partners : fallbackPartners;

  return <PartnersContent partners={partnersData} />;
}
