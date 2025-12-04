import { createClient } from "@/lib/supabase/server";
import { ProgramContent } from "./ProgramContent";

// Fallback данные на случай если база пустая
const fallbackEvents = [
  { id: 1, date: "7 August", day: 1, time: "16:00", artist: "DJ Warm-up Set", stage: "main", genre: "Electronic", is_headliner: false, year: "2025", sort_order: 1 },
  { id: 2, date: "7 August", day: 1, time: "17:00", artist: "Gândul Mâței", stage: "stage2", genre: "Folk Rock", is_headliner: false, year: "2025", sort_order: 2 },
  { id: 3, date: "7 August", day: 1, time: "18:00", artist: "Snails", stage: "main", genre: "Alternative", is_headliner: false, year: "2025", sort_order: 3 },
  { id: 4, date: "7 August", day: 1, time: "19:00", artist: "Vali Boghean Band", stage: "main", genre: "Balkan", is_headliner: true, year: "2025", sort_order: 4 },
  { id: 5, date: "7 August", day: 1, time: "20:30", artist: "La Caravane Passe", stage: "main", genre: "World Music", is_headliner: true, year: "2025", sort_order: 5 },
  { id: 6, date: "7 August", day: 1, time: "22:00", artist: "Subcarpați", stage: "main", genre: "Hip-Hop / Folk", is_headliner: true, year: "2025", sort_order: 6 },
  { id: 7, date: "7 August", day: 1, time: "23:30", artist: "Night DJ Set", stage: "electronic", genre: "Electronic", is_headliner: false, year: "2025", sort_order: 7 },
  { id: 8, date: "8 August", day: 2, time: "15:00", artist: "Workshop: Muzică tradițională", stage: "stage2", genre: "Workshop", is_headliner: false, year: "2025", sort_order: 1 },
  { id: 9, date: "8 August", day: 2, time: "16:30", artist: "Carla's Dreams (DJ Set)", stage: "electronic", genre: "Electronic", is_headliner: false, year: "2025", sort_order: 2 },
  { id: 10, date: "8 August", day: 2, time: "17:30", artist: "Tudor Ungureanu", stage: "main", genre: "Rock", is_headliner: false, year: "2025", sort_order: 3 },
  { id: 11, date: "8 August", day: 2, time: "19:00", artist: "Lupii lui Calancea", stage: "main", genre: "Folk Rock", is_headliner: true, year: "2025", sort_order: 4 },
  { id: 12, date: "8 August", day: 2, time: "20:30", artist: "Shantel", stage: "main", genre: "Balkan Beat", is_headliner: true, year: "2025", sort_order: 5 },
  { id: 13, date: "8 August", day: 2, time: "22:00", artist: "Zdob și Zdub", stage: "main", genre: "Rock / Folk", is_headliner: true, year: "2025", sort_order: 6 },
  { id: 14, date: "8 August", day: 2, time: "00:00", artist: "Afterparty DJ Set", stage: "electronic", genre: "Electronic", is_headliner: false, year: "2025", sort_order: 7 },
  { id: 15, date: "9 August", day: 3, time: "14:00", artist: "Family Concert", stage: "stage2", genre: "Family", is_headliner: false, year: "2025", sort_order: 1 },
  { id: 16, date: "9 August", day: 3, time: "16:00", artist: "Alternosfera", stage: "main", genre: "Alternative Rock", is_headliner: false, year: "2025", sort_order: 2 },
  { id: 17, date: "9 August", day: 3, time: "17:30", artist: "The Motans", stage: "main", genre: "Pop Rock", is_headliner: false, year: "2025", sort_order: 3 },
  { id: 18, date: "9 August", day: 3, time: "19:00", artist: "Cuibul", stage: "main", genre: "Rock", is_headliner: true, year: "2025", sort_order: 4 },
  { id: 19, date: "9 August", day: 3, time: "20:30", artist: "Dubioza Kolektiv", stage: "main", genre: "Balkan Punk", is_headliner: true, year: "2025", sort_order: 5 },
  { id: 20, date: "9 August", day: 3, time: "22:30", artist: "Grand Finale Show", stage: "main", genre: "Special", is_headliner: true, year: "2025", sort_order: 6 },
  { id: 21, date: "9 August", day: 3, time: "00:00", artist: "Closing Party", stage: "electronic", genre: "Electronic", is_headliner: false, year: "2025", sort_order: 7 },
];

export default async function ProgramPage() {
  const supabase = await createClient();

  // Получаем текущий год для фильтрации (или берём последний доступный)
  const currentYear = "2025";

  const { data: events } = await supabase
    .from("program_events")
    .select("*")
    .eq("year", currentYear)
    .order("day", { ascending: true })
    .order("sort_order", { ascending: true });

  // Используем данные из базы или fallback
  const eventsData = events && events.length > 0 ? events : fallbackEvents;

  return <ProgramContent events={eventsData} />;
}
