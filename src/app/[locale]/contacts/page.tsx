import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { ContactsContent } from "./ContactsContent";

export default async function ContactsPage() {
  const t = await getTranslations("Contacts");
  const supabase = await createClient();

  // Загружаем контакты отделов
  const { data: contacts } = await supabase
    .from("contacts")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  // Загружаем общие контакты (адрес, соц. сети и т.д.)
  const { data: siteContacts } = await supabase
    .from("site_contacts")
    .select("*");

  // Преобразуем в объект для удобного доступа
  const siteContactsMap: Record<string, string> = {};
  siteContacts?.forEach((item) => {
    siteContactsMap[item.key] = item.value;
  });

  return (
    <ContactsContent
      contacts={contacts ?? []}
      siteContacts={siteContactsMap}
    />
  );
}
