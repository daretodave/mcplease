import { createBrowserClient, createData } from "@mcplease/data";
import { env } from "./env";

// The app's single data handle. The browser builds an anon client from the public env and talks to the
// SECURITY DEFINER RPCs through the domain API — `data.links.*`. No table names, no vendor, no session;
// the create path's service-role client lives only at the edge, never here.
export const data = createData(createBrowserClient(env.supabaseUrl, env.supabaseAnonKey));
