import { createClient } from "@supabase/supabase-js";

// Stateless anon client for public pages — does NOT read cookies, so pages
// using it stay eligible for ISR/static generation. Use this for read-only
// queries on public data (tickets, news, lineup, partners, program, etc).
// For admin / authenticated SSR continue to use `@/lib/supabase/server`.
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}
