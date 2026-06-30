import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@mcplease/model";

/** The typed Supabase client — `Database` is the generated schema. */
export type McpleaseClient = SupabaseClient<Database>;

/**
 * The browser client for the public + token-gated RPCs. mcplease has NO accounts, so there is no
 * session to persist — the anon key calls the `SECURITY DEFINER` RPCs straight, and the unguessable
 * UUID edit token (re-hashed inside the RPC), not a logged-in session, is the authorization on the
 * edit/delete path. The service-role key NEVER reaches here — only the `api/links.ts` create Pages
 * Function holds it. This is the one module that names the vendor (the seam law).
 */
export function createBrowserClient(url: string, anonKey: string): McpleaseClient {
  return createClient<Database>(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
