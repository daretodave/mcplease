// The links domain API — the whole vocabulary the rest of the app knows about persistence. App code,
// components, and the edge call `createData(client).links.*`; they never name the vendor, a table, or a
// raw column. Each method is a thin, typed wrapper over one SECURITY DEFINER RPC, mapping the snake_case
// row shape to the camelCase domain shape. Authorization on the edit/delete path is the UUID edit token,
// re-hashed and verified inside the RPC — there is no session here.

import type { Database, LinkKind, PublicLink } from "@mcplease/model";
import type { McpleaseClient } from "./client.js";

// The generated RPC arg types declare every `text` parameter as non-null `string`, even where the SQL
// accepts NULL — so the genuinely-optional create/update fields (an http link has no repo_url, a stdio
// link no server_url) need a cast at the one place that knows the vendor: here, the seam.
type RpcArgs<K extends keyof Database["public"]["Functions"]> =
  Database["public"]["Functions"][K]["Args"];

/** The fields a create accepts — the transport, its server fields, and the author copy. A null/blank
 *  `desiredSlug` mints a friendly one server-side. */
export interface CreateLinkInput {
  desiredSlug: string | null;
  kind: LinkKind;
  serverUrl: string | null;
  repoUrl: string | null;
  buildCmd: string | null;
  runTarget: string | null;
  name: string | null;
  description: string | null;
  tagline: string | null;
}

/** The fields an edit accepts — everything create does EXCEPT the transport (`kind` is immutable once
 *  set). */
export interface UpdateLinkInput {
  slug: string;
  serverUrl: string | null;
  repoUrl: string | null;
  buildCmd: string | null;
  runTarget: string | null;
  name: string | null;
  description: string | null;
  tagline: string | null;
}

/** What create returns: the (possibly minted) slug + the RAW edit token, shown to the author exactly
 *  once and never recoverable. */
export interface CreatedLink {
  slug: string;
  editToken: string;
}

/** The snake_case projection both read RPCs return. */
interface LinkRow {
  slug: string;
  kind: string;
  server_url: string | null;
  repo_url: string | null;
  build_cmd: string | null;
  run_target: string | null;
  name: string | null;
  description: string | null;
  tagline: string | null;
}

/** The whole persistence surface, behind one object. */
export interface LinksApi {
  /** Is this slug well-formed and free? Advisory (the DB unique index is the real arbiter). */
  slugAvailable(slug: string): Promise<boolean>;
  /** The public projection for a live slug, or null for an unknown/deleted one. */
  getPublic(slug: string): Promise<PublicLink | null>;
  /** The editable projection iff the token matches a live row, else null. */
  getForEdit(editToken: string): Promise<PublicLink | null>;
  /** Apply an edit (token-authorized); returns the updated projection, or null when unauthorized. */
  update(editToken: string, fields: UpdateLinkInput): Promise<PublicLink | null>;
  /** Soft-delete (token-authorized); returns whether a live row was removed. */
  remove(editToken: string): Promise<boolean>;
  /** Create a link (service-role path only). Returns the slug + the once-shown raw edit token. */
  create(input: CreateLinkInput): Promise<CreatedLink>;
}

export interface Data {
  links: LinksApi;
}

/** Map a snake_case RPC row to the camelCase public shape. */
function toPublicLink(row: LinkRow): PublicLink {
  return {
    slug: row.slug,
    kind: row.kind as LinkKind,
    serverUrl: row.server_url,
    repoUrl: row.repo_url,
    buildCmd: row.build_cmd,
    runTarget: row.run_target,
    name: row.name,
    description: row.description,
    tagline: row.tagline,
  };
}

/** Surface a Postgrest error as one thrown error type, so callers handle the seam uniformly. */
function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  if (res.data === null) throw new Error("data layer: unexpected empty response");
  return res.data;
}

/**
 * Build the domain API over a Supabase client. The browser passes its anon client (the public + token-
 * gated RPCs); the create edge passes a service-role client (`create_link` alone).
 */
export function createData(client: McpleaseClient): Data {
  return {
    links: {
      async slugAvailable(slug) {
        return unwrap(await client.rpc("slug_available", { candidate: slug }));
      },

      async getPublic(slug) {
        const rows = unwrap(await client.rpc("get_public_link", { want_slug: slug }));
        const row = rows[0];
        return row ? toPublicLink(row) : null;
      },

      async getForEdit(editToken) {
        const rows = unwrap(await client.rpc("get_link_for_edit", { token: editToken }));
        const row = rows[0];
        return row ? toPublicLink(row) : null;
      },

      async update(editToken, fields) {
        const rows = unwrap(
          await client.rpc("update_link", {
            token: editToken,
            new_slug: fields.slug,
            new_server_url: fields.serverUrl,
            new_repo_url: fields.repoUrl,
            new_build_cmd: fields.buildCmd,
            new_run_target: fields.runTarget,
            new_name: fields.name,
            new_description: fields.description,
            new_tagline: fields.tagline,
          } as RpcArgs<"update_link">),
        );
        const row = rows[0];
        return row ? toPublicLink(row) : null;
      },

      async remove(editToken) {
        return unwrap(await client.rpc("delete_link", { token: editToken }));
      },

      async create(input) {
        const rows = unwrap(
          await client.rpc("create_link", {
            desired_slug: input.desiredSlug,
            kind: input.kind,
            server_url: input.serverUrl,
            repo_url: input.repoUrl,
            build_cmd: input.buildCmd,
            run_target: input.runTarget,
            name: input.name,
            description: input.description,
            tagline: input.tagline,
          } as RpcArgs<"create_link">),
        );
        const row = rows[0];
        if (!row) throw new Error("create_link returned no row");
        return { slug: row.slug, editToken: row.edit_token };
      },
    },
  };
}
