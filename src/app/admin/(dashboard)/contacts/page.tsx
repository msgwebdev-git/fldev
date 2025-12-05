import { createClient } from "@/lib/supabase/server";
import { ContactsTable } from "./ContactsTable";
import { SiteContactsTable } from "./SiteContactsTable";
import { AddContactButton } from "./AddContactButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function ContactsAdminPage() {
  const supabase = await createClient();

  const { data: contacts } = await supabase
    .from("contacts")
    .select("*")
    .order("sort_order", { ascending: true });

  const { data: siteContacts } = await supabase
    .from("site_contacts")
    .select("*")
    .order("key", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Контакты</h1>
          <p className="text-gray-500 mt-1">Управление контактами фестиваля</p>
        </div>
        <AddContactButton />
      </div>

      <Tabs defaultValue="departments" className="w-full">
        <TabsList className="bg-gray-100">
          <TabsTrigger value="departments">Отделы ({contacts?.length || 0})</TabsTrigger>
          <TabsTrigger value="site">Общие настройки ({siteContacts?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="departments" className="mt-4">
          <ContactsTable contacts={contacts ?? []} />
        </TabsContent>

        <TabsContent value="site" className="mt-4">
          <SiteContactsTable contacts={siteContacts ?? []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
