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

/**
 * The service-role client — held by the `api/links.ts` create Pages Function ALONE, to call the
 * `create_link` RPC after it verifies Turnstile. The service-role key bypasses RLS, so it must never
 * reach the browser; this factory exists so the one privileged call site is explicit and greppable. Like
 * the browser client it persists no session (there are no accounts).
 */
export function createServiceClient(url: string, serviceRoleKey: string): McpleaseClient {
  return createClient<Database>(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
