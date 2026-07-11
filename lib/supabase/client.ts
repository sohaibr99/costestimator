import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function getSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  if (!browserClient) {
    browserClient = createBrowserClient<Database>(url, anonKey, {
      cookieOptions: {
        // This tells the browser to keep you logged in for 30 days (in seconds)
        maxAge: 2592000,
        path: "/",
        sameSite: "lax",
      },
    });
  }

  return browserClient;
}
