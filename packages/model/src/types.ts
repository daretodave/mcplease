// Pure domain shapes shared by the seam, the SPA, and the edge functions. No runtime, no vendor —
// just the types. (The generated Supabase row types live in database.types.ts; this file is the
// hand-written public vocabulary on top of them.)

import type { LinkKind } from "./link-kind.js";

/**
 * The public projection of a link — what `get_public_link(slug)` returns and the share page renders.
 * It NEVER carries `edit_token_hash` (or any token): possession of the UUID edit link is the only
 * authorization, and it lives outside this shape. The transport-specific fields are nullable — `http`
 * fills `serverUrl`; `stdio` fills the `repoUrl`/`buildCmd`/`runTarget` trio.
 */
export interface PublicLink {
  slug: string;
  kind: LinkKind;
  /** http transport — the remote server URL */
  serverUrl: string | null;
  /** stdio transport — the clone/build/run trio */
  repoUrl: string | null;
  buildCmd: string | null;
  runTarget: string | null;
  /** display title */
  name: string | null;
  /** SEO/unfurl text */
  description: string | null;
  /** the OG-card line, <= 70 chars */
  tagline: string | null;
}
