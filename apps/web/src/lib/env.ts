// The public runtime config, read from the build-time env (import.meta.env). Every value here is
// public by design — the anon key is RLS-protected, the sitekey + measurement id are meant to ship in
// the client. Secrets never reach the browser; the edge create function holds them.

export interface PublicEnv {
  supabaseUrl: string;
  supabaseAnonKey: string;
  turnstileSitekey: string;
  ga4MeasurementId: string;
}

/** Read a VITE_ key, defaulting an unset value to the empty string (which keeps the feature off). */
export function read(key: string): string {
  return (import.meta.env as Record<string, string | undefined>)[key] ?? "";
}

export const env: PublicEnv = {
  supabaseUrl: read("VITE_SUPABASE_URL"),
  supabaseAnonKey: read("VITE_SUPABASE_ANON_KEY"),
  turnstileSitekey: read("VITE_TURNSTILE_SITEKEY"),
  ga4MeasurementId: read("VITE_GA4_MEASUREMENT_ID"),
};
